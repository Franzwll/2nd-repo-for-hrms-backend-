<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Inlines employee_learning_attempts into employee_learning.attempts_json
     * (attempts ordered by attempt_id), drops the foreign keys, and drops the
     * child table. Original rows are snapshotted in system_settings so the
     * down() migration can restore the exact table, rows and auto-increment.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employee_learning_attempts')) {
            return;
        }

        // 1. Add attempts_json column to employee_learning if missing
        if (Schema::hasTable('employee_learning') && ! Schema::hasColumn('employee_learning', 'attempts_json')) {
            Schema::table('employee_learning', function (Blueprint $table) {
                $table->longText('attempts_json')->nullable()->after('reading_completed_at');
            });
        }

        // 2. Fetch all attempts, grouped by (employee_id, course_id)
        $attempts = DB::table('employee_learning_attempts')->orderBy('attempt_id')->get();

        // 3. Save a rollback snapshot to system_settings
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.employee_learning_attempts'],
                ['setting_value' => json_encode($attempts->map(fn ($a) => (array) $a)->all()), 'updated_at' => now()]
            );
        }

        $byPair = [];
        foreach ($attempts as $a) {
            $key = $a->employee_id . ':' . $a->course_id;
            $byPair[$key][] = [
                'attempt_id'    => (int) $a->attempt_id,
                'employee_id'   => (int) $a->employee_id,
                'course_id'     => (int) $a->course_id,
                'score'         => (int) $a->score,
                'correct_count' => (int) $a->correct_count,
                'total_count'   => (int) $a->total_count,
                'passed'        => (bool) $a->passed,
                'answers_json'  => $a->answers_json !== null ? (string) $a->answers_json : null,
                'submitted_at'  => (string) $a->submitted_at,
            ];
        }

        $createdLearningIds = [];

        foreach ($byPair as $key => $pairAttempts) {
            [$empId, $courseId] = array_map('intval', explode(':', $key));

            $learning = DB::table('employee_learning')
                ->where('employee_id', $empId)
                ->where('course_id', $courseId)
                ->first(['employee_learning_id']);

            $learningId = $learning?->employee_learning_id;

            // Attempts normally have a learning row; if not, create a synthetic
            // one (reported as In Progress) so no attempt data is ever lost.
            if (! $learningId) {
                $learningId = DB::table('employee_learning')->insertGetId([
                    'employee_id'   => $empId,
                    'course_id'     => $courseId,
                    'status'        => 'In Progress',
                    'score'         => null,
                    'assigned_date' => now()->toDateString(),
                ]);
                $createdLearningIds[] = (int) $learningId;
            }

            DB::table('employee_learning')
                ->where('employee_learning_id', $learningId)
                ->update(['attempts_json' => json_encode($pairAttempts)]);
        }

        // Track synthetic learning rows so down() can remove them again.
        if (! empty($createdLearningIds) && Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.employee_learning_created_rows'],
                ['setting_value' => json_encode($createdLearningIds), 'updated_at' => now()]
            );
        }

        // 4. Drop foreign keys, then the child table
        Schema::table('employee_learning_attempts', function (Blueprint $table) {
            $table->dropForeign('fk_attempts_employee_id');
            $table->dropForeign('fk_attempts_course_id');
        });
        Schema::dropIfExists('employee_learning_attempts');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates employee_learning_attempts (structure, indexes and foreign
     * keys), restores every original row with its attempt_id, drops the
     * attempts_json column, and removes any synthetic employee_learning rows
     * created by up().
     */
    public function down(): void
    {
        // 1. Recreate employee_learning_attempts
        if (! Schema::hasTable('employee_learning_attempts')) {
            Schema::create('employee_learning_attempts', function (Blueprint $table) {
                $table->id('attempt_id');
                $table->unsignedBigInteger('employee_id');
                $table->unsignedBigInteger('course_id');
                $table->unsignedTinyInteger('score');              // 0–100
                $table->unsignedSmallInteger('correct_count');
                $table->unsignedSmallInteger('total_count');
                $table->boolean('passed');
                $table->json('answers_json')->nullable();
                $table->timestamp('submitted_at')->useCurrent();

                $table->index(['employee_id', 'course_id'], 'idx_attempts_emp_course');

                $table->foreign('employee_id', 'fk_attempts_employee_id')
                      ->references('employee_id')->on('employees')->onDelete('cascade');
                $table->foreign('course_id', 'fk_attempts_course_id')
                      ->references('course_id')->on('learning_courses')->onDelete('cascade');
            });
        }

        // 2. Restore rows from system_settings backup (preferred) or from
        //    each learning row's attempts_json (fallback)
        $backupRows = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')
                ->where('setting_key', 'migration_backup.employee_learning_attempts')
                ->first();
            if ($row && ! empty($row->setting_value)) {
                $backupRows = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;

        if (is_array($backupRows) && ! empty($backupRows)) {
            foreach ($backupRows as $r) {
                DB::table('employee_learning_attempts')->insert([
                    'attempt_id'    => $r['attempt_id'],
                    'employee_id'   => $r['employee_id'],
                    'course_id'     => $r['course_id'],
                    'score'         => $r['score'],
                    'correct_count' => $r['correct_count'],
                    'total_count'   => $r['total_count'],
                    'passed'        => (int) $r['passed'],
                    'answers_json'  => $r['answers_json'],
                    'submitted_at'  => $r['submitted_at'],
                ]);
                $maxId = max($maxId, (int) $r['attempt_id']);
            }
        } elseif (Schema::hasTable('employee_learning') && Schema::hasColumn('employee_learning', 'attempts_json')) {
            $learningRows = DB::table('employee_learning')->whereNotNull('attempts_json')->get();

            foreach ($learningRows as $lr) {
                $items = json_decode((string) ($lr->attempts_json ?? ''), true) ?: [];
                foreach ($items as $item) {
                    $insertData = [
                        'employee_id'   => (int) ($item['employee_id'] ?? $lr->employee_id),
                        'course_id'     => (int) ($item['course_id'] ?? $lr->course_id),
                        'score'         => (int) ($item['score'] ?? 0),
                        'correct_count' => (int) ($item['correct_count'] ?? 0),
                        'total_count'   => (int) ($item['total_count'] ?? 0),
                        'passed'        => (int) ! empty($item['passed']),
                        'answers_json'  => $item['answers_json'] ?? null,
                        'submitted_at'  => $item['submitted_at'] ?? now(),
                    ];
                    if (! empty($item['attempt_id'])) {
                        $insertData['attempt_id'] = (int) $item['attempt_id'];
                        $maxId = max($maxId, (int) $item['attempt_id']);
                    }
                    DB::table('employee_learning_attempts')->insert($insertData);
                }
            }
        }

        if ($maxId > 0) {
            DB::statement('ALTER TABLE employee_learning_attempts AUTO_INCREMENT = ' . ($maxId + 1));
        }

        // 3. Drop attempts_json from employee_learning
        if (Schema::hasTable('employee_learning') && Schema::hasColumn('employee_learning', 'attempts_json')) {
            Schema::table('employee_learning', function (Blueprint $table) {
                $table->dropColumn('attempts_json');
            });
        }

        // 4. Remove synthetic employee_learning rows created by up()
        if (Schema::hasTable('system_settings')) {
            $created = DB::table('system_settings')
                ->where('setting_key', 'migration_backup.employee_learning_created_rows')
                ->value('setting_value');
            if ($created) {
                foreach ((json_decode($created, true) ?: []) as $id) {
                    DB::table('employee_learning')->where('employee_learning_id', (int) $id)->delete();
                }
            }
        }

        // 5. Clean up the backup keys
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->whereIn('setting_key', [
                    'migration_backup.employee_learning_attempts',
                    'migration_backup.employee_learning_created_rows',
                ])
                ->delete();
        }
    }
};
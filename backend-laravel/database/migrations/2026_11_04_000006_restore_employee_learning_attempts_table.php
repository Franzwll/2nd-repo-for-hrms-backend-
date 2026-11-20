<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Decision record 3f: restore employee_learning_attempts from the live
     * attempts_json column. The backup snapshot only fills missing rows.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employee_learning')) {
            return;
        }

        if (! Schema::hasTable('employee_learning_attempts')) {
            Schema::create('employee_learning_attempts', function (Blueprint $table) {
                $table->id('attempt_id');
                $table->unsignedBigInteger('employee_id');
                $table->unsignedBigInteger('course_id');
                $table->unsignedTinyInteger('score');
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

        $inserted = 0;

        foreach (DB::table('employee_learning')->whereNotNull('attempts_json')->orderBy('employee_learning_id')->get() as $learning) {
            $decoded = json_decode((string) $learning->attempts_json, true);
            if (! is_array($decoded)) {
                continue;
            }

            foreach ($decoded as $attempt) {
                if (! is_array($attempt)) {
                    continue;
                }

                $row = [
                    'employee_id' => (int) ($attempt['employee_id'] ?? $learning->employee_id),
                    'course_id' => (int) ($attempt['course_id'] ?? $learning->course_id),
                    'score' => max(0, min(100, (int) ($attempt['score'] ?? 0))),
                    'correct_count' => max(0, (int) ($attempt['correct_count'] ?? 0)),
                    'total_count' => max(0, (int) ($attempt['total_count'] ?? 0)),
                    'passed' => (int) ! empty($attempt['passed']),
                    'answers_json' => $this->answersJson($attempt['answers_json'] ?? null),
                    'submitted_at' => $attempt['submitted_at'] ?? now(),
                ];

                $id = (int) ($attempt['attempt_id'] ?? 0);
                if ($id > 0) {
                    DB::table('employee_learning_attempts')->updateOrInsert(
                        ['attempt_id' => $id],
                        $row
                    );
                } else {
                    DB::table('employee_learning_attempts')->insert($row);
                }
                $inserted++;
            }
        }

        if ($inserted === 0) {
            foreach ($this->backupAttempts() as $row) {
                DB::table('employee_learning_attempts')->updateOrInsert(
                    ['attempt_id' => $row['attempt_id']],
                    $row
                );
            }
        }

        $maxId = (int) DB::table('employee_learning_attempts')->max('attempt_id');
        if ($maxId > 0) {
            DB::statement('ALTER TABLE `employee_learning_attempts` AUTO_INCREMENT = ' . ($maxId + 1));
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('employee_learning_attempts')) {
            return;
        }

        if (Schema::hasTable('employee_learning')) {
            $byPair = DB::table('employee_learning_attempts')
                ->orderBy('attempt_id')
                ->get()
                ->groupBy(fn ($row) => $row->employee_id . ':' . $row->course_id);

            foreach ($byPair as $key => $rows) {
                [$employeeId, $courseId] = array_map('intval', explode(':', $key));

                $attempts = $rows->map(fn ($row) => [
                    'attempt_id' => (int) $row->attempt_id,
                    'employee_id' => (int) $row->employee_id,
                    'course_id' => (int) $row->course_id,
                    'score' => (int) $row->score,
                    'correct_count' => (int) $row->correct_count,
                    'total_count' => (int) $row->total_count,
                    'passed' => (bool) $row->passed,
                    'answers_json' => $row->answers_json,
                    'submitted_at' => (string) $row->submitted_at,
                ])->values()->all();

                $learningId = DB::table('employee_learning')
                    ->where('employee_id', $employeeId)
                    ->where('course_id', $courseId)
                    ->value('employee_learning_id');

                if (! $learningId) {
                    $learningId = DB::table('employee_learning')->insertGetId([
                        'employee_id' => $employeeId,
                        'course_id' => $courseId,
                        'status' => 'In Progress',
                        'score' => null,
                        'assigned_date' => now()->toDateString(),
                    ]);
                }

                DB::table('employee_learning')
                    ->where('employee_learning_id', $learningId)
                    ->update(['attempts_json' => json_encode($attempts)]);
            }
        }

        Schema::dropIfExists('employee_learning_attempts');
    }

    private function answersJson(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        return json_decode((string) $value, true) === null ? null : (string) $value;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function backupAttempts(): array
    {
        if (! Schema::hasTable('system_settings')) {
            return [];
        }

        $raw = DB::table('system_settings')
            ->where('setting_key', 'migration_backup.employee_learning_attempts')
            ->value('setting_value');
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($decoded)) {
            return [];
        }

        $rows = [];
        foreach ($decoded as $row) {
            $id = (int) ($row['attempt_id'] ?? 0);
            $employeeId = (int) ($row['employee_id'] ?? 0);
            $courseId = (int) ($row['course_id'] ?? 0);
            if ($id > 0 && $employeeId > 0 && $courseId > 0) {
                $rows[$id] = [
                    'attempt_id' => $id,
                    'employee_id' => $employeeId,
                    'course_id' => $courseId,
                    'score' => max(0, min(100, (int) ($row['score'] ?? 0))),
                    'correct_count' => max(0, (int) ($row['correct_count'] ?? 0)),
                    'total_count' => max(0, (int) ($row['total_count'] ?? 0)),
                    'passed' => (int) ! empty($row['passed']),
                    'answers_json' => $this->answersJson($row['answers_json'] ?? null),
                    'submitted_at' => $row['submitted_at'] ?? now(),
                ];
            }
        }

        return $rows;
    }
};

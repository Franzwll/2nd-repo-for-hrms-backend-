<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Decision record 3e: restore recognition_reactions from the live
     * reactions_json map. The backup snapshot only fills missing rows.
     */
    public function up(): void
    {
        if (! Schema::hasTable('social_recognitions')) {
            return;
        }

        if (! Schema::hasTable('recognition_reactions')) {
            Schema::create('recognition_reactions', function (Blueprint $table) {
                $table->id('reaction_id');
                $table->unsignedBigInteger('recognition_id');
                $table->unsignedBigInteger('employee_id')->nullable();
                $table->string('reaction_type', 50);
                $table->timestamps();

                $table->unique(['recognition_id', 'employee_id', 'reaction_type'], 'rec_emp_react_unique');
                $table->foreign('recognition_id', 'recognition_reactions_recognition_id_foreign')
                    ->references('recognition_id')->on('social_recognitions')->onDelete('cascade');
                $table->foreign('employee_id', 'recognition_reactions_employee_id_foreign')
                    ->references('employee_id')->on('employees')->onDelete('cascade');
            });
        }

        $inserted = 0;

        $recognitions = DB::table('social_recognitions')
            ->whereNotNull('reactions_json')
            ->orderBy('recognition_id')
            ->get();

        foreach ($recognitions as $recognition) {
            $decoded = json_decode((string) $recognition->reactions_json, true);
            if (! is_array($decoded)) {
                continue;
            }

            foreach ($decoded as $employeeId => $types) {
                foreach ((array) $types as $type) {
                    $type = trim((string) $type);
                    if ($type === '') {
                        continue;
                    }

                    DB::table('recognition_reactions')->insertOrIgnore([
                        'recognition_id' => (int) $recognition->recognition_id,
                        'employee_id' => $employeeId === '' ? null : (int) $employeeId,
                        'reaction_type' => $type,
                        'created_at' => $recognition->created_at ?? now(),
                        'updated_at' => $recognition->updated_at ?? now(),
                    ]);
                    $inserted++;
                }
            }
        }

        if ($inserted === 0) {
            foreach ($this->backupReactions() as $row) {
                DB::table('recognition_reactions')->insertOrIgnore([
                    'reaction_id' => $row['reaction_id'],
                    'recognition_id' => $row['recognition_id'],
                    'employee_id' => $row['employee_id'],
                    'reaction_type' => $row['reaction_type'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at'],
                ]);
            }
        }

        $maxId = (int) DB::table('recognition_reactions')->max('reaction_id');
        if ($maxId > 0) {
            DB::statement('ALTER TABLE `recognition_reactions` AUTO_INCREMENT = ' . ($maxId + 1));
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('recognition_reactions')) {
            return;
        }

        if (Schema::hasTable('social_recognitions')) {
            $byRecognition = DB::table('recognition_reactions')
                ->orderBy('reaction_id')
                ->get()
                ->groupBy('recognition_id');

            foreach ($byRecognition as $recognitionId => $rows) {
                $byEmployee = [];
                foreach ($rows as $row) {
                    $key = (string) ($row->employee_id ?? '');
                    $byEmployee[$key][] = $row->reaction_type;
                }

                DB::table('social_recognitions')
                    ->where('recognition_id', $recognitionId)
                    ->update(['reactions_json' => json_encode($byEmployee)]);
            }
        }

        Schema::dropIfExists('recognition_reactions');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function backupReactions(): array
    {
        if (! Schema::hasTable('system_settings')) {
            return [];
        }

        $raw = DB::table('system_settings')
            ->where('setting_key', 'migration_backup.recognition_reactions')
            ->value('setting_value');
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($decoded)) {
            return [];
        }

        $rows = [];
        foreach ($decoded as $row) {
            $id = (int) ($row['reaction_id'] ?? 0);
            $recognitionId = (int) ($row['recognition_id'] ?? 0);
            if ($id > 0 && $recognitionId > 0) {
                $rows[$id] = [
                    'reaction_id' => $id,
                    'recognition_id' => $recognitionId,
                    'employee_id' => isset($row['employee_id']) ? (int) $row['employee_id'] : null,
                    'reaction_type' => (string) ($row['reaction_type'] ?? ''),
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ];
            }
        }

        return $rows;
    }
};

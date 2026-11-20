<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Inlines recognition_reactions into social_recognitions.reactions_json
     * (keyed by employee_id → [reaction_type, ...]) then drops the child table.
     */
    public function up(): void
    {
        if (! Schema::hasTable('recognition_reactions')) {
            return;
        }

        // 1. Add reactions_json column to social_recognitions if missing
        if (Schema::hasTable('social_recognitions') && ! Schema::hasColumn('social_recognitions', 'reactions_json')) {
            Schema::table('social_recognitions', function (Blueprint $table) {
                $table->longText('reactions_json')->nullable()->after('fire_count');
            });
        }

        // 2. Save original rows for rollback in system_settings
        $allReactions = DB::table('recognition_reactions')->orderBy('reaction_id')->get();
        $rawRows = $allReactions->map(fn ($r) => (array) $r)->all();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.recognition_reactions'],
                ['setting_value' => json_encode($rawRows), 'updated_at' => now()]
            );
        }

        // 3. Group reactions by recognition_id, then by employee_id → [types]
        $byRecognition = $allReactions->groupBy('recognition_id');

        foreach ($byRecognition as $recognitionId => $reactions) {
            // Build { "employee_id": ["clap","star"], ... }
            $byEmployee = $reactions->groupBy('employee_id')
                ->map(fn ($g) => $g->pluck('reaction_type')->all())
                ->all();

            DB::table('social_recognitions')
                ->where('recognition_id', $recognitionId)
                ->update(['reactions_json' => json_encode($byEmployee)]);
        }

        // 4. Drop the recognition_reactions table (FK + child table)
        Schema::table('recognition_reactions', function (Blueprint $table) {
            $table->dropForeign('recognition_reactions_recognition_id_foreign');
            $table->dropForeign('recognition_reactions_employee_id_foreign');
        });
        Schema::dropIfExists('recognition_reactions');
    }

    /**
     * Reverse the migrations.
     * Recreates recognition_reactions, restores all rows, then drops reactions_json.
     */
    public function down(): void
    {
        // 1. Recreate recognition_reactions table
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

        // 2. Restore rows from system_settings backup
        $backupRows = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')
                ->where('setting_key', 'migration_backup.recognition_reactions')
                ->first();
            if ($row && ! empty($row->setting_value)) {
                $backupRows = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;
        if (is_array($backupRows) && ! empty($backupRows)) {
            foreach ($backupRows as $r) {
                DB::table('recognition_reactions')->insert([
                    'reaction_id'    => $r['reaction_id'],
                    'recognition_id' => $r['recognition_id'],
                    'employee_id'    => $r['employee_id'],
                    'reaction_type'  => $r['reaction_type'],
                    'created_at'     => $r['created_at'],
                    'updated_at'     => $r['updated_at'],
                ]);
                if ($r['reaction_id'] > $maxId) {
                    $maxId = $r['reaction_id'];
                }
            }
        }

        if ($maxId > 0) {
            DB::statement("ALTER TABLE recognition_reactions AUTO_INCREMENT = " . ($maxId + 1));
        }

        // 3. Drop reactions_json from social_recognitions
        if (Schema::hasTable('social_recognitions') && Schema::hasColumn('social_recognitions', 'reactions_json')) {
            Schema::table('social_recognitions', function (Blueprint $table) {
                $table->dropColumn('reactions_json');
            });
        }

        // 4. Clean up backup key
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->where('setting_key', 'migration_backup.recognition_reactions')
                ->delete();
        }
    }
};


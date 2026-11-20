<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Merges applicant_screening_entities and applicant_screening_scores
     * into applicant_screenings (entities_json and score_breakdown_json).
     */
    public function up(): void
    {
        if (!Schema::hasTable('applicant_screening_entities') && !Schema::hasTable('applicant_screening_scores')) {
            return;
        }

        // 1. Collect all rows from both tables for full backup & restoration
        $allEntities = [];
        $entitiesByApplicant = [];
        if (Schema::hasTable('applicant_screening_entities')) {
            $rawEntities = DB::table('applicant_screening_entities')->orderBy('entity_id')->get();
            foreach ($rawEntities as $e) {
                $item = [
                    'entity_id'    => $e->entity_id,
                    'applicant_id' => $e->applicant_id,
                    'label'        => $e->label,
                    'value'        => $e->value,
                    'created_at'   => $e->created_at,
                ];
                $allEntities[] = $item;
                $entitiesByApplicant[$e->applicant_id][] = $item;
            }
        }

        $allScores = [];
        $scoresByApplicant = [];
        if (Schema::hasTable('applicant_screening_scores')) {
            $rawScores = DB::table('applicant_screening_scores')->orderBy('score_id')->get();
            foreach ($rawScores as $s) {
                $item = [
                    'score_id'     => $s->score_id,
                    'applicant_id' => $s->applicant_id,
                    'criterion'    => $s->criterion,
                    'score'        => (float) $s->score,
                    'created_at'   => $s->created_at,
                ];
                $allScores[] = $item;
                $scoresByApplicant[$s->applicant_id][] = $item;
            }
        }

        // Save rollback snapshot in system_settings
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.applicant_screening_entities'],
                ['setting_value' => json_encode($allEntities), 'updated_at' => now()]
            );
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.applicant_screening_scores'],
                ['setting_value' => json_encode($allScores), 'updated_at' => now()]
            );
        }

        // 2. Map weights and keys for standard score_breakdown_json
        $weights = [
            'Skills'                 => 0.40,
            'Work Experience'        => 0.30,
            'Educational Background' => 0.20,
            'Certifications'         => 0.10,
        ];
        $maxes = [
            'Skills'                 => 40,
            'Work Experience'        => 30,
            'Educational Background' => 20,
            'Certifications'         => 10,
        ];
        $keys = [
            'Skills'                 => 'skills',
            'Work Experience'        => 'experience',
            'Educational Background' => 'education',
            'Certifications'         => 'certifications',
        ];

        $allApplicantIds = array_unique(array_merge(
            array_keys($entitiesByApplicant),
            array_keys($scoresByApplicant)
        ));

        $createdScreeningIds = [];

        foreach ($allApplicantIds as $applicantId) {
            $applicant = DB::table('applicants')->where('applicant_id', $applicantId)->first();
            if (!$applicant) {
                continue;
            }

            $appEntities = $entitiesByApplicant[$applicantId] ?? [];
            $appScores   = $scoresByApplicant[$applicantId] ?? [];

            // Build structured score_breakdown_json object
            $breakdownObj = [];
            foreach ($appScores as $sc) {
                $crit = $sc['criterion'];
                $k    = $keys[$crit] ?? strtolower(str_replace(' ', '_', $crit));
                $w    = $weights[$crit] ?? 0.25;
                $m    = $maxes[$crit] ?? 25;
                $breakdownObj[$k] = [
                    'score_id'  => $sc['score_id'],
                    'criterion' => $crit,
                    'weight'    => $w,
                    'earned'    => $sc['score'],
                    'score'     => $sc['score'],
                    'max'       => $m,
                ];
            }

            $existing = DB::table('applicant_screenings')
                ->where('applicant_id', $applicantId)
                ->orderByDesc('screening_id')
                ->first();

            if ($existing) {
                $update = [];
                if (empty($existing->entities_json) && !empty($appEntities)) {
                    $update['entities_json'] = json_encode($appEntities);
                }
                if (empty($existing->score_breakdown_json) && !empty($breakdownObj)) {
                    $update['score_breakdown_json'] = json_encode($breakdownObj);
                }
                if (!empty($update)) {
                    $update['updated_at'] = now();
                    DB::table('applicant_screenings')
                        ->where('screening_id', $existing->screening_id)
                        ->update($update);
                }
            } else {
                $newId = DB::table('applicant_screenings')->insertGetId([
                    'applicant_id'             => $applicantId,
                    'job_post_id'              => $applicant->job_post_id,
                    'processing_status'        => 'PROCESSED',
                    'screening_result'         => $applicant->status,
                    'match_score'              => $applicant->fit_score,
                    'resume_match_score'       => $applicant->fit_score,
                    'score_breakdown_json'     => !empty($breakdownObj) ? json_encode($breakdownObj) : null,
                    'entities_json'            => !empty($appEntities) ? json_encode($appEntities) : null,
                    'missing_information_json' => json_encode([]),
                    'reasons_json'             => $applicant->flags_json ?? json_encode([]),
                    'processed_at'             => $applicant->applied_at ?? now(),
                    'created_at'               => $applicant->created_at ?? now(),
                    'updated_at'               => $applicant->updated_at ?? now(),
                ]);
                $createdScreeningIds[] = $newId;
            }
        }

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.created_screening_ids'],
                ['setting_value' => json_encode($createdScreeningIds), 'updated_at' => now()]
            );
        }

        // 3. Drop foreign keys and tables
        if (Schema::hasTable('applicant_screening_entities')) {
            Schema::table('applicant_screening_entities', function (Blueprint $table) {
                $table->dropForeign('fk_applicant_screening_entities_applicant_id');
            });
            Schema::drop('applicant_screening_entities');
        }

        if (Schema::hasTable('applicant_screening_scores')) {
            Schema::table('applicant_screening_scores', function (Blueprint $table) {
                $table->dropForeign('fk_applicant_screening_scores_applicant_id');
            });
            Schema::drop('applicant_screening_scores');
        }
    }

    /**
     * Reverse the migrations.
     * Recreates applicant_screening_entities and applicant_screening_scores,
     * restoring rows from the system_settings snapshot or applicant_screenings.
     */
    public function down(): void
    {
        // 1. Recreate applicant_screening_entities
        if (!Schema::hasTable('applicant_screening_entities')) {
            Schema::create('applicant_screening_entities', function (Blueprint $table) {
                $table->id('entity_id');
                $table->unsignedBigInteger('applicant_id');
                $table->string('label', 80);
                $table->text('value');
                $table->timestamp('created_at')->useCurrent();

                $table->index('applicant_id', 'idx_applicant_screening_entities_applicant_id');
                $table->foreign('applicant_id', 'fk_applicant_screening_entities_applicant_id')
                      ->references('applicant_id')->on('applicants')->onDelete('cascade');
            });
        }

        // 2. Recreate applicant_screening_scores
        if (!Schema::hasTable('applicant_screening_scores')) {
            Schema::create('applicant_screening_scores', function (Blueprint $table) {
                $table->id('score_id');
                $table->unsignedBigInteger('applicant_id');
                $table->string('criterion', 120);
                $table->decimal('score', 5, 2);
                $table->timestamp('created_at')->useCurrent();

                $table->index('applicant_id', 'idx_applicant_screening_scores_applicant_id');
                $table->foreign('applicant_id', 'fk_applicant_screening_scores_applicant_id')
                      ->references('applicant_id')->on('applicants')->onDelete('cascade');
            });
        }

        // 3. Restore data from system_settings backup if available
        $backupEntities = null;
        $backupScores   = null;
        $createdIds     = null;

        if (Schema::hasTable('system_settings')) {
            $eRow = DB::table('system_settings')->where('setting_key', 'migration_backup.applicant_screening_entities')->first();
            if ($eRow && !empty($eRow->setting_value)) {
                $backupEntities = json_decode($eRow->setting_value, true);
            }
            $sRow = DB::table('system_settings')->where('setting_key', 'migration_backup.applicant_screening_scores')->first();
            if ($sRow && !empty($sRow->setting_value)) {
                $backupScores = json_decode($sRow->setting_value, true);
            }
            $cRow = DB::table('system_settings')->where('setting_key', 'migration_backup.created_screening_ids')->first();
            if ($cRow && !empty($cRow->setting_value)) {
                $createdIds = json_decode($cRow->setting_value, true);
            }
        }

        $maxEntityId = 0;
        if (is_array($backupEntities) && !empty($backupEntities)) {
            foreach ($backupEntities as $e) {
                DB::table('applicant_screening_entities')->insert([
                    'entity_id'    => $e['entity_id'],
                    'applicant_id' => $e['applicant_id'],
                    'label'        => $e['label'],
                    'value'        => $e['value'],
                    'created_at'   => $e['created_at'],
                ]);
                if ($e['entity_id'] > $maxEntityId) {
                    $maxEntityId = $e['entity_id'];
                }
            }
        }

        $maxScoreId = 0;
        if (is_array($backupScores) && !empty($backupScores)) {
            foreach ($backupScores as $s) {
                DB::table('applicant_screening_scores')->insert([
                    'score_id'     => $s['score_id'],
                    'applicant_id' => $s['applicant_id'],
                    'criterion'    => $s['criterion'],
                    'score'        => $s['score'],
                    'created_at'   => $s['created_at'],
                ]);
                if ($s['score_id'] > $maxScoreId) {
                    $maxScoreId = $s['score_id'];
                }
            }
        }

        // Clean up screenings created by this migration
        if (is_array($createdIds) && !empty($createdIds) && Schema::hasTable('applicant_screenings')) {
            DB::table('applicant_screenings')->whereIn('screening_id', $createdIds)->delete();
        }

        // Clean up backup keys in system_settings
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->whereIn('setting_key', [
                'migration_backup.applicant_screening_entities',
                'migration_backup.applicant_screening_scores',
                'migration_backup.created_screening_ids',
            ])->delete();
        }

        if ($maxEntityId > 0) {
            $next = $maxEntityId + 1;
            DB::statement("ALTER TABLE applicant_screening_entities AUTO_INCREMENT = {$next}");
        }
        if ($maxScoreId > 0) {
            $next = $maxScoreId + 1;
            DB::statement("ALTER TABLE applicant_screening_scores AUTO_INCREMENT = {$next}");
        }
    }
};

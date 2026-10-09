<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * System-assisted final evaluation: store the backend-calculated
     * overall score + transparent breakdown, and the single alternative
     * position chosen for "For Another Position".
     *
     * Additive only — no existing columns are changed or removed.
     */
    public function up(): void
    {
        Schema::table('final_evaluations', function (Blueprint $table) {
            $table->decimal('overall_score', 5, 2)->nullable()->after('practical_test_result');
            $table->json('score_breakdown_json')->nullable()->after('overall_score');
            $table->unsignedBigInteger('recommended_job_post_id')->nullable()->after('recommendation');
            $table->string('recommended_position_title', 190)->nullable()->after('recommended_job_post_id');
        });

        // Allow NULL practical result when the position does not require it.
        // MySQL cannot drop a CHECK easily by name across versions, so attempt
        // both the legacy strict check and replace with a NULL-tolerant one.
        try {
            DB::statement('ALTER TABLE `final_evaluations` DROP CHECK `chk_final_evaluations_results`');
        } catch (\Throwable $e) {
            // Check constraint may not exist by that name on all installs — ignore.
        }
        try {
            DB::statement("ALTER TABLE `final_evaluations` ADD CONSTRAINT `chk_final_evaluations_results` CHECK (`interview_result` IN ('Passed', 'Failed') AND `assessment_test_result` IN ('Passed', 'Failed') AND (`practical_test_result` IS NULL OR `practical_test_result` IN ('Passed', 'Failed')))");
        } catch (\Throwable $e) {
            // If the DB does not support CHECK add (older MySQL), skip — gates are enforced in code.
        }
    }

    public function down(): void
    {
        Schema::table('final_evaluations', function (Blueprint $table) {
            $table->dropColumn(['overall_score', 'score_breakdown_json', 'recommended_job_post_id', 'recommended_position_title']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Interview assessment extensions:
     *  - comments_json: per-criterion comment (criterion => comment)
     *  - result: the assessor's explicit Passed / Failed verdict.
     * The existing `remarks` column is now presented as the
     * "Overall Evaluation" text in the UI.
     */
    public function up(): void
    {
        Schema::table('applicant_assessments', function (Blueprint $table) {
            $table->json('comments_json')->nullable()->after('scores_json');
            $table->string('result', 10)->nullable()->after('outcome');
        });

        DB::statement("ALTER TABLE `applicant_assessments` ADD CONSTRAINT `chk_applicant_assessments_result` CHECK (`result` IN ('Passed', 'Failed'))");
    }

    public function down(): void
    {
        $version = (string) DB::selectOne('SELECT VERSION() AS v')->v;
        $syntax = str_contains($version, 'MariaDB') ? 'DROP CONSTRAINT' : 'DROP CHECK';

        try {
            DB::statement("ALTER TABLE `applicant_assessments` {$syntax} `chk_applicant_assessments_result`");
        } catch (Throwable) {
            // Constraint may not exist on a fresh schema.
        }

        Schema::table('applicant_assessments', function (Blueprint $table) {
            $table->dropColumn(['comments_json', 'result']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Extends the applicant stage workflow with the evaluation pipeline:
     * Assessment Test → Practical Test (when required) → Final Evaluation.
     */
    public function up(): void
    {
        $this->dropStageCheck();
        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_stage` CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected', 'Accepted', 'Assessment Test', 'Practical Test', 'Final Evaluation'))");
    }

    public function down(): void
    {
        $this->dropStageCheck();
        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_stage` CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected', 'Accepted'))");
    }

    private function dropStageCheck(): void
    {
        $version = (string) DB::selectOne('SELECT VERSION() AS v')->v;
        $syntax = str_contains($version, 'MariaDB') ? 'DROP CONSTRAINT' : 'DROP CHECK';

        try {
            DB::statement("ALTER TABLE `applicants` {$syntax} `chk_applicants_stage`");
        } catch (Throwable) {
            // The constraint may not exist yet (fresh schema) — nothing to drop.
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->dropCheck('applicants', 'chk_applicants_stage');
        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_stage` CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected', 'Accepted'))");
    }

    public function down(): void
    {
        $this->dropCheck('applicants', 'chk_applicants_stage');
        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_stage` CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected'))");
    }

    private function dropCheck(string $table, string $name): void
    {
        $version = (string) DB::selectOne('SELECT VERSION() AS v')->v;
        $syntax = str_contains($version, 'MariaDB') ? 'DROP CONSTRAINT' : 'DROP CHECK';

        try {
            DB::statement("ALTER TABLE `{$table}` {$syntax} `{$name}`");
        } catch (Throwable) {
            // The constraint may not exist yet (fresh schema) — nothing to drop.
        }
    }
};
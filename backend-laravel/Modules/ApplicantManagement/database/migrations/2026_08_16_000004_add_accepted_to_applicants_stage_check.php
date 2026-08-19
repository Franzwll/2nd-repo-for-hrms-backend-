<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE `applicants` DROP CHECK `chk_applicants_stage`');
        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_stage` CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected', 'Accepted'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `applicants` DROP CHECK `chk_applicants_stage`');
        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_stage` CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected'))");
    }
};
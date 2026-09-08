<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->char('resume_hash', 64)->nullable()->after('resume_original_name');
            $table->index(['email', 'job_post_id', 'stage'], 'idx_applicants_email_job_stage');
            $table->index('resume_hash', 'idx_applicants_resume_hash');
        });
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropIndex('idx_applicants_email_job_stage');
            $table->dropIndex('idx_applicants_resume_hash');
            $table->dropColumn('resume_hash');
        });
    }
};

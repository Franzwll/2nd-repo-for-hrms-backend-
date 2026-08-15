<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicants', function (Blueprint $table) {
            $table->id('applicant_id');
            $table->string('applicant_code', 40)->unique();
            $table->unsignedBigInteger('job_post_id');
            $table->string('name', 160);
            $table->string('email', 190);
            $table->string('phone', 40)->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->decimal('fit_score', 5, 2)->nullable();
            $table->string('status', 30);
            $table->string('stage', 40);
            $table->string('source', 60)->nullable();
            $table->text('resume_file_path')->nullable();
            $table->text('summary')->nullable();
            $table->json('flags_json')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('job_post_id', 'idx_applicants_job_post_id');
            $table->index('status', 'idx_applicants_status');
            $table->index('stage', 'idx_applicants_stage');
            $table->index('applied_at', 'idx_applicants_applied_at');

            $table->foreign('job_post_id', 'fk_applicants_job_post_id')
                  ->references('job_post_id')->on('job_posts');
        });

        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_status` CHECK (`status` IN ('fit', 'other-role', 'credential', 'not-fit'))");
        DB::statement("ALTER TABLE `applicants` ADD CONSTRAINT `chk_applicants_stage` CHECK (`stage` IN ('Screened', 'Interview Scheduled', 'Assessed', 'Offer', 'Hired', 'Rejected'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};

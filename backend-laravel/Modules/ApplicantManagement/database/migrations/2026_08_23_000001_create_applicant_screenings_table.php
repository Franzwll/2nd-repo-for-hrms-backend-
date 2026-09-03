<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_screenings', function (Blueprint $table) {
            $table->id('screening_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('job_post_id');
            $table->string('processing_status', 30)->default('PENDING');
            $table->string('screening_result', 30)->nullable();
            $table->decimal('match_score', 5, 2)->nullable();
            $table->json('score_breakdown_json')->nullable();
            $table->longtext('profile_json')->nullable();
            $table->longtext('entities_json')->nullable();
            $table->longtext('missing_information_json')->nullable();
            $table->longtext('validation_json')->nullable();
            $table->longtext('alternative_job_json')->nullable();
            $table->longtext('reasons_json')->nullable();
            $table->longtext('model_info_json')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_applicant_screenings_applicant_id');
            $table->index('job_post_id', 'idx_applicant_screenings_job_post_id');
            $table->index('processing_status', 'idx_applicant_screenings_processing_status');

            $table->foreign('applicant_id', 'fk_applicant_screenings_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('job_post_id', 'fk_applicant_screenings_job_post_id')
                  ->references('job_post_id')->on('job_posts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_screenings');
    }
};

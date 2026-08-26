<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('screening_ground_truths', function (Blueprint $table) {
            $table->id('gt_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('job_post_id');
            $table->string('true_screening_result', 30);
            $table->decimal('true_qualification_score', 5, 2)->nullable();
            $table->json('true_missing_information_json')->nullable();
            $table->json('true_unrecognized_skills_json')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();

            $table->unique('applicant_id', 'uq_screening_ground_truths_applicant');

            $table->foreign('applicant_id', 'fk_screening_gt_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('job_post_id', 'fk_screening_gt_job_post_id')
                  ->references('job_post_id')->on('job_posts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('screening_ground_truths');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_assessments', function (Blueprint $table) {
            $table->id('assessment_id');
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('assessor_user_id')->nullable();
            $table->date('assessment_date');
            $table->json('scores_json')->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('outcome', 20);
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_applicant_assessments_applicant_id');
            $table->index('assessor_user_id', 'idx_applicant_assessments_assessor_user_id');

            $table->foreign('applicant_id', 'fk_applicant_assessments_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('assessor_user_id', 'fk_applicant_assessments_assessor_user_id')
                  ->references('system_user_id')->on('system_users');
        });

        DB::statement("ALTER TABLE `applicant_assessments` ADD CONSTRAINT `chk_applicant_assessments_outcome` CHECK (`outcome` IN ('Recommended', 'Hold', 'Not Recommended'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_assessments');
    }
};

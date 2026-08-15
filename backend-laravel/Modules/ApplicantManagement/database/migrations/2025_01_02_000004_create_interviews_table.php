<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->id('interview_id');
            $table->string('interview_code', 40)->unique();
            $table->unsignedBigInteger('applicant_id');
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->string('mode', 20);
            $table->unsignedBigInteger('interviewer_employee_id')->nullable();
            $table->string('interviewer_name', 160)->nullable();
            $table->string('status', 20);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('applicant_id', 'idx_interviews_applicant_id');
            $table->index('interviewer_employee_id', 'idx_interviews_interviewer_employee_id');
            $table->index('scheduled_date', 'idx_interviews_scheduled_date');

            $table->foreign('applicant_id', 'fk_interviews_applicant_id')
                  ->references('applicant_id')->on('applicants')->onDelete('cascade');
            $table->foreign('interviewer_employee_id', 'fk_interviews_interviewer_employee_id')
                  ->references('employee_id')->on('employees');
        });

        DB::statement("ALTER TABLE `interviews` ADD CONSTRAINT `chk_interviews_mode` CHECK (`mode` IN ('On-site', 'Virtual'))");
        DB::statement("ALTER TABLE `interviews` ADD CONSTRAINT `chk_interviews_status` CHECK (`status` IN ('Scheduled', 'Completed', 'No Show'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};

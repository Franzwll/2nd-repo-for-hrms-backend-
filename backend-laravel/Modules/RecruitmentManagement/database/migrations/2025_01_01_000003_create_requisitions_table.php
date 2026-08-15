<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requisitions', function (Blueprint $table) {
            $table->id('requisition_id');
            $table->string('requisition_code', 40)->unique();
            $table->unsignedBigInteger('position_id')->nullable();
            $table->string('position_title', 150)->nullable();
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('requested_by_user_id')->nullable();
            $table->integer('requested_count');
            $table->string('urgency', 20);
            $table->text('justification');
            $table->string('status', 20);
            $table->date('requested_at');
            $table->unsignedBigInteger('converted_job_post_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('position_id', 'idx_requisitions_position_id');
            $table->index('department_id', 'idx_requisitions_department_id');
            $table->index('requested_by_user_id', 'idx_requisitions_requested_by_user_id');
            $table->index('converted_job_post_id', 'idx_requisitions_converted_job_post_id');
            $table->index('status', 'idx_requisitions_status');
            $table->index('requested_at', 'idx_requisitions_requested_at');

            $table->foreign('position_id', 'fk_requisitions_position_id')
                  ->references('position_id')->on('positions');
            $table->foreign('department_id', 'fk_requisitions_department_id')
                  ->references('department_id')->on('departments');
            $table->foreign('requested_by_user_id', 'fk_requisitions_requested_by_user_id')
                  ->references('system_user_id')->on('system_users');
            $table->foreign('converted_job_post_id', 'fk_requisitions_converted_job_post_id')
                  ->references('job_post_id')->on('job_posts');
        });

        DB::statement("ALTER TABLE `requisitions` ADD CONSTRAINT `chk_requisitions_urgency` CHECK (`urgency` IN ('Normal', 'High', 'Urgent', 'Low'))");
        DB::statement("ALTER TABLE `requisitions` ADD CONSTRAINT `chk_requisitions_status` CHECK (`status` IN ('Pending', 'Done', 'Converted'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('requisitions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_requests', function (Blueprint $table) {
            $table->id('promotion_request_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('current_position_id')->nullable();
            $table->unsignedBigInteger('requested_position_id')->nullable();
            $table->unsignedBigInteger('requested_salary_grade_id')->nullable();
            $table->text('justification');
            $table->string('status', 30)->default('Pending');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_promo_req_employee');
            $table->index('status', 'idx_promo_req_status');

            $table->foreign('employee_id', 'fk_promo_req_employee')
                ->references('employee_id')->on('employees')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE `promotion_requests` ADD CONSTRAINT `chk_promo_req_status` CHECK (`status` IN ('Pending','Approved','Rejected','Returned'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_requests');
    }
};

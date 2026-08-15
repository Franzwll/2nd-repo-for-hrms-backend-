<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id('performance_review_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('review_type', 30);
            $table->date('review_period_start');
            $table->date('review_period_end');
            $table->date('review_date')->nullable();
            $table->integer('overall_rating')->nullable();
            $table->text('comments')->nullable();
            $table->string('status', 20)->default('draft');
            $table->unsignedBigInteger('reviewer_user_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_performance_reviews_employee_id');
            $table->index('status', 'idx_performance_reviews_status');
            $table->index('reviewer_user_id', 'idx_performance_reviews_reviewer_user_id');

            $table->foreign('employee_id', 'fk_performance_reviews_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('reviewer_user_id', 'fk_performance_reviews_reviewer_user_id')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
    }
};

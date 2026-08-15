<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hr3_recommendations', function (Blueprint $table) {
            $table->id('recommendation_id');
            $table->unsignedBigInteger('employee_id');
            $table->string('recommendation_type', 50);
            $table->string('recommendation_status', 20);
            $table->text('details')->nullable();
            $table->date('recommended_at')->nullable();
            $table->unsignedBigInteger('recommended_by_user_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('employee_id', 'idx_hr3_recommendations_employee_id');
            $table->index('recommendation_status', 'idx_hr3_recommendations_recommendation_status');
            $table->index('recommended_by_user_id', 'idx_hr3_recommendations_recommended_by_user_id');

            $table->foreign('employee_id', 'fk_hr3_recommendations_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('recommended_by_user_id', 'fk_hr3_recommendations_recommended_by_user_id')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hr3_recommendations');
    }
};

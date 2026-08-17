<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->dropForeign('fk_employee_onboarding_items_employee_id');
        });

        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id')->nullable()->change();
            $table->foreign('employee_id', 'fk_employee_onboarding_items_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->dropForeign('fk_employee_onboarding_items_employee_id');
        });

        Schema::table('employee_onboarding_items', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_id')->nullable(false)->change();
            $table->foreign('employee_id', 'fk_employee_onboarding_items_employee_id')
                  ->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }
};
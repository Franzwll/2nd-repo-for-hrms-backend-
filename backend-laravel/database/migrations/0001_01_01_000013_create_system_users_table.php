<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_users', function (Blueprint $table) {
            $table->id('system_user_id');
            $table->string('username', 100)->unique();
            $table->string('email', 190)->unique();
            $table->string('password_hash', 255);
            $table->string('full_name', 160)->nullable();
            $table->string('department_name', 120)->nullable();
            $table->unsignedBigInteger('employee_id')->unique()->nullable();
            $table->unsignedBigInteger('role_id');
            $table->string('status', 20);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('role_id', 'idx_system_users_role_id');
            $table->index('status', 'idx_system_users_status');

            $table->foreign('employee_id', 'fk_system_users_employee_id')
                  ->references('employee_id')->on('employees');
            $table->foreign('role_id', 'fk_system_users_role_id')
                  ->references('role_id')->on('system_roles');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_users');
    }
};

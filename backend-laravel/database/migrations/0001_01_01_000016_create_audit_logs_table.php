<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id('audit_log_id');
            $table->unsignedBigInteger('system_user_id')->nullable();
            $table->string('actor_role', 50)->nullable();
            $table->string('actor_department', 120)->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->string('action', 255);
            $table->string('module_name', 100);
            $table->string('target_type', 100)->nullable();
            $table->string('target_id', 100)->nullable();
            $table->text('details')->nullable();
            $table->string('severity', 20);
            $table->string('ip_address', 45)->nullable();
            $table->string('device_info', 255)->nullable();

            $table->index('system_user_id', 'idx_audit_logs_system_user_id');
            $table->index('occurred_at', 'idx_audit_logs_occurred_at');
            $table->index('module_name', 'idx_audit_logs_module_name');
            $table->index('severity', 'idx_audit_logs_severity');

            $table->foreign('system_user_id', 'fk_audit_logs_system_user_id')
                  ->references('system_user_id')->on('system_users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

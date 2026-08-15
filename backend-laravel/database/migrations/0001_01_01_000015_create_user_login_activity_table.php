<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_login_activity', function (Blueprint $table) {
            $table->id('login_activity_id');
            $table->unsignedBigInteger('system_user_id');
            $table->timestamp('login_at')->useCurrent();
            $table->string('ip_address', 45)->nullable();
            $table->string('device_info', 255)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('status', 20)->default('success');

            $table->index('system_user_id', 'idx_user_login_activity_system_user_id');
            $table->index('login_at', 'idx_user_login_activity_login_at');
            $table->index('status', 'idx_user_login_activity_status');

            $table->foreign('system_user_id', 'fk_user_login_activity_system_user_id')
                  ->references('system_user_id')->on('system_users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_login_activity');
    }
};

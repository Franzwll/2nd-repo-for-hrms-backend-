<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('system_user_id');
            $table->string('type', 50);
            $table->string('title', 200);
            $table->text('body')->nullable();
            $table->string('module_name', 100)->nullable();
            $table->string('target_type', 100)->nullable();
            $table->string('target_id', 100)->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('system_user_id', 'idx_notifications_system_user_id');
            $table->index('is_read', 'idx_notifications_is_read');
            $table->index('created_at', 'idx_notifications_created_at');

            $table->foreign('system_user_id', 'fk_notifications_system_user_id')
                  ->references('system_user_id')->on('system_users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

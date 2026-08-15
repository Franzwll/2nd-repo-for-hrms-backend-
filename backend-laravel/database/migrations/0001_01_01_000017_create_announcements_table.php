<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id('announcement_id');
            $table->date('published_date');
            $table->string('title', 200);
            $table->text('body');
            $table->string('audience', 20)->default('All');
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->string('status', 20)->default('published');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('created_by_user_id', 'idx_announcements_created_by_user_id');
            $table->index('status', 'idx_announcements_status');

            $table->foreign('created_by_user_id', 'fk_announcements_created_by_user_id')
                  ->references('system_user_id')->on('system_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};

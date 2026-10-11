<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The default Laravel `users` table does not exist in every
        // database using this codebase (e.g. hotel_hr authenticates via
        // `system_users`). Only alter it where present so the migration
        // stays runnable everywhere instead of blocking the whole chain.
        if (! Schema::hasTable('users')) {
            return;
        }
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_photo_url')->nullable()->after('remember_token');
            $table->string('gender')->nullable()->after('profile_photo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['profile_photo_url', 'gender']);
        });
    }
};

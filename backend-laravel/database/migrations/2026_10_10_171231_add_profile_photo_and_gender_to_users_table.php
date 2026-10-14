<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The portal authenticates via `system_users` (see config/auth.php), so the
     * profile photo + gender columns must live there — not on the stock
     * `users` table (which this app does not use).
     */
    public function up(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            if (! Schema::hasColumn('system_users', 'profile_photo_url')) {
                $table->string('profile_photo_url')->nullable();
            }
            if (! Schema::hasColumn('system_users', 'gender')) {
                $table->string('gender')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('system_users', 'profile_photo_url')) {
                $columns[] = 'profile_photo_url';
            }
            if (Schema::hasColumn('system_users', 'gender')) {
                $columns[] = 'gender';
            }
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * DB consolidation – Phase 1.
     *
     * `password_reset_tokens` is Laravel's default broker table, but this
     * system never uses the broker: Modules\Auth\Services\PasswordResetService
     * stores reset tokens in the cache (`auth.reset.{token}`). The table has
     * always been empty, so dropping it does not affect forgot/reset password.
     */
    public function up(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }

    /**
     * Restores the exact original structure (see 0001_01_01_000000_create_users_table).
     */
    public function down(): void
    {
        if (! Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }
    }
};

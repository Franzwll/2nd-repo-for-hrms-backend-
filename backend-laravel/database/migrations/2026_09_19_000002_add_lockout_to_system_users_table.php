<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Persistent account lockout after repeated failed password logins.
     * Complements the per-minute route throttle with a 15-minute lock.
     */
    public function up(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            $table->unsignedTinyInteger('failed_attempts')->default(0)->after('mfa_recovery_codes');
            $table->timestamp('locked_until')->nullable()->after('failed_attempts');
        });
    }

    public function down(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            $table->dropColumn(['failed_attempts', 'locked_until']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * TOTP authenticator MFA (user-chosen; required for Super Admins).
     * Email OTP remains the default/fallback channel.
     */
    public function up(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            $table->string('mfa_method', 20)->default('email_otp')->after('otp_enabled');
            $table->text('totp_secret')->nullable()->after('mfa_method');
            $table->timestamp('totp_confirmed_at')->nullable()->after('totp_secret');
            $table->json('mfa_recovery_codes')->nullable()->after('totp_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            $table->dropColumn(['mfa_method', 'totp_secret', 'totp_confirmed_at', 'mfa_recovery_codes']);
        });
    }
};

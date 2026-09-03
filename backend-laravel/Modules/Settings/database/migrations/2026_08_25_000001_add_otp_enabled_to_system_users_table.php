<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            $table->boolean('otp_enabled')->default(true)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('system_users', function (Blueprint $table) {
            $table->dropColumn('otp_enabled');
        });
    }
};

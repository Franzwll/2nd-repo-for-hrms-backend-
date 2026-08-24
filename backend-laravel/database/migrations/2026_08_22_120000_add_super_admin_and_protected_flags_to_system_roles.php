<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('system_roles', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->after('description');
            $table->boolean('is_protected')->default(false)->after('is_super_admin');
        });

        // Backfill the seeded Super Admin role (role_id = 1) as the privileged,
        // protected system role so existing databases keep working.
        DB::table('system_roles')
            ->where('role_id', 1)
            ->update(['is_super_admin' => true, 'is_protected' => true]);
    }

    public function down(): void
    {
        Schema::table('system_roles', function (Blueprint $table) {
            $table->dropColumn(['is_super_admin', 'is_protected']);
        });
    }
};

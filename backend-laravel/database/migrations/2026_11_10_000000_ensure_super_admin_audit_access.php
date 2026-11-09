<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Repair deployments where the Super Admin role lost (or never received)
     * its explicit is_super_admin flag, and make sure the role can always open
     * Audit Logs even if the flag lookup fails for any reason.
     */
    public function up(): void
    {
        if (! Schema::hasTable('system_roles')) {
            return;
        }

        $roleId = DB::table('system_roles')
            ->where('role_name', 'Super Admin')
            ->value('role_id');

        if (! $roleId) {
            return;
        }

        $updates = [];
        if (Schema::hasColumn('system_roles', 'is_super_admin')) {
            $updates['is_super_admin'] = true;
        }
        if (Schema::hasColumn('system_roles', 'is_protected')) {
            $updates['is_protected'] = true;
        }
        if ($updates !== []) {
            DB::table('system_roles')->where('role_id', $roleId)->update($updates);
        }

        if (Schema::hasTable('role_permissions')) {
            DB::table('role_permissions')->updateOrInsert(
                ['role_id' => $roleId, 'module_name' => 'Audit Logs'],
                ['permission_level' => 'Full'],
            );
        }
    }

    public function down(): void
    {
        // Data repair only — nothing to undo.
    }
};

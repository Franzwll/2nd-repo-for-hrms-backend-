<?php

namespace Modules\UserManagement\Listeners;

use App\Models\SystemUser;
use App\Services\AuditLogger;
use Modules\CoreHCM\Events\EmployeeStatusChanged;

/**
 * Revokes portal access when an employee leaves the company.
 *
 * Core HCM owns the employment status change; User Management owns the
 * login account, so the suspension + token revocation live here.
 */
class SuspendSystemUserOnExit
{
    public function handle(EmployeeStatusChanged $event): void
    {
        if ($event->action !== 'exit') {
            return;
        }

        $employee = $event->employee;

        $user = SystemUser::where('employee_id', $employee->employee_id)->first();

        if (! $user) {
            return;
        }

        $user->status = 'Suspended';
        $user->save();

        // Existing sessions must stop working immediately.
        $user->tokens()->delete();

        AuditLogger::log(
            'System user suspended on employee exit',
            'User Management',
            'Warning',
            'user',
            (string) $user->system_user_id,
            'Suspended ' . $user->full_name . ' (' . $employee->employee_code . ') and revoked access tokens.',
        );
    }
}

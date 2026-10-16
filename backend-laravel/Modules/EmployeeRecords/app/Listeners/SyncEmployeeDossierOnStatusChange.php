<?php

namespace Modules\EmployeeRecords\Listeners;

use App\Observers\ActivityObserver;
use App\Services\AuditLogger;
use Modules\CoreHCM\Events\EmployeeStatusChanged;

/**
 * Keeps the 201 file in step with Core HCM's employment lifecycle.
 *
 * Core HCM owns the status change; ERM reacts here so the record freshness
 * date (drives retention / auto-archive) stays current and Records staff get a
 * clear audit trail of who joined, moved, or left. Deliberately side-effect
 * light — the actual exit paperwork stays editable through the ERM endpoints.
 */
class SyncEmployeeDossierOnStatusChange
{
    public function handle(EmployeeStatusChanged $event): void
    {
        $employee = $event->employee;

        ActivityObserver::withoutLogging(fn () => $employee->forceFill([
            'employee_record_last_updated_at' => now()->toDateString(),
        ])->save());

        $isExit = $event->action === 'exit';

        AuditLogger::log(
            'Employee record sync: ' . $event->action,
            'Employee Records',
            $isExit ? 'Warning' : 'Info',
            'employee',
            $employee->employee_code,
            trim(sprintf(
                '%s for %s%s',
                ucfirst($event->action),
                $employee->full_name,
                $event->previousStatus ? " (was {$event->previousStatus})" : ''
            )),
        );
    }
}

<?php

namespace Modules\CoreHCM\Events;

use App\Models\Employee;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired by Core HCM whenever an employee's employment state changes
 * (regularize, promote, transfer, exit, rehire, or a manual status /
 * employment-type edit).
 *
 * Core HCM owns the employment record; Employee Records owns the 201 dossier
 * and exit paperwork. ERM listens to this event so the dossier / exit record
 * stays in sync without Core HCM having to know anything about those tables.
 */
class EmployeeStatusChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Employee $employee,
        public string $action,
        public ?string $previousStatus = null,
        public ?string $previousEmploymentType = null,
        public array $context = [],
    ) {}
}

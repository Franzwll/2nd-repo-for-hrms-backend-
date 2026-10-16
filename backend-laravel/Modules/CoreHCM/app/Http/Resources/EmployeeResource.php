<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Employment-focused employee representation owned by Core HCM.
 *
 * Personal / 201-dossier data (government IDs, birth date, personal contact
 * details, documents, emergency contacts, leave) is intentionally absent — it
 * is served by the Employee Records dossier resource. This also removes the
 * previous PII leak where government IDs were returned to any Core HCM viewer.
 */
class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('department', 'position');

        return [
            'employee_id' => $this->employee_id,
            'employee_code' => $this->employee_code,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'position_id' => $this->position_id,
            'position_title' => $this->position?->title,
            'salary_grade_id' => $this->salary_grade_id,
            'salary_step' => $this->salary_step,
            'supervisor_employee_id' => $this->supervisor_employee_id,
            'employment_type' => $this->employment_type,
            'status' => $this->status,
            'date_hired' => $this->date_hired?->toDateString(),
            'onboarding_complete' => $this->onboarding_complete,
            'employee_record_last_updated_at' => $this->employee_record_last_updated_at?->toDateString(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

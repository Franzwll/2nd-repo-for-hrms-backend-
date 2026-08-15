<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'personal_email' => $this->personal_email,
            'phone' => $this->phone,
            'address' => $this->address,
            'birth_date' => $this->birth_date?->toDateString(),
            'gender' => $this->gender,
            'civil_status' => $this->civil_status,
            'nationality' => $this->nationality,
            'department_id' => $this->department_id,
            'department_name' => $this->department?->name,
            'position_id' => $this->position_id,
            'position_title' => $this->position?->title,
            'salary_grade_id' => $this->salary_grade_id,
            'supervisor_employee_id' => $this->supervisor_employee_id,
            'employment_type' => $this->employment_type,
            'status' => $this->status,
            'date_hired' => $this->date_hired?->toDateString(),
            'onboarding_complete' => $this->onboarding_complete,
            'sss_number' => $this->sss_number,
            'philhealth_number' => $this->philhealth_number,
            'pagibig_number' => $this->pagibig_number,
            'tin_number' => $this->tin_number,
            'salary_step' => $this->salary_step,
            'emergency_contacts' => EmergencyContactResource::collection($this->whenLoaded('emergencyContacts')),
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
            'position_history' => PositionHistoryResource::collection($this->whenLoaded('positionHistory')),
            'exit_record' => $this->whenLoaded('exitRecord', fn () => $this->exitRecord ? new ExitRecordResource($this->exitRecord) : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
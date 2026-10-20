<?php

namespace Modules\EmployeeRecords\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The complete Employee 360° / 201 dossier, owned by Employee Records.
 *
 * Composes the Core HCM employment master (read-only here) with the ERM-owned
 * dossier fields and relations. Statutory government IDs are masked unless the
 * viewer holds elevated rights, closing the previous PII leak in the Core HCM
 * resource.
 */
class EmployeeDossierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing('department', 'position');
        $showPii = self::canViewPii($request);

        return [
            // ---- Core HCM employment master (read-only) ----
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

            // ---- ERM-owned 201 dossier fields ----
            'personal_email' => $this->personal_email,
            'phone' => $this->phone,
            'address' => $this->address,
            'birth_date' => $this->birth_date?->toDateString(),
            'gender' => $this->gender,
            'civil_status' => $this->civil_status,
            'nationality' => $this->nationality,
            'sss_number' => $showPii ? $this->sss_number : null,
            'philhealth_number' => $showPii ? $this->philhealth_number : null,
            'pagibig_number' => $showPii ? $this->pagibig_number : null,
            'tin_number' => $showPii ? $this->tin_number : null,
            'pii_masked' => ! $showPii,

            // ---- Relations ----
            'emergency_contacts' => $this->whenLoaded('emergencyContacts', fn () => EmergencyContactResource::collection($this->emergencyContacts)->resolve()),
            'documents' => $this->whenLoaded('documents', fn () => EmployeeDocumentResource::collection($this->documents)->resolve()),
            'position_history' => $this->whenLoaded('positionHistory', fn () => $this->positionHistory->map(fn ($h) => [
                'position_history_id' => $h->position_history_id,
                'effective_date' => $h->effective_date?->toDateString(),
                'change_type' => $h->change_type,
                'old_position_id' => $h->old_position_id,
                'new_position_id' => $h->new_position_id,
                'old_salary_grade_id' => $h->old_salary_grade_id,
                'new_salary_grade_id' => $h->new_salary_grade_id,
                'notes' => $h->notes,
            ])->values()),
            'exit_record' => $this->whenLoaded('exitRecord', fn () => $this->exitRecord ? [
                'exit_record_id' => $this->exitRecord->exit_record_id,
                'exit_type' => $this->exitRecord->exit_type,
                'exit_date' => $this->exitRecord->exit_date?->toDateString(),
                'clearance_status' => $this->exitRecord->clearance_status,
                'coe_status' => $this->exitRecord->coe_status,
                'notes' => $this->exitRecord->notes,
            ] : null),
            'leave_balances' => $this->whenLoaded('leaveBalances', fn () => $this->leaveBalances->map(fn ($b) => [
                'leave_balance_id' => $b->leave_balance_id,
                'leave_type' => $b->leave_type,
                'period_year' => $b->period_year,
                'total_days' => (float) $b->total_days,
                'used_days' => (float) $b->used_days,
                'available_days' => max(0, (float) $b->total_days - (float) $b->used_days),
            ])->values()),
            'leave_requests' => $this->whenLoaded('essRequests', fn () => $this->essRequests
                ->filter(fn ($r) => stripos((string) $r->request_type, 'leave') !== false)
                ->take(20)
                ->map(fn ($r) => [
                    'request_code' => $r->request_code,
                    'request_type' => $r->request_type,
                    'status' => $r->status,
                    'date_from' => $r->date_from?->toDateString(),
                    'date_to' => $r->date_to?->toDateString(),
                    'filed_at' => $r->filed_at?->toDateString(),
                ])->values()),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Government-ID visibility: Super Admin or an "Employee Records" Full
     * permission level. Everyone else (including Records editors) sees them
     * masked, matching the confidential 201-file policy.
     */
    public static function canViewPii(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
            return true;
        }

        $level = $user->permissions?->firstWhere('module_name', 'Employee Records')?->permission_level ?? 'None';

        return $level === 'Full';
    }
}

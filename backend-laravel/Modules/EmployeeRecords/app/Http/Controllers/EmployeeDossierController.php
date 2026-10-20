<?php

namespace Modules\EmployeeRecords\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeEmergencyContact;
use App\Models\EmployeeExitRecord;
use App\Observers\ActivityObserver;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Modules\CoreHCM\Http\Controllers\Concerns\HcmCache;
use Modules\CoreHCM\Http\Resources\EmployeeResource;
use Modules\EmployeeRecords\Http\Resources\EmployeeDossierResource;

/**
 * Employee Records Management (ERM) — the 201 dossier.
 *
 * Owns the personal / government-ID / contact fields and the emergency-contact
 * and exit-paperwork records. The employment master (position, department,
 * status, lifecycle) is owned by Core HCM and appears here read-only.
 */
class EmployeeDossierController extends Controller
{
    /* GET /api/v1/erm/employees/{employee} */
    public function show(Employee $employee): JsonResponse
    {
        $employee->load(
            'department',
            'position',
            'emergencyContacts',
            'documents',
            'positionHistory',
            'exitRecord',
            'leaveBalances',
            'essRequests',
        );

        return response()->json([
            'data' => new EmployeeDossierResource($employee),
        ]);
    }

    /* PUT /api/v1/erm/employees/{employee}/dossier */
    public function updateDossier(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'personal_email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', Rule::in(['Male', 'Female', 'Other'])],
            'civil_status' => ['nullable', 'string', 'max:20'],
            'nationality' => ['nullable', 'string', 'max:60'],
            'sss_number' => ['nullable', 'string', 'max:30'],
            'philhealth_number' => ['nullable', 'string', 'max:30'],
            'pagibig_number' => ['nullable', 'string', 'max:30'],
            'tin_number' => ['nullable', 'string', 'max:30'],
        ]);

        // Dossier edits are an ERM concern — keep them out of the Core HCM
        // audit stream and log them under Employee Records instead.
        ActivityObserver::withoutLogging(function () use ($employee, $validated) {
            $employee->update([
                ...$validated,
                'employee_record_last_updated_at' => now()->toDateString(),
            ]);
        });

        AuditLogger::log(
            'Employee dossier updated',
            'Employee Records',
            'Info',
            'employee',
            $employee->employee_code,
            'Updated 201 dossier for ' . $employee->full_name,
        );
        HcmCache::flush();

        return response()->json([
            'message' => 'Dossier updated successfully.',
            'data' => new EmployeeDossierResource($employee->load('department', 'position')),
        ]);
    }

    /* GET /api/v1/erm/employees/{employee}/emergency-contacts */
    public function contacts(Employee $employee): JsonResponse
    {
        return response()->json([
            'contacts' => \Modules\EmployeeRecords\Http\Resources\EmergencyContactResource::collection(
                $employee->emergencyContacts()->orderByDesc('is_primary')->get()
            )->resolve(),
        ]);
    }

    /* POST /api/v1/erm/employees/{employee}/emergency-contacts */
    public function storeContact(Request $request, Employee $employee): JsonResponse
    {
        $validated = $this->validateContact($request);

        $contact = DB::transaction(function () use ($employee, $validated) {
            $isPrimary = $validated['is_primary'] ?? false;

            if ($isPrimary) {
                $employee->emergencyContacts()->update(['is_primary' => false]);
            }

            return $employee->emergencyContacts()->create([
                ...$validated,
                'is_primary' => $isPrimary,
            ]);
        });

        $this->touchRecord($employee);
        HcmCache::flush();

        return response()->json([
            'message' => 'Emergency contact added.',
            'contact' => new \Modules\EmployeeRecords\Http\Resources\EmergencyContactResource($contact),
        ], 201);
    }

    /* PUT /api/v1/erm/employees/{employee}/emergency-contacts/{contact} */
    public function updateContact(Request $request, Employee $employee, string $contact): JsonResponse
    {
        $model = $employee->emergencyContacts()->where('emergency_contact_id', $contact)->firstOrFail();
        $validated = $this->validateContact($request);

        DB::transaction(function () use ($employee, $model, $validated, $request) {
            if ($request->boolean('is_primary')) {
                $employee->emergencyContacts()->where('emergency_contact_id', '!=', $model->emergency_contact_id)
                    ->update(['is_primary' => false]);
            }

            $model->update($validated);
        });

        $this->touchRecord($employee);
        HcmCache::flush();

        return response()->json([
            'message' => 'Emergency contact updated.',
            'contact' => new \Modules\EmployeeRecords\Http\Resources\EmergencyContactResource($model->fresh()),
        ]);
    }

    /* DELETE /api/v1/erm/employees/{employee}/emergency-contacts/{contact} */
    public function destroyContact(Employee $employee, string $contact): JsonResponse
    {
        $model = $employee->emergencyContacts()->where('emergency_contact_id', $contact)->firstOrFail();
        $model->delete();
        $this->touchRecord($employee);

        return response()->json(['message' => 'Emergency contact removed.']);
    }

    /* GET /api/v1/erm/employees/{employee}/exit-record */
    public function showExitRecord(Employee $employee): JsonResponse
    {
        $record = $employee->exitRecord;

        return response()->json([
            'exit_record' => $record ? [
                'exit_record_id' => $record->exit_record_id,
                'exit_type' => $record->exit_type,
                'exit_date' => $record->exit_date?->toDateString(),
                'clearance_status' => $record->clearance_status,
                'coe_status' => $record->coe_status,
                'notes' => $record->notes,
            ] : null,
        ]);
    }

    /* PUT /api/v1/erm/employees/{employee}/exit-record */
    public function updateExitRecord(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'clearance_status' => ['nullable', Rule::in(['Pending', 'Cleared', 'Partial'])],
            'coe_status' => ['nullable', Rule::in(['Pending', 'Issued', 'Declined'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $record = $employee->exitRecord;
        if (! $record) {
            return response()->json(['message' => 'This employee has no exit record.'], 404);
        }

        $record->update($validated);

        AuditLogger::log(
            'Exit paperwork updated',
            'Employee Records',
            'Info',
            'employee',
            $employee->employee_code,
            'Updated exit clearance/COE for ' . $employee->full_name,
        );

        return response()->json([
            'message' => 'Exit paperwork updated.',
            'exit_record' => [
                'exit_record_id' => $record->exit_record_id,
                'exit_type' => $record->exit_type,
                'exit_date' => $record->exit_date?->toDateString(),
                'clearance_status' => $record->clearance_status,
                'coe_status' => $record->coe_status,
                'notes' => $record->notes,
            ],
        ]);
    }

    /* POST /api/v1/erm/employees/{employee}/archive */
    public function archive(Employee $employee): JsonResponse
    {
        if (in_array($employee->status, ['Active', 'On Leave'], true)) {
            return response()->json(['message' => 'Off-board the employee before archiving the record.'], 422);
        }

        $employee->delete();
        HcmCache::flush();

        AuditLogger::log(
            'Employee record archived',
            'Employee Records',
            'Warning',
            'employee',
            $employee->employee_code,
            'Archived 201 file for ' . $employee->full_name,
        );

        return response()->json(['message' => 'Employee record archived.']);
    }

    /* GET /api/v1/erm/employees/archived — soft-deleted 201 files. */
    public function archived(): JsonResponse
    {
        $employees = Employee::onlyTrashed()
            ->with('department', 'position')
            ->orderByDesc('deleted_at')
            ->get();

        return response()->json([
            'data' => EmployeeResource::collection($employees)->resolve(),
        ]);
    }

    /* POST /api/v1/erm/employees/{id}/restore (accepts trashed ids) */
    public function restore(string $employee): JsonResponse
    {
        $model = Employee::withTrashed()->findOrFail($employee);
        $model->restore();
        HcmCache::flush();

        AuditLogger::log(
            'Employee record restored',
            'Employee Records',
            'Info',
            'employee',
            $model->employee_code,
            'Restored 201 file for ' . $model->full_name,
        );

        return response()->json([
            'message' => 'Employee record restored.',
            'data' => new EmployeeDossierResource($model->load('department', 'position')),
        ]);
    }

    private function validateContact(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'relationship' => ['nullable', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['nullable', 'boolean'],
        ]);
    }

    private function touchRecord(Employee $employee): void
    {
        ActivityObserver::withoutLogging(fn () => $employee->forceFill([
            'employee_record_last_updated_at' => now()->toDateString(),
        ])->save());
    }
}

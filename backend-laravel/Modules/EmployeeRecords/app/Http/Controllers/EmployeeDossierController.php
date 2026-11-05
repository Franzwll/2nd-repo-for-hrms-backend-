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
                $employee->emergencyContacts->sortByDesc('is_primary')->values()
            )->resolve(),
        ]);
    }

    /* POST /api/v1/erm/employees/{employee}/emergency-contacts */
    public function storeContact(Request $request, Employee $employee): JsonResponse
    {
        $validated = $this->validateContact($request);

        $contact = DB::transaction(function () use ($employee, $validated) {
            $isPrimary = $validated['is_primary'] ?? false;
            $contacts = $this->contactsArray($employee);

            // Phase 3i: contacts live in employees.emergency_contacts_json.
            // New contacts get a stable id (max existing + 1) so the payload
            // keeps the old emergency_contact_id shape.
            $nextId = 1;
            foreach ($contacts as $existing) {
                $nextId = max($nextId, ((int) ($existing['emergency_contact_id'] ?? 0)) + 1);
            }

            if ($isPrimary) {
                foreach ($contacts as &$existing) {
                    $existing['is_primary'] = false;
                }
                unset($existing);
            }

            $contact = [
                'emergency_contact_id' => $nextId,
                'employee_id'          => $employee->employee_id,
                'name'                 => $validated['name'],
                'relationship'         => $validated['relationship'] ?? null,
                'phone'                => $validated['phone'] ?? null,
                'address'              => $validated['address'] ?? null,
                'is_primary'           => $isPrimary,
                'created_at'           => now()->toDateTimeString(),
                'updated_at'           => now()->toDateTimeString(),
            ];
            $contacts[] = $contact;
            $this->persistContacts($employee, $contacts);

            return $contact;
        });

        $this->touchRecord($employee);
        HcmCache::flush();

        return response()->json([
            'message' => 'Emergency contact added.',
            'contact' => new \Modules\EmployeeRecords\Http\Resources\EmergencyContactResource(
                $this->hydrateContact($employee, $contact)
            ),
        ], 201);
    }

    /* PUT /api/v1/erm/employees/{employee}/emergency-contacts/{contact} */
    public function updateContact(Request $request, Employee $employee, string $contact): JsonResponse
    {
        $validated = $this->validateContact($request);
        $targetId = (int) $contact;

        $current = collect($this->contactsArray($employee))
            ->firstWhere('emergency_contact_id', $targetId);
        if (! $current) {
            return response()->json(['message' => 'Emergency contact not found.'], 404);
        }

        DB::transaction(function () use ($request, $employee, $validated, $targetId) {
            $contacts = $this->contactsArray($employee);

            if ($request->boolean('is_primary')) {
                foreach ($contacts as &$existing) {
                    $existing['is_primary'] = false;
                }
                unset($existing);
            }

            foreach ($contacts as &$existing) {
                if ((int) ($existing['emergency_contact_id'] ?? 0) === $targetId) {
                    $existing['name']         = $validated['name'];
                    $existing['relationship'] = $validated['relationship'] ?? $existing['relationship'] ?? null;
                    $existing['phone']        = $validated['phone'] ?? $existing['phone'] ?? null;
                    $existing['address']      = $validated['address'] ?? $existing['address'] ?? null;
                    $existing['is_primary']   = (bool) ($validated['is_primary'] ?? $existing['is_primary'] ?? false);
                    $existing['updated_at']   = now()->toDateTimeString();
                }
            }
            unset($existing);

            $this->persistContacts($employee, $contacts);
        });

        $this->touchRecord($employee);
        HcmCache::flush();

        $updated = collect($this->contactsArray($employee))
            ->firstWhere('emergency_contact_id', $targetId);

        return response()->json([
            'message' => 'Emergency contact updated.',
            'contact' => new \Modules\EmployeeRecords\Http\Resources\EmergencyContactResource(
                $this->hydrateContact($employee, $updated)
            ),
        ]);
    }

    /* DELETE /api/v1/erm/employees/{employee}/emergency-contacts/{contact} */
    public function destroyContact(Employee $employee, string $contact): JsonResponse
    {
        DB::transaction(function () use ($employee, $contact) {
            $targetId = (int) $contact;
            $contacts = array_values(array_filter(
                $this->contactsArray($employee),
                fn ($c) => (int) ($c['emergency_contact_id'] ?? 0) !== $targetId
            ));
            $this->persistContacts($employee, $contacts);
        });

        $this->touchRecord($employee);
        HcmCache::flush();

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

    /* ------------------------------------------------------------------ */
    /* Phase 3i helpers — emergency contacts live in employees JSON.       */
    /* ------------------------------------------------------------------ */

    /** @return array<int, array<string, mixed>> */
    private function contactsArray(Employee $employee): array
    {
        $raw = $employee->emergency_contacts_json;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        return is_array($raw) ? array_values($raw) : [];
    }

    /** @param  array<int, array<string, mixed>>  $contacts */
    private function persistContacts(Employee $employee, array $contacts): void
    {
        // The model's `emergency_contacts_json => array` cast serializes this.
        $employee->emergency_contacts_json = $contacts;
        $employee->save();
    }

    /** Hydrate an EmployeeEmergencyContact model from a JSON entry for payloads. */
    private function hydrateContact(Employee $employee, array $data): EmployeeEmergencyContact
    {
        $model = new EmployeeEmergencyContact;
        $model->forceFill([
            'emergency_contact_id' => $data['emergency_contact_id'] ?? null,
            'employee_id'          => $data['employee_id'] ?? $employee->employee_id,
            'name'                 => $data['name'] ?? '',
            'relationship'         => $data['relationship'] ?? null,
            'phone'                => $data['phone'] ?? null,
            'address'              => $data['address'] ?? null,
            'is_primary'           => $data['is_primary'] ?? false,
            'created_at'           => $data['created_at'] ?? now(),
            'updated_at'           => $data['updated_at'] ?? now(),
        ]);

        return $model;
    }
}

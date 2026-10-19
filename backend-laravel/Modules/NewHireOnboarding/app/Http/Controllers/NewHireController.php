<?php

namespace Modules\NewHireOnboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Modules\NewHireOnboarding\Http\Requests\StoreNewHireRequest;
use Modules\NewHireOnboarding\Http\Requests\UpdateNewHireRequest;
use Modules\NewHireOnboarding\Http\Resources\NewHireResource;
use Modules\NewHireOnboarding\Models\NewHire;
use Modules\NewHireOnboarding\Models\OnboardingChecklistTemplate;
use Modules\NewHireOnboarding\Services\NewHireIntakeService;
use App\Services\AuditLogger;
use Modules\CoreHCM\Services\EmployeeLifecycleService;

class NewHireController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/new-hires                                               */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = NewHire::with(['department', 'position', 'onboardingItems.templateItem.template'])
            ->orderByDesc('start_date');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('new_hire_code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }
        if ($stage = $request->query('stage')) {
            $query->where('stage', $stage);
        }
        if ($deptId = $request->query('department_id')) {
            $query->where('department_id', $deptId);
        }
        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }

        $perPage = (int) $request->query('per_page', 15);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => NewHireResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/new-hires                                              */
    /* ------------------------------------------------------------------ */

    public function store(StoreNewHireRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['new_hire_code'] = NewHire::generateCode();

        // Derive position/department from the source applicant's job post
        // when the payload does not carry them, so new hires never end up
        // with NULL position_id / department_id (which surfaces as
        // "Position: Staff, Department: General" in the pre-onboarding list).
        if (
            isset($data['applicant_id'])
            && (empty($data['position_id']) || empty($data['department_id']))
        ) {
            $jobPost = \Modules\ApplicantManagement\Models\Applicant::with('jobPost')
                ->find($data['applicant_id'])?->jobPost;

            if ($jobPost) {
                $data['position_id'] = $data['position_id'] ?? $jobPost->position_id;
                $data['department_id'] = $data['department_id'] ?? $jobPost->department_id;
            }
        }

        $newHire = NewHire::create($data);

        AuditLogger::log(
            action: 'New Hire Created',
            module: 'New Hire Onboarding',
            targetType: 'New Hire',
            targetId: (string) $newHire->getKey(),
            details: "Created new hire record (code: {$newHire->new_hire_code}).",
        );

        // Auto-apply matching Active checklist templates to the new hire
        OnboardingChecklistTemplate::applyAllFor($newHire);

        // Create the portal account so the hire can log into the Employee portal
        $account = NewHireIntakeService::ensurePortalAccount($newHire);

        // Email the employee their portal credentials (email + password)
        NewHireIntakeService::sendCredentialsEmail($newHire, $account);

        // Hires added straight at Probationary/Regular are Core HCM employees;
        // Pre-onboarding hires are not employees yet and get their record when
        // they are promoted (see promoteStage).
        if ($newHire->stage !== 'Pre-onboarding') {
            NewHireIntakeService::ensureEmployeeRecord($newHire, $newHire->stage);
        }

        return response()->json(
            new NewHireResource($newHire->load(['department', 'position', 'onboardingItems.templateItem.template'])),
            201
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/new-hires/{new_hire}                                    */
    /* ------------------------------------------------------------------ */

    public function show(int $new_hire): JsonResponse
    {
        $model = NewHire::with(['department', 'position', 'onboardingItems.templateItem.template'])
            ->findOrFail($new_hire);

        return response()->json(new NewHireResource($model));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/new-hires/{new_hire}                                    */
    /* ------------------------------------------------------------------ */

    public function update(UpdateNewHireRequest $request, int $new_hire): JsonResponse
    {
        $model = NewHire::findOrFail($new_hire);
        $model->update($request->validated());

        AuditLogger::log(
            action: 'New Hire Updated',
            module: 'New Hire Onboarding',
            targetType: 'New Hire',
            targetId: (string) $model->getKey(),
            details: "Updated new hire record (code: {$model->new_hire_code}, stage: {$model->stage}).",
        );

        return response()->json(
            new NewHireResource($model->load(['department', 'position', 'onboardingItems.templateItem.template']))
        );
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/new-hires/{new_hire}                                 */
    /* ------------------------------------------------------------------ */

    public function destroy(int $new_hire): JsonResponse
    {
        NewHire::findOrFail($new_hire)->delete();

        AuditLogger::log(
            action: 'New Hire Removed',
            module: 'New Hire Onboarding',
            severity: 'Warning',
            targetType: 'New Hire',
            targetId: (string) $new_hire,
            details: "Removed new hire record (ID: {$new_hire}).",
        );

        return response()->json(['message' => 'New hire record removed.']);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/new-hires/{new_hire}/promote-stage                     */
    /* Advance: Pre-onboarding → Probationary → Regular                   */
    /* ------------------------------------------------------------------ */

    public function promoteStage(int $new_hire): JsonResponse
    {
        $model = NewHire::findOrFail($new_hire);

        $nextStage = match ($model->stage) {
            'Pre-onboarding' => 'Probationary',
            'Probationary' => 'Regular',
            default => null,
        };

        if (!$nextStage) {
            return response()->json([
                'message' => "New hire is already at the final stage ({$model->stage}).",
            ], 422);
        }

        $model->update(['stage' => $nextStage]);

        AuditLogger::log(
            action: 'New Hire Stage Promoted',
            module: 'New Hire Onboarding',
            targetType: 'New Hire',
            targetId: (string) $model->getKey(),
            details: "Promoted new hire (code: {$model->new_hire_code}) to {$nextStage} stage.",
        );

        // Auto-apply matching Active checklist templates for the new stage
        OnboardingChecklistTemplate::applyAllFor($model);

        // Entering Probationary makes the hire a Core HCM employee — create
        // the `employees` row now (idempotent) instead of waiting for a portal
        // login or regularization.
        if ($nextStage === 'Probationary') {
            NewHireIntakeService::ensureEmployeeRecord($model);
        }

        // Regularization must reach the Core HCM employee record too — the
        // employee list / org chart reads employment_type from `employees`,
        // so without this a regularized hire would still show Probationary.
        if ($nextStage === 'Regular') {
            $this->regularizeEmployeeRecord($model);
        }

        // Portal account (re)creation — hires completing their record at
        // probation get their Employee portal login here.
        $account = NewHireIntakeService::ensurePortalAccount($model);

        // Email the employee their portal credentials (email + password)
        NewHireIntakeService::sendCredentialsEmail($model, $account);

        return response()->json(
            new NewHireResource($model->load(['department', 'position', 'onboardingItems.templateItem.template']))
        );
    }

    /**
     * Marks the hire's linked Core HCM employee record as Regular. When no
     * employee row exists yet (hire was never handed to Employee Records),
     * one is created from the hire's own details so the org chart / employee
     * list reflects the regularization. Also writes the position history
     * entry Core HCM's own regularization flow uses.
     */
    private function regularizeEmployeeRecord(NewHire $newHire): void
    {
        $employee = $newHire->employee_id
            ? \App\Models\Employee::find($newHire->employee_id)
            : \App\Models\Employee::where('email', $newHire->email)->first();

        if (!$employee) {
            // No employee record yet — create one from the hire's details.
            // A duplicate email (e.g. shared test account) must never block
            // the regularization itself, so failures fall back to updating
            // whatever exists by code alone.
            if (!$newHire->position_id || !$newHire->department_id) {
                return; // not enough data to file an employee record
            }

            try {
                $nameParts = preg_split('/\s+/', trim($newHire->name) ?: 'New Hire', 2);
                // Mint the code and insert inside one transaction so the locked
                // sequence (shared with Core HCM's own create) serialises hires.
                $employee = \Illuminate\Support\Facades\DB::transaction(function () use ($newHire, $nameParts) {
                    return \App\Models\Employee::create([
                        'employee_code' => app(EmployeeLifecycleService::class)->generateEmployeeCode(),
                        'first_name' => $nameParts[0] ?? 'New',
                        'last_name' => $nameParts[1] ?? ($nameParts[0] ?? 'Hire'),
                        'email' => $newHire->email ?: null,
                        'phone' => $newHire->phone,
                        'position_id' => $newHire->position_id,
                        'department_id' => $newHire->department_id,
                        'employment_type' => 'Regular',
                        'date_hired' => $newHire->start_date,
                        'status' => 'Active',
                        'onboarding_complete' => true,
                    ]);
                });

                \App\Models\Position::where('position_id', $newHire->position_id)->increment('filled_count');

                // Link the hire (and the portal account) to the new employee row.
                $newHire->update(['employee_id' => $employee->employee_id]);
                \Modules\Settings\Models\SystemUser::where('email', $newHire->email)
                    ->update(['employee_id' => $employee->employee_id]);

                AuditLogger::log(
                    action: 'Employee Record Created',
                    module: 'New Hire Onboarding',
                    targetType: 'Employee',
                    targetId: (string) $employee->employee_id,
                    details: "Employee record {$employee->employee_code} created for regularized hire {$newHire->new_hire_code}.",
                );
            } catch (\Throwable $e) {
                Log::warning('Could not create employee record during regularization', [
                    'new_hire_id' => $newHire->new_hire_id,
                    'error' => $e->getMessage(),
                ]);

                return; // hire is still Regular; employee sync can be retried
            }
        } elseif ($employee->employment_type !== 'Regular') {
            $employee->update(['employment_type' => 'Regular']);
        }

        // Employee Records: copy the originating applicant's resume + supporting
        // documents and the hire's onboarding uploads into the 201 file.
        // Best-effort — a copy failure must never block regularization.
        try {
            $copied = app(\Modules\EmployeeRecords\Services\EmployeeRecordProvisioner::class)
                ->fromNewHire($newHire, $employee);

            if ($copied > 0) {
                AuditLogger::log(
                    action: 'Applicant Documents Copied to Employee Record',
                    module: 'Employee Records',
                    targetType: 'Employee',
                    targetId: (string) $employee->employee_id,
                    details: "Copied {$copied} document(s) from new hire {$newHire->new_hire_code} into employee record {$employee->employee_code}.",
                );
            }
        } catch (\Throwable $e) {
            Log::warning('Could not copy documents into employee record', [
                'new_hire_id' => $newHire->new_hire_id,
                'applicant_id' => $newHire->applicant_id,
                'error' => $e->getMessage(),
            ]);
        }

        \App\Models\EmployeePositionHistory::create([
            'employee_id' => $employee->employee_id,
            'effective_date' => now()->toDateString(),
            'change_type' => 'Regularization',
            'old_position_id' => $employee->position_id,
            'new_position_id' => $employee->position_id,
            'notes' => 'Regularized upon completing the onboarding pipeline (new hire promoted to Regular).',
        ]);

        AuditLogger::log(
            action: 'Employee regularized',
            module: 'New Hire Onboarding',
            targetType: 'Employee',
            targetId: (string) $employee->employee_id,
            details: "Employment type of {$employee->full_name} set to Regular (hire {$newHire->new_hire_code} reached the Regular stage).",
        );
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/new-hires/stats                                         */
    /* ------------------------------------------------------------------ */

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => NewHire::count(),
            'by_stage' => NewHire::selectRaw('stage, COUNT(*) as count')
                ->groupBy('stage')
                ->pluck('count', 'stage'),
            'starting_soon' => NewHire::where('start_date', '>=', now()->toDateString())
                ->where('start_date', '<=', now()->addDays(7)->toDateString())
                ->count(),
        ]);
    }
}


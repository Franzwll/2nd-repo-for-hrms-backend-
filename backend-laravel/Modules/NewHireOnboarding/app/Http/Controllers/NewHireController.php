<?php

namespace Modules\NewHireOnboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\NewHireCredentialsMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Modules\NewHireOnboarding\Http\Requests\StoreNewHireRequest;
use Modules\NewHireOnboarding\Http\Requests\UpdateNewHireRequest;
use Modules\NewHireOnboarding\Http\Resources\NewHireResource;
use Modules\NewHireOnboarding\Models\NewHire;
use Modules\NewHireOnboarding\Models\OnboardingChecklistTemplate;
use App\Services\AuditLogger;
use Modules\Settings\Models\SystemSetting;
use Modules\Settings\Models\SystemUser;

class NewHireController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* Portal account creation                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Creates (or reuses) a system_users portal account for the new hire so
     * they can log into the Employee portal. The account starts with the
     * default password stored in system_settings.default_password (falls back
     * to the shipped default) and is linked to the hire's employee record.
     *
     * Returns an array with the account, the plain-text password (only when a
     * new account was created) and whether it was newly created:
     * ['user' => SystemUser, 'password' => ?string, 'created' => bool]
     */
    private function ensurePortalAccount(NewHire $newHire): ?array
    {
        $email = trim((string) $newHire->email);
        if ($email === '') {
            return null;
        }

        $existing = SystemUser::where('email', $email)->first();
        if ($existing) {
            return ['user' => $existing, 'password' => null, 'created' => false];
        }

        $defaultPassword = SystemSetting::getValue('default_password', []);
        $password = is_array($defaultPassword) && isset($defaultPassword['password'])
            ? (string) $defaultPassword['password']
            : Str::password(12, symbols: false);

        // Unique username derived from the email's local part
        $base = strtolower(preg_replace('/[^a-z0-9._-]/i', '', explode('@', $email)[0] ?? 'user'));
        $username = $base;
        $suffix = 1;
        while (SystemUser::where('username', $username)->exists()) {
            $username = $base . $suffix++;
        }

        $user = SystemUser::create([
            'username' => $username,
            'email' => $email,
            'password_hash' => Hash::make($password),
            'full_name' => $newHire->name,
            'department_name' => $newHire->department?->name,
            'employee_id' => $newHire->employee_id,
            'role_id' => 3, // Employee portal role
            'status' => 'Active',
        ]);

        return ['user' => $user, 'password' => $password, 'created' => true];
    }

    /**
     * Emails the new hire their Employee portal login credentials (email +
     * password) right after their portal account is created. Failures are
     * logged but never block the hire creation itself.
     */
    private function sendCredentialsEmail(NewHire $newHire, ?array $account): void
    {
        if (!$account || !($account['created'] ?? false) || empty($account['password'])) {
            return;
        }

        try {
            Mail::to($newHire->email)->send(new NewHireCredentialsMail(
                recipientEmail: $newHire->email,
                employeeName: $newHire->name,
                email: $newHire->email,
                password: (string) $account['password'],
                position: $newHire->position?->title,
                startDate: $newHire->start_date?->format('F j, Y'),
            ));
        } catch (\Throwable $e) {
            Log::warning('Could not send new hire credentials email', [
                'new_hire_id' => $newHire->new_hire_id,
                'email' => $newHire->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

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
        $account = $this->ensurePortalAccount($newHire);

        // Email the employee their portal credentials (email + password)
        $this->sendCredentialsEmail($newHire, $account);

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

        // Portal account (re)creation — hires completing their record at
        // probation get their Employee portal login here.
        $account = $this->ensurePortalAccount($model);

        // Email the employee their portal credentials (email + password)
        $this->sendCredentialsEmail($model, $account);

        return response()->json(
            new NewHireResource($model->load(['department', 'position', 'onboardingItems.templateItem.template']))
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


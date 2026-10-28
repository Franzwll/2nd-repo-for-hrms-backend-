<?php

namespace Modules\NewHireOnboarding\Services;

use App\Mail\NewHireCredentialsMail;
use App\Models\Employee;
use App\Models\Position;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\CoreHCM\Services\EmployeeLifecycleService;
use Modules\NewHireOnboarding\Models\NewHire;
use Modules\NewHireOnboarding\Models\OnboardingChecklistTemplate;
use Modules\Settings\Models\SystemSetting;
use Modules\Settings\Models\SystemUser;

/**
 * Server-side intake for accepted applicants.
 *
 * Historically the Pre-onboarding record was created by the browser when the
 * applicant-management page handed the person off to New Hire Onboarding. That
 * handoff lived only in memory, so a reload or a failed request could silently
 * drop the hire. This service creates the record on the server instead, keyed
 * to the applicant so it can never be duplicated.
 */
class NewHireIntakeService
{
    /**
     * Files an accepted applicant into New Hire Onboarding as Pre-onboarding.
     * Idempotent: one applicant maps to at most one new-hire record.
     */
    public static function fileApplicant(int $applicantId, array $overrides = []): ?NewHire
    {
        $applicant = Applicant::with('jobPost')->find($applicantId);
        if (! $applicant) {
            return null;
        }

        $existing = NewHire::where('applicant_id', $applicant->applicant_id)->first();
        if ($existing) {
            return $existing;
        }

        $jobPost = $applicant->jobPost;

        $startDate = $overrides['start_date'] ?? null;
        if ($startDate === null && $applicant->offer_start_date) {
            $startDate = $applicant->offer_start_date->format('Y-m-d');
        }
        $startDate ??= now()->toDateString();

        $newHire = NewHire::create([
            'new_hire_code' => NewHire::generateCode(),
            'applicant_id'  => $applicant->applicant_id,
            'name'          => $applicant->name,
            'email'         => $applicant->email,
            'phone'         => $applicant->phone,
            'position_id'   => $overrides['position_id'] ?? $jobPost?->position_id,
            'department_id' => $overrides['department_id'] ?? $jobPost?->department_id,
            'stage'         => 'Pre-onboarding',
            'start_date'    => $startDate,
        ]);

        AuditLogger::log(
            action: 'New Hire Created',
            module: 'New Hire Onboarding',
            targetType: 'New Hire',
            targetId: (string) $newHire->getKey(),
            details: "Created new hire record (code: {$newHire->new_hire_code}) from accepted applicant {$applicant->applicant_code}.",
        );

        // Auto-apply matching Active checklist templates to the new hire
        OnboardingChecklistTemplate::applyAllFor($newHire);

        // Send welcome email (no credentials yet — account is created at Probationary promotion)
        self::sendWelcomeEmail($newHire);

        // Pre-onboarding hires are not Core HCM employees yet. The employee
        // record is provisioned when they enter Probationary (see
        // NewHireController::promoteStage), not at acceptance.
        return $newHire;
    }

    /**
     * Ensures a Core HCM `employees` record exists for the hire, linked back to
     * the new-hire row (and the portal account). Idempotent — matching on email
     * so a record the ESS portal already provisioned is reused, never doubled.
     */
    public static function ensureEmployeeRecord(NewHire $newHire, string $employmentType = 'Probationary'): ?Employee
    {
        // Already linked to an employee row → make sure the hire's documents
        // are filed in ERM too, then stop.
        if ($newHire->employee_id) {
            $linked = Employee::find($newHire->employee_id);
            if ($linked) {
                return self::withDocuments($newHire, $linked);
            }
        }

        // Reuse an existing employee (e.g. auto-provisioned by the ESS portal)
        // that matches the hire's email.
        $email = trim((string) $newHire->email);
        if ($email !== '') {
            $existing = Employee::where('email', $email)->first();
            if ($existing) {
                $newHire->update(['employee_id' => $existing->employee_id]);
                SystemUser::where('email', $email)->update(['employee_id' => $existing->employee_id]);

                return self::withDocuments($newHire, $existing);
            }
        }

        // Not enough data to file a meaningful Core HCM record.
        if (! $newHire->position_id || ! $newHire->department_id) {
            return null;
        }

        $parts = preg_split('/\s+/', trim((string) $newHire->name) ?: 'New Hire');
        $first = $parts[0] ?? 'New';
        $last = count($parts) > 1 ? $parts[count($parts) - 1] : 'Hire';
        $middle = count($parts) > 2 ? implode(' ', array_slice($parts, 1, -1)) : null;

        try {
            $employee = DB::transaction(function () use ($newHire, $first, $middle, $last, $employmentType) {
                return Employee::create([
                    'employee_code'       => app(EmployeeLifecycleService::class)->generateEmployeeCode(),
                    'first_name'          => $first,
                    'middle_name'         => $middle,
                    'last_name'           => $last,
                    'email'               => $newHire->email ?: null,
                    'phone'               => $newHire->phone,
                    'position_id'         => $newHire->position_id,
                    'department_id'       => $newHire->department_id,
                    'employment_type'     => $employmentType,
                    'date_hired'          => $newHire->start_date ?? now(),
                    'status'              => 'Active',
                    'onboarding_complete' => false,
                ]);
            });
        } catch (\Throwable $e) {
            Log::warning('Could not provision Core HCM employee for new hire', [
                'new_hire_id' => $newHire->new_hire_id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }

        Position::where('position_id', $newHire->position_id)->increment('filled_count');

        $newHire->update(['employee_id' => $employee->employee_id]);
        SystemUser::where('email', $newHire->email)->update(['employee_id' => $employee->employee_id]);

        AuditLogger::log(
            action: 'Employee Record Created',
            module: 'New Hire Onboarding',
            targetType: 'Employee',
            targetId: (string) $employee->employee_id,
            details: "Employee record {$employee->employee_code} created for new hire {$newHire->new_hire_code} ({$employmentType}).",
        );

        return self::withDocuments($newHire, $employee);
    }

    /**
     * Routes the hire's recruitment + onboarding documents into Employee
     * Records Management (ERM). Best-effort: a filing failure must never block
     * the employee record itself.
     */
    private static function withDocuments(NewHire $newHire, Employee $employee): Employee
    {
        try {
            app(\Modules\EmployeeRecords\Services\EmployeeRecordProvisioner::class)
                ->fromNewHire($newHire, $employee);
        } catch (\Throwable $e) {
            Log::warning('Could not route documents to Employee Records', [
                'new_hire_id' => $newHire->new_hire_id,
                'employee_id' => $employee->employee_id,
                'error' => $e->getMessage(),
            ]);
        }

        return $employee;
    }

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
    public static function ensurePortalAccount(NewHire $newHire): ?array
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
    public static function sendCredentialsEmail(NewHire $newHire, ?array $account): void
    {
        if (! $account || ! ($account['created'] ?? false) || empty($account['password'])) {
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

    /**
     * Sends a welcome email to the new hire after they accept the offer.
     * No credentials are included — the Employee Portal account is created
     * and credentials are sent when the hire is promoted to Probationary.
     */
    public static function sendWelcomeEmail(NewHire $newHire): void
    {
        $email = trim((string) $newHire->email);
        if ($email === '') {
            return;
        }

        try {
            Mail::to($email)->send(new \App\Mail\NewHireWelcomeMail(
                recipientEmail: $email,
                employeeName: $newHire->name,
                position: $newHire->position?->title,
                startDate: $newHire->start_date?->format('F j, Y'),
            ));
        } catch (\Throwable $e) {
            Log::warning('Could not send new hire welcome email', [
                'new_hire_id' => $newHire->new_hire_id,
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

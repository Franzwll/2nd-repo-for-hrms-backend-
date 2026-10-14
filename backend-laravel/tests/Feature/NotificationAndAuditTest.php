<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\SystemUser;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class NotificationAndAuditTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_employee_creation_audits_and_notifies_other_admins(): void
    {
        $token = $this->loginViaOtp();
        DB::table('notifications')->delete();
        $actorId = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail()->system_user_id;

        $this->postJson('/api/v1/employees', [
            'first_name' => 'Notif',
            'last_name' => 'Test',
            'email' => 'notif.test@oxfordsuites.com.ph',
            'gender' => 'Male',
            'birth_date' => '1990-01-01',
            'department_id' => 1,
            'position_id' => 1,
            'employment_type' => 'Regular',
            'date_hired' => '2026-01-01',
            'status' => 'Active',
        ], $this->authHeaders($token))->assertCreated();

        // Audit entry is written automatically by the observer.
        $this->assertDatabaseHas('audit_logs', [
            'module_name' => 'Core HCM',
            'action' => 'Employee created',
            'target_type' => 'employee',
        ]);

        // A notification is delivered to at least one user other than the actor.
        $this->assertTrue(
            DB::table('notifications')->where('system_user_id', '!=', $actorId)->exists(),
            'Expected a notification for a non-actor admin.'
        );

        // The actor is never notified about their own routine edit.
        $this->assertDatabaseMissing('notifications', ['system_user_id' => $actorId]);
    }

    public function test_announcement_publish_broadcasts_to_all_except_actor(): void
    {
        $token = $this->loginViaOtp();
        DB::table('notifications')->delete();
        $actorId = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail()->system_user_id;
        $totalUsers = SystemUser::count();

        $this->postJson('/api/v1/announcements', [
            'title' => 'Company Townhall',
            'body' => 'Join us Friday.',
            'audience' => 'All',
        ], $this->authHeaders($token))->assertCreated();

        $count = DB::table('notifications')
            ->where('module_name', 'Announcements')
            ->where('system_user_id', '!=', $actorId)
            ->count();

        // Broadcast goes to every other active user.
        $this->assertEquals($totalUsers - 1, $count);

        $this->assertDatabaseMissing('notifications', ['system_user_id' => $actorId]);
    }

    public function test_new_system_user_gets_account_created_notification(): void
    {
        $token = $this->loginViaOtp();
        DB::table('notifications')->delete();
        $actorId = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail()->system_user_id;

        $created = $this->postJson('/api/v1/users', [
            'username' => 'notif.user',
            'email' => 'notif.user@oxfordsuites.com.ph',
            'password' => 'Temp@1234',
            'full_name' => 'Notif User',
            'role_id' => 2,
            'status' => 'Active',
        ], $this->authHeaders($token))->assertCreated()->json('data');

        $newId = $created['system_user_id'];

        $this->assertDatabaseHas('notifications', [
            'system_user_id' => $newId,
            'module_name' => 'User Management',
            'title' => 'Account created',
        ]);

        // The creating admin (actor) must not be notified about their own action.
        $this->assertDatabaseMissing('notifications', ['system_user_id' => $actorId]);
    }

    public function test_employee_update_is_audit_only_no_bell(): void
    {
        $token = $this->loginViaOtp();
        DB::table('notifications')->delete();

        $employeeId = DB::table('employees')->orderBy('employee_id')->value('employee_id');
        $auditCountBefore = DB::table('audit_logs')
            ->where('module_name', 'Core HCM')
            ->where('action', 'Employee updated')
            ->count();

        $this->putJson("/api/v1/employees/{$employeeId}", [
            'middle_name' => 'HelpfulOnly',
        ], $this->authHeaders($token))->assertOk();

        // Audit still records the routine edit.
        $auditCountAfter = DB::table('audit_logs')
            ->where('module_name', 'Core HCM')
            ->where('action', 'Employee updated')
            ->count();
        $this->assertGreaterThan($auditCountBefore, $auditCountAfter);

        // Helpful-only: no bell for routine edits.
        $this->assertEquals(0, DB::table('notifications')->count());
    }

    public function test_employee_only_announcement_notifies_employees_only(): void
    {
        $token = $this->loginViaOtp();
        DB::table('notifications')->delete();
        $actorId = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail()->system_user_id;

        $this->postJson('/api/v1/announcements', [
            'title' => 'DTR Reminder',
            'body' => 'Submit your DTR.',
            'audience' => 'Employee',
        ], $this->authHeaders($token))->assertCreated();

        $notifiedRoleNames = DB::table('notifications')
            ->join('system_users', 'system_users.system_user_id', '=', 'notifications.system_user_id')
            ->join('system_roles', 'system_roles.role_id', '=', 'system_users.role_id')
            ->distinct()
            ->pluck('system_roles.role_name')
            ->sort()
            ->values()
            ->all();

        $this->assertNotEmpty($notifiedRoleNames);
        $this->assertEquals(['Employee'], $notifiedRoleNames);
        $this->assertDatabaseMissing('notifications', ['system_user_id' => $actorId]);
    }

    public function test_landing_apply_notifies_hr_admins(): void
    {
        DB::table('notifications')->delete();

        $jobPostId = DB::table('job_posts')
            ->whereIn('status', ['published', 'Open'])
            ->orderBy('job_post_id')
            ->value('job_post_id');

        // Ensure at least one open/published post exists for the public apply.
        if (! $jobPostId) {
            $jobPostId = DB::table('job_posts')->orderBy('job_post_id')->value('job_post_id');
            DB::table('job_posts')->where('job_post_id', $jobPostId)->update(['status' => 'published']);
        }

        $email = 'landing.test.' . time() . '@example.com';

        $this->postJson('/api/v1/landing/apply', [
            'job_post_id' => $jobPostId,
            'name' => 'Landing Tester',
            'email' => $email,
            'phone' => '09171234567',
        ])->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'module_name' => 'Applicant Management',
            'title' => 'New applicant from Landing: Landing Tester',
        ]);

        // Helpful-only: Employees must not get hiring bells.
        $employeeNotified = DB::table('notifications')
            ->join('system_users', 'system_users.system_user_id', '=', 'notifications.system_user_id')
            ->join('system_roles', 'system_roles.role_id', '=', 'system_users.role_id')
            ->where('notifications.title', 'New applicant from Landing: Landing Tester')
            ->where('system_roles.role_name', 'Employee')
            ->exists();

        $this->assertFalse($employeeNotified, 'Employees should not receive hiring notifications.');
    }

    public function test_notifications_endpoint_exposes_target_for_navigation(): void
    {
        $token = $this->loginViaOtp();
        $actorId = SystemUser::where('email', 'bullseur@oxfordsuites.com.ph')->firstOrFail()->system_user_id;

        DB::table('notifications')->delete();
        DB::table('notifications')->insert([
            'system_user_id' => $actorId,
            'type' => 'info',
            'title' => 'Employee updated',
            'body' => 'Jane Doe record changed',
            'module_name' => 'Core HCM',
            'target_type' => 'employees',
            'target_id' => '42',
            'is_read' => false,
            'created_at' => now(),
        ]);

        $this->withToken($token)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonFragment(['target_type' => 'employees', 'target_id' => '42']);
    }
}

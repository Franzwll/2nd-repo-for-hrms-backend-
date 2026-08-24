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

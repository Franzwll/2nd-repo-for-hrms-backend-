<?php

namespace Tests\Feature;

use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use App\Models\LeaveBalance;
use App\Models\SystemUser;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * End-to-end guard rails for the ESS request lifecycle:
 * Pending -> Under Review -> Returned -> Under Review -> For Fulfillment -> Completed.
 *
 * The important invariant: a document request cannot be completed without an
 * HR attachment, and the legacy status endpoint cannot bypass that rule.
 */
class EssRequestWorkflowTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function tokenFor(int $systemUserId): string
    {
        $this->resetAuthGuards();

        return SystemUser::findOrFail($systemUserId)->createToken('test-token')->plainTextToken;
    }

    private function employeeToken(): string
    {
        return $this->tokenFor(4);
    }

    public function test_document_request_cannot_complete_without_an_attachment(): void
    {
        Storage::fake('public');

        $created = $this->post('/api/v1/ess/requests', [
            'category_code' => 'hr_document',
            'category_name' => 'HR Document',
            'request_type' => 'Certificate of Employment',
            'details' => 'COE for a bank loan.',
            'attachments' => [
                UploadedFile::fake()->create('id.pdf', 10, 'application/pdf'),
            ],
        ], $this->authHeaders($this->employeeToken()))
            ->assertCreated()
            ->json('request');

        $code = $created['request_code'];
        $admin = $this->authHeaders($this->superAdminToken());

        $this->postJson("/api/v1/ess/admin/requests/{$code}/review", [
            'decision' => 'start',
        ], $admin)->assertOk()->assertJsonPath('request.status', 'Under Review');

        $this->postJson("/api/v1/ess/admin/requests/{$code}/review", [
            'decision' => 'approve',
        ], $admin)->assertOk()->assertJsonPath('request.status', 'For Fulfillment');

        // The legacy status endpoint must not complete a document request.
        $this->patchJson("/api/v1/ess/admin/requests/{$code}/status", [
            'status' => 'Completed',
        ], $admin)->assertStatus(422);

        // Nor can "fulfil" succeed without a file.
        $this->postJson("/api/v1/ess/admin/requests/{$code}/fulfill", [], $admin)
            ->assertStatus(422);

        $this->post("/api/v1/ess/admin/requests/{$code}/fulfill", [
            'file' => UploadedFile::fake()->create('coe.pdf', 12, 'application/pdf'),
            'note' => 'Signed COE attached.',
        ], $admin)
            ->assertOk()
            ->assertJsonPath('request.status', 'Completed');

        $essRequest = EssRequest::where('request_code', $code)->firstOrFail();
        $this->assertNotNull($essRequest->completed_at);

        $mine = $this->getJson('/api/v1/ess/my-requests', $this->authHeaders($this->employeeToken()))
            ->assertOk()
            ->json('requests');

        $row = collect($mine)->firstWhere('id', $code);
        $this->assertNotNull($row);
        $this->assertSame('Completed', $row['status']);
        $this->assertTrue($row['has_fulfillment']);
        $this->assertSame(
            ['employee', 'hr'],
            collect($row['attachments'])->pluck('direction')->sort()->values()->all()
        );
        $this->assertContains('Completed', collect($row['timeline'])->pluck('status')->all());

        // The employee can download HR's file by request code, but the same
        // attachment is off-limits through the HR-only admin route.
        $hrAttachment = EssRequestAttachment::where('ess_request_id', $essRequest->ess_request_id)
            ->where('direction', 'hr')
            ->firstOrFail();

        $employeeToken = $this->employeeToken();
        $this->get(
            "/api/v1/ess/requests/{$code}/attachments/{$hrAttachment->ess_request_attachment_id}/file?token={$employeeToken}"
        )->assertOk();

        $this->get(
            "/api/v1/ess/admin/requests/{$code}/attachments/{$hrAttachment->ess_request_attachment_id}/file?token={$employeeToken}"
        )->assertStatus(403);

        $adminToken = $this->superAdminToken();
        $this->get(
            "/api/v1/ess/admin/requests/{$code}/attachments/{$hrAttachment->ess_request_attachment_id}/file?token={$adminToken}"
        )->assertOk();
    }

    public function test_approval_with_an_attachment_completes_the_request_immediately(): void
    {
        Storage::fake('public');

        $created = $this->post('/api/v1/ess/requests', [
            'category_code' => 'hr_document',
            'category_name' => 'HR Document',
            'request_type' => 'Certificate of Employment',
            'details' => 'COE for a housing loan.',
        ], $this->authHeaders($this->employeeToken()))
            ->assertCreated()
            ->json('request');

        $code = $created['request_code'];

        $this->post("/api/v1/ess/admin/requests/{$code}/review", [
            'decision' => 'approve',
            'note' => 'Approved and issued in one step.',
            'file' => UploadedFile::fake()->create('coe.pdf', 12, 'application/pdf'),
        ], $this->authHeaders($this->superAdminToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Completed')
            ->assertJsonPath('request.attachments.0.direction', 'hr');

        $essRequest = EssRequest::where('request_code', $code)->firstOrFail();
        $this->assertNotNull($essRequest->completed_at);
        $this->assertDatabaseHas('ess_request_attachments', [
            'ess_request_id' => $essRequest->ess_request_id,
            'direction' => 'hr',
            'original_name' => 'coe.pdf',
        ]);
    }

    public function test_non_document_request_is_approved_and_leave_is_deducted(): void
    {
        Storage::fake('public');

        $created = $this->post('/api/v1/ess/requests', [
            'category_code' => 'leave',
            'category_name' => 'Leave',
            'request_type' => 'Vacation Leave',
            'date_from' => '2026-11-02',
            'date_to' => '2026-11-03',
            'details' => 'Family trip.',
        ], $this->authHeaders($this->employeeToken()))
            ->assertCreated()
            ->json('request');

        $code = $created['request_code'];
        $employeeId = (int) $created['employee_id'];

        $before = (float) (LeaveBalance::where('employee_id', $employeeId)
            ->where('leave_type', 'Vacation Leave')
            ->where('period_year', now()->year)
            ->value('used_days') ?? 0);

        $this->postJson("/api/v1/ess/admin/requests/{$code}/review", [
            'decision' => 'approve',
        ], $this->authHeaders($this->superAdminToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Approved');

        $after = (float) LeaveBalance::where('employee_id', $employeeId)
            ->where('leave_type', 'Vacation Leave')
            ->where('period_year', now()->year)
            ->value('used_days');

        $this->assertSame($before + 2.0, $after);
    }

    public function test_returned_request_can_be_resubmitted_by_the_employee(): void
    {
        Storage::fake('public');

        $created = $this->post('/api/v1/ess/requests', [
            'category_code' => 'hr_document',
            'category_name' => 'HR Document',
            'request_type' => 'Certificate of Employment',
            'details' => 'COE for visa application.',
        ], $this->authHeaders($this->employeeToken()))
            ->assertCreated()
            ->json('request');

        $code = $created['request_code'];
        $admin = $this->authHeaders($this->superAdminToken());

        // Reject/return reasons are mandatory.
        $this->postJson("/api/v1/ess/admin/requests/{$code}/review", [
            'decision' => 'return',
        ], $admin)->assertStatus(422);

        $this->postJson("/api/v1/ess/admin/requests/{$code}/review", [
            'decision' => 'return',
            'note' => 'Please attach a valid government ID.',
        ], $admin)->assertOk()->assertJsonPath('request.status', 'Returned for Clarification');

        // The employee answers with a note and a file; it returns to review.
        $this->post("/api/v1/ess/requests/{$code}/respond", [
            'note' => 'Attached my passport copy.',
            'attachments' => [
                UploadedFile::fake()->create('passport.pdf', 15, 'application/pdf'),
            ],
        ], $this->authHeaders($this->employeeToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Under Review');

        $this->postJson("/api/v1/ess/admin/requests/{$code}/review", [
            'decision' => 'approve',
        ], $this->authHeaders($this->superAdminToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'For Fulfillment');

        $this->post("/api/v1/ess/admin/requests/{$code}/fulfill", [
            'file' => UploadedFile::fake()->create('coe.pdf', 12, 'application/pdf'),
        ], $this->authHeaders($this->superAdminToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Completed');

        $essRequest = EssRequest::where('request_code', $code)->firstOrFail();
        $this->assertSame(1, $essRequest->returned_count);
        $this->assertDatabaseHas('ess_request_status_histories', [
            'ess_request_id' => $essRequest->ess_request_id,
            'status' => 'Returned for Clarification',
        ]);
    }

    public function test_employee_can_withdraw_an_open_request_but_not_a_completed_one(): void
    {
        Storage::fake('public');

        $created = $this->post('/api/v1/ess/requests', [
            'category_code' => 'hr_document',
            'category_name' => 'HR Document',
            'request_type' => 'Certificate of Employment',
            'details' => 'COE request to withdraw.',
        ], $this->authHeaders($this->employeeToken()))
            ->assertCreated()
            ->json('request');

        $code = $created['request_code'];

        $this->postJson("/api/v1/ess/requests/{$code}/cancel", [], $this->authHeaders($this->employeeToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Cancelled');

        $this->assertDatabaseHas('ess_requests', [
            'request_code' => $code,
            'status' => 'Cancelled',
        ]);
    }
}

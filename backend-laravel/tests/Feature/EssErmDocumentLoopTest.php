<?php

namespace Tests\Feature;

use App\Models\EmployeeDocument;
use App\Models\EssRequest;
use App\Models\SystemUser;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Closed-loop ESS <-> ERM document-request workflow, with the ESS Management
 * gate in front:
 *
 * Employee files -> ESS Management approves (For Dispatch) -> ERM accepts and
 * sends the document back (For Release) -> ESS Management releases (Completed)
 * -> the employee can download it.
 *
 * The invariant: ERM never sees a request before the gate, and ERM cannot make
 * a document visible to the employee. Only release does that.
 */
class EssErmDocumentLoopTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function tokenFor(int $systemUserId): string
    {
        $this->resetAuthGuards();

        return SystemUser::findOrFail($systemUserId)->createToken('test-token')->plainTextToken;
    }

    /** Employee user (role 3) linked to employee_id 5. */
    private function employeeToken(): string
    {
        return $this->tokenFor(4);
    }

    /** Records/HR user (role 2) with Employee Records: Edit. */
    private function recordsToken(): string
    {
        return $this->tokenFor(2);
    }

    public function test_employee_cannot_read_the_admin_queue_or_work_module_queues(): void
    {
        // The Employee role has View on ESS Management so it can open the
        // portal. That must not expose the company-wide queue or module actions.
        $this->getJson('/api/v1/ess/admin/requests', $this->authHeaders($this->employeeToken()))
            ->assertForbidden();

        $this->getJson('/api/v1/ess/modules/attendance/requests', $this->authHeaders($this->employeeToken()))
            ->assertForbidden();

        // The HR/Admin role has edit-grade ESS Management access (interim owner
        // of Attendance/Payroll/Performance) and can open the queue.
        $this->getJson('/api/v1/ess/modules/attendance/requests', $this->authHeaders($this->recordsToken()))
            ->assertOk();
    }

    public function test_employee_files_document_request_and_records_fulfils_it(): void
    {
        Storage::fake('public');

        // 1. Employee files an HR Document request in ESS.
        $created = $this->postJson('/api/v1/ess/requests', [
            'category_code' => 'hr_document',
            'category_name' => 'HR Document',
            'request_type' => 'Certificate of Employment',
            'details' => 'Please provide a COE for a bank loan application.',
        ], $this->authHeaders($this->employeeToken()))
            ->assertCreated()
            ->json('request');

        $code = $created['request_code'];
        $this->assertSame('Pending', $created['status']);
        $this->assertDatabaseHas('ess_request_status_histories', [
            'ess_request_id' => EssRequest::where('request_code', $code)->value('ess_request_id'),
            'status' => 'Pending',
        ]);

        // 2. GATE: the request is NOT in the ERM inbox yet.
        $inbox = $this->getJson('/api/v1/erm/document-requests', $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->json();

        $this->assertNotContains($code, array_column($inbox['requests'], 'id'));

        // 3. Records cannot bypass the gate: the request is not in their queue.
        $blockedFile = UploadedFile::fake()->create('coe.pdf', 12, 'application/pdf');
        $this->post('/api/v1/erm/document-requests/' . $code . '/fulfill', [
            'file' => $blockedFile,
        ], $this->authHeaders($this->recordsToken()))
            ->assertStatus(404);

        // 4. ESS Management approves and dispatches to ERM.
        $this->postJson('/api/v1/ess/admin/requests/' . $code . '/review', [
            'decision' => 'approve',
        ], $this->authHeaders($this->superAdminToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'For Dispatch')
            ->assertJsonPath('request.routed_module', 'erm');

        // 5. It now appears in the ERM inbox.
        $inbox = $this->getJson('/api/v1/erm/document-requests', $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->json();

        $this->assertContains($code, array_column($inbox['requests'], 'id'));

        // 6. Records staff send the document back. The request becomes
        //    For Release; it is NOT completed and the employee cannot see it.
        $file = UploadedFile::fake()->create('coe.pdf', 12, 'application/pdf');
        $this->post('/api/v1/erm/document-requests/' . $code . '/fulfill', [
            'file' => $file,
            'note' => 'COE issued, signed by HR Manager.',
        ], $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'For Release')
            ->assertJsonPath('request.has_fulfillment', true);

        $this->assertDatabaseHas('ess_requests', [
            'request_code' => $code,
            'status' => 'For Release',
            'routed_module' => 'erm',
        ]);

        $essRequestId = EssRequest::where('request_code', $code)->value('ess_request_id');
        $this->assertDatabaseHas('ess_request_attachments', [
            'ess_request_id' => $essRequestId,
            'direction' => 'hr',
            'source_module' => 'erm',
        ]);
        $this->assertDatabaseMissing('ess_request_status_histories', [
            'ess_request_id' => $essRequestId,
            'status' => 'Completed',
        ]);

        $mineBeforeRelease = collect(
            $this->getJson('/api/v1/ess/my-requests', $this->authHeaders($this->employeeToken()))
                ->assertOk()
                ->json('requests')
        )->firstWhere('id', $code);

        $this->assertNotNull($mineBeforeRelease);
        $this->assertSame('For Release', $mineBeforeRelease['status']);
        $this->assertFalse($mineBeforeRelease['has_fulfillment']);

        // 7. ESS Management releases the result to the employee.
        $this->postJson('/api/v1/ess/admin/requests/' . $code . '/release', [], $this->authHeaders($this->superAdminToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Completed');

        $this->assertDatabaseHas('ess_requests', [
            'request_code' => $code,
            'status' => 'Completed',
        ]);
        $this->assertDatabaseHas('ess_request_status_histories', [
            'ess_request_id' => $essRequestId,
            'status' => 'Completed',
        ]);

        // 8. The employee sees the released document and can download it.
        $mine = $this->getJson('/api/v1/ess/my-requests', $this->authHeaders($this->employeeToken()))
            ->assertOk()
            ->json('requests');

        $row = collect($mine)->firstWhere('id', $code);
        $this->assertNotNull($row);
        $this->assertTrue($row['has_fulfillment']);
        $this->assertNotEmpty($row['timeline']);
        $this->assertSame('hr', $row['attachments'][0]['direction']);
        $this->assertTrue($row['attachments'][0]['has_file']);
    }

    public function test_records_can_fulfil_from_archived_document(): void
    {
        Storage::fake('public');

        $employeeId = 5;
        $document = EmployeeDocument::where('employee_id', $employeeId)->firstOrFail();
        $document->update([
            'file_path' => 'employee-documents/archived-coe.pdf',
            'original_name' => 'archived-coe.pdf',
        ]);
        Storage::disk('public')->put('employee-documents/archived-coe.pdf', 'PDF');

        $request = EssRequest::create([
            'request_code' => 'REQ-TEST-ARCH',
            'employee_id' => $employeeId,
            'request_type' => 'Certificate of Employment',
            'filed_at' => now(),
            'status' => 'For Dispatch',
            'routed_module' => 'erm',
            'routed_at' => now(),
            'details' => 'Archived document fulfilment test.',
        ]);

        $this->post('/api/v1/erm/document-requests/' . $request->request_code . '/fulfill', [
            'document_id' => $document->document_id,
        ], $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'For Release');

        $this->assertDatabaseHas('ess_request_attachments', [
            'ess_request_id' => $request->ess_request_id,
            'direction' => 'hr',
            'source_module' => 'erm',
            'file_path' => 'employee-documents/archived-coe.pdf',
        ]);

        $this->postJson(
            '/api/v1/ess/admin/requests/' . $request->request_code . '/release',
            [],
            $this->authHeaders($this->superAdminToken())
        )->assertOk()->assertJsonPath('request.status', 'Completed');
    }

    public function test_employee_role_cannot_access_erm_document_requests(): void
    {
        $this->getJson('/api/v1/erm/document-requests', $this->authHeaders($this->employeeToken()))
            ->assertStatus(403);
    }
}

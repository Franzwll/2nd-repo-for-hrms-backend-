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
 * Closed-loop ESS <-> ERM document-request workflow.
 *
 * Employee files an HR Document request in ESS -> it appears in the Employee
 * Records fulfilment inbox -> Records staff attach the file and complete it ->
 * the employee sees the fulfilment and can download it.
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

        // 2. It shows up in the ERM fulfilment inbox.
        $inbox = $this->getJson('/api/v1/erm/document-requests', $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->json();

        $codes = array_column($inbox['requests'], 'id');
        $this->assertContains($code, $codes);
        $this->assertGreaterThanOrEqual(1, $inbox['counts']['total']);

        // 3. Records staff fulfil it with a fresh upload.
        $file = UploadedFile::fake()->create('coe.pdf', 12, 'application/pdf');
        $this->post('/api/v1/erm/document-requests/' . $code . '/fulfill', [
            'file' => $file,
            'note' => 'COE issued, signed by HR Manager.',
        ], $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Completed')
            ->assertJsonPath('request.has_fulfillment', true);

        $this->assertDatabaseHas('ess_requests', [
            'request_code' => $code,
            'status' => 'Completed',
        ]);

        $essRequestId = EssRequest::where('request_code', $code)->value('ess_request_id');
        $this->assertDatabaseHas('ess_request_attachments', [
            'ess_request_id' => $essRequestId,
            'direction' => 'hr',
        ]);
        $this->assertDatabaseHas('ess_request_status_histories', [
            'ess_request_id' => $essRequestId,
            'status' => 'Completed',
        ]);

        // 4. The employee sees the fulfilment and a non-empty timeline.
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
            'status' => 'Pending',
            'details' => 'Archived document fulfilment test.',
        ]);

        $this->post('/api/v1/erm/document-requests/' . $request->request_code . '/fulfill', [
            'document_id' => $document->document_id,
        ], $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonPath('request.status', 'Completed');

        $this->assertDatabaseHas('ess_request_attachments', [
            'ess_request_id' => $request->ess_request_id,
            'direction' => 'hr',
            'file_path' => 'employee-documents/archived-coe.pdf',
        ]);
    }

    public function test_employee_role_cannot_access_erm_document_requests(): void
    {
        $this->getJson('/api/v1/erm/document-requests', $this->authHeaders($this->employeeToken()))
            ->assertStatus(403);
    }
}

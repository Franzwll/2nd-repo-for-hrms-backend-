<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\EmployeeEmergencyContact;
use App\Models\SystemUser;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Employee Records Management (ERM) boundary — the 201 dossier.
 *
 * Covers the dossier read/write, emergency contacts, document repository,
 * archive/restore, the Core HCM -> ERM status seam, and PII gating.
 */
class ErmDossierTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function tokenFor(int $systemUserId): string
    {
        $this->resetAuthGuards();

        return SystemUser::findOrFail($systemUserId)->createToken('test-token')->plainTextToken;
    }

    /** Employee Records: Edit (Admin, role 2). */
    private function recordsToken(): string
    {
        return $this->tokenFor(2);
    }

    /** Employee (role 3) — no Employee Records access. */
    private function employeeToken(): string
    {
        return $this->tokenFor(4);
    }

    public function test_edit_level_dossier_masks_government_ids(): void
    {
        $employee = Employee::orderBy('employee_id')->firstOrFail();

        $this->getJson("/api/v1/erm/employees/{$employee->employee_id}", $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonPath('data.employee_id', $employee->employee_id)
            ->assertJsonPath('data.pii_masked', true)
            ->assertJsonPath('data.sss_number', null)
            ->assertJsonPath('data.philhealth_number', null);
    }

    public function test_super_admin_sees_government_ids(): void
    {
        $employee = Employee::orderBy('employee_id')->firstOrFail();
        $employee->forceFill([
            'sss_number' => '34-1234567-8',
            'philhealth_number' => '12-345678901-2',
        ])->save();

        $this->getJson("/api/v1/erm/employees/{$employee->employee_id}", $this->authHeaders($this->superAdminToken()))
            ->assertOk()
            ->assertJsonPath('data.pii_masked', false)
            ->assertJsonPath('data.sss_number', '34-1234567-8')
            ->assertJsonPath('data.philhealth_number', '12-345678901-2');
    }

    public function test_records_can_update_dossier_personal_fields(): void
    {
        $employee = Employee::orderBy('employee_id')->firstOrFail();

        $this->putJson("/api/v1/erm/employees/{$employee->employee_id}/dossier", [
            'phone' => '0917-000-1234',
            'address' => '123 Dossier Street, Manila',
            'civil_status' => 'Single',
            'tin_number' => '123-456-789',
        ], $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonPath('data.phone', '0917-000-1234');

        $this->assertDatabaseHas('employees', [
            'employee_id' => $employee->employee_id,
            'phone' => '0917-000-1234',
            'civil_status' => 'Single',
        ]);

        // Dossier edits are an ERM concern in the audit stream.
        $this->assertDatabaseHas('audit_logs', [
            'module_name' => 'Employee Records',
            'action' => 'Employee dossier updated',
        ]);
    }

    public function test_emergency_contact_lifecycle(): void
    {
        $employee = Employee::orderBy('employee_id')->firstOrFail();
        DB::table('employee_emergency_contacts')->where('employee_id', $employee->employee_id)->delete();

        $created = $this->postJson(
            "/api/v1/erm/employees/{$employee->employee_id}/emergency-contacts",
            ['name' => 'Jane Doe', 'relationship' => 'Spouse', 'phone' => '0999-111-2222', 'is_primary' => true],
            $this->authHeaders($this->recordsToken())
        )->assertCreated()->json('contact');

        $contactId = $created['emergency_contact_id'];
        $this->assertTrue($created['is_primary']);

        $this->putJson(
            "/api/v1/erm/employees/{$employee->employee_id}/emergency-contacts/{$contactId}",
            ['name' => 'Jane A. Doe', 'relationship' => 'Spouse', 'phone' => '0999-333-4444'],
            $this->authHeaders($this->recordsToken())
        )->assertOk()->assertJsonPath('contact.name', 'Jane A. Doe');

        $this->assertDatabaseHas('employee_emergency_contacts', [
            'emergency_contact_id' => $contactId,
            'name' => 'Jane A. Doe',
        ]);

        $this->deleteJson(
            "/api/v1/erm/employees/{$employee->employee_id}/emergency-contacts/{$contactId}",
            [],
            $this->authHeaders($this->recordsToken())
        )->assertOk();

        $this->assertDatabaseMissing('employee_emergency_contacts', ['emergency_contact_id' => $contactId]);
    }

    public function test_document_upload_verify_and_delete(): void
    {
        Storage::fake('public');

        $employee = Employee::orderBy('employee_id')->firstOrFail();

        $created = $this->post("/api/v1/erm/employees/{$employee->employee_id}/documents", [
            'title' => 'NBI Clearance 2026',
            'category' => 'Clearance',
            'file' => UploadedFile::fake()->create('nbi.pdf', 20, 'application/pdf'),
        ], $this->authHeaders($this->recordsToken()))
            ->assertCreated()
            ->json('document');

        $documentId = $created['document_id'];
        $this->assertStringStartsWith('DOC-', $created['document_code']);
        $this->assertTrue($created['has_file']);

        $this->getJson("/api/v1/erm/employees/{$employee->employee_id}/documents", $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonFragment(['document_id' => $documentId]);

        $this->postJson(
            "/api/v1/erm/employees/{$employee->employee_id}/documents/{$documentId}/verify",
            ['status' => 'Verified'],
            $this->authHeaders($this->recordsToken())
        )->assertOk()->assertJsonPath('document.document_status', 'Verified');

        $this->deleteJson(
            "/api/v1/erm/employees/{$employee->employee_id}/documents/{$documentId}",
            [],
            $this->authHeaders($this->recordsToken())
        )->assertOk();

        $this->assertSoftDeleted('employee_documents', ['document_id' => $documentId]);
    }

    public function test_document_metadata_can_be_updated(): void
    {
        Storage::fake('public');

        $employee = Employee::orderBy('employee_id')->firstOrFail();

        $created = $this->post("/api/v1/erm/employees/{$employee->employee_id}/documents", [
            'title' => 'Old Title',
            'category' => 'Others',
        ], $this->authHeaders($this->recordsToken()))->assertCreated()->json('document');

        $documentId = $created['document_id'];

        $this->putJson(
            "/api/v1/erm/employees/{$employee->employee_id}/documents/{$documentId}",
            ['title' => 'New Title', 'category' => 'Clearance'],
            $this->authHeaders($this->recordsToken())
        )->assertOk()->assertJsonPath('document.title', 'New Title');

        $this->assertDatabaseHas('employee_documents', [
            'document_id' => $documentId,
            'title' => 'New Title',
            'category' => 'Clearance',
        ]);
    }

    public function test_archive_and_restore_round_trip(): void
    {
        $employee = Employee::whereNotIn('status', ['Active', 'On Leave'])->first()
            ?? Employee::orderBy('employee_id')->firstOrFail();

        $employee->forceFill(['status' => 'Resigned'])->save();
        $id = $employee->employee_id;

        $this->postJson("/api/v1/erm/employees/{$id}/archive", [], $this->authHeaders($this->recordsToken()))
            ->assertOk();

        $this->assertSoftDeleted('employees', ['employee_id' => $id]);

        $this->getJson('/api/v1/erm/employees/archived', $this->authHeaders($this->recordsToken()))
            ->assertOk()
            ->assertJsonFragment(['employee_id' => $id]);

        $this->postJson("/api/v1/erm/employees/{$id}/restore", [], $this->authHeaders($this->recordsToken()))
            ->assertOk();

        $this->assertDatabaseHas('employees', ['employee_id' => $id, 'deleted_at' => null]);
    }

    public function test_core_hcm_exit_feeds_erm_audit_stream(): void
    {
        $token = $this->superAdminToken();

        $employee = $this->postJson('/api/v1/employees', [
            'first_name' => 'Seam',
            'last_name' => 'Check',
            'email' => 'seam.check@oxfordsuites.com.ph',
            'gender' => 'Male',
            'birth_date' => '1991-02-03',
            'department_id' => 1,
            'position_id' => 1,
            'employment_type' => 'Probationary',
            'status' => 'Active',
            'date_hired' => '2026-08-01',
        ], $this->authHeaders($token))->assertCreated()->json('data');

        $this->postJson("/api/v1/employees/{$employee['employee_id']}/exit", [
            'effective_date' => '2026-08-15',
            'exit_type' => 'Resigned',
            'exit_date' => '2026-08-15',
        ], $this->authHeaders($token))->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'module_name' => 'Employee Records',
            'action' => 'Employee record sync: exit',
        ]);
    }

    public function test_employee_role_cannot_access_dossier(): void
    {
        $employee = Employee::orderBy('employee_id')->firstOrFail();

        $this->getJson("/api/v1/erm/employees/{$employee->employee_id}", $this->authHeaders($this->employeeToken()))
            ->assertStatus(403);
    }
}

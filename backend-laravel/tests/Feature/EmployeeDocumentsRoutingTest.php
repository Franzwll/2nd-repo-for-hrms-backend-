<?php

namespace Tests\Feature;

use App\Models\EmployeeDocument;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantDocument;
use Modules\EmployeeRecords\Services\EmployeeRecordProvisioner;
use Modules\NewHireOnboarding\Models\EmployeeOnboardingItem;
use Modules\NewHireOnboarding\Models\NewHire;
use Modules\NewHireOnboarding\Services\NewHireIntakeService;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Documents a hire brings with them must reach Employee Records Management
 * (ERM) once they are an employee: the applicant's resume / supporting
 * documents and the files uploaded against the onboarding checklist.
 */
class EmployeeDocumentsRoutingTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function applicantWithDocuments(): Applicant
    {
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code'       => Applicant::generateCode(),
            'job_post_id'          => $jobPost->job_post_id,
            'name'                 => 'Doc Route',
            'email'                => 'doc.route@example.com',
            'status'               => 'fit',
            'stage'                => 'Offer',
            'resume_file_path'     => 'resumes/route-cv.pdf',
            'resume_original_name' => 'route-cv.pdf',
            'resume_hash'          => 'abc123',
        ]);

        ApplicantDocument::create([
            'applicant_id' => $applicant->applicant_id,
            'doc_type'     => 'Certificate',
            'title'        => 'Food Safety Certificate',
            'file_path'    => 'resumes/cert.pdf',
            'original_name' => 'cert.pdf',
        ]);

        return $applicant;
    }

    private function newHireFor(Applicant $applicant): NewHire
    {
        $jobPost = JobPost::query()->firstOrFail();

        return NewHire::create([
            'new_hire_code' => NewHire::generateCode(),
            'applicant_id'  => $applicant->applicant_id,
            'name'          => $applicant->name,
            'email'         => $applicant->email,
            'position_id'   => $jobPost->position_id,
            'department_id' => $jobPost->department_id,
            'stage'         => 'Pre-onboarding',
            'start_date'    => '2026-11-03',
        ]);
    }

    public function test_applicant_documents_are_filed_into_erm_when_employee_is_provisioned(): void
    {
        $applicant = $this->applicantWithDocuments();
        $newHire = $this->newHireFor($applicant);

        $employee = NewHireIntakeService::ensureEmployeeRecord($newHire, 'Probationary');
        $this->assertNotNull($employee);

        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employee->employee_id,
            'source_type' => 'applicant_resume',
            'source_id'   => $applicant->applicant_id,
            'category'    => 'Resume',
        ]);
        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employee->employee_id,
            'source_type' => 'applicant_document',
            'category'    => 'Certificate',
        ]);

        // Running again must not duplicate anything.
        NewHireIntakeService::ensureEmployeeRecord($newHire->fresh());
        $this->assertSame(
            1,
            EmployeeDocument::where('employee_id', $employee->employee_id)
                ->where('source_type', 'applicant_resume')
                ->count(),
        );
    }

    public function test_backfill_command_restores_missing_erm_documents(): void
    {
        $applicant = $this->applicantWithDocuments();
        $newHire = $this->newHireFor($applicant);
        $employee = NewHireIntakeService::ensureEmployeeRecord($newHire, 'Probationary');
        $this->assertNotNull($employee);

        EmployeeDocument::where('employee_id', $employee->employee_id)->forceDelete();

        $this->artisan('erm:backfill-documents', ['--employee' => $employee->employee_id])
            ->assertExitCode(0);

        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employee->employee_id,
            'source_type' => 'applicant_resume',
            'source_id'   => $applicant->applicant_id,
        ]);
        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employee->employee_id,
            'source_type' => 'applicant_document',
            'category'    => 'Certificate',
        ]);

        $this->artisan('erm:backfill-documents', ['--employee' => $employee->employee_id])
            ->assertExitCode(0);

        $this->assertSame(
            1,
            EmployeeDocument::where('employee_id', $employee->employee_id)
                ->where('source_type', 'applicant_resume')
                ->count(),
        );
    }

    public function test_onboarding_uploads_are_filed_into_erm_for_employees(): void
    {
        $applicant = $this->applicantWithDocuments();
        $newHire = $this->newHireFor($applicant);
        $employee = NewHireIntakeService::ensureEmployeeRecord($newHire, 'Probationary');

        $item = EmployeeOnboardingItem::create([
            'employee_id' => $employee->employee_id,
            'new_hire_id' => $newHire->new_hire_id,
            'item_text'   => 'NBI Clearance',
            'file_path'   => 'onboarding_documents/nbi.pdf',
            'file_name'   => 'nbi.pdf',
            'done'        => true,
        ]);

        app(EmployeeRecordProvisioner::class)->fromOnboardingItems($newHire, $employee);

        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employee->employee_id,
            'source_type' => 'onboarding_item',
            'source_id'   => $item->employee_onboarding_item_id,
            'title'       => 'NBI Clearance',
            'document_status' => 'Verified',
        ]);

        // Idempotent.
        $created = app(EmployeeRecordProvisioner::class)
            ->fromOnboardingItems($newHire->fresh(), $employee);
        $this->assertSame(0, $created);

        // A re-upload refreshes the existing ERM copy instead of duplicating it.
        $item->update([
            'file_path' => 'onboarding_documents/nbi-v2.pdf',
            'file_name' => 'nbi-v2.pdf',
            'done' => false,
        ]);
        app(EmployeeRecordProvisioner::class)->fromOnboardingItems($newHire->fresh(), $employee);

        $this->assertSame(
            1,
            EmployeeDocument::where('employee_id', $employee->employee_id)
                ->where('source_type', 'onboarding_item')
                ->count(),
        );
        $this->assertDatabaseHas('employee_documents', [
            'employee_id' => $employee->employee_id,
            'source_type' => 'onboarding_item',
            'source_id' => $item->employee_onboarding_item_id,
            'file_path' => 'onboarding_documents/nbi-v2.pdf',
            'document_status' => 'Pending Verification',
        ]);
    }
}

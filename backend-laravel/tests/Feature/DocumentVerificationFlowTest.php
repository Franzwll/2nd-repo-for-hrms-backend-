<?php

namespace Tests\Feature;

use App\Services\NlpService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantDocument;
use Modules\ApplicantManagement\Models\ApplicantScreening;
use Modules\ApplicantManagement\Services\ScreeningService;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Regression coverage for the public landing application flow: supporting
 * documents are uploaded BEFORE the resume is screened, so at upload time
 * there is no resume profile to compare them against and they are parked at
 * PENDING. Once the screening is persisted they must be verified automatically
 * — otherwise "Resume vs Documents Match" stays empty forever and the
 * documents never influence the ranking score.
 */
class DocumentVerificationFlowTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function makeApplicant(): Applicant
    {
        $job = JobPost::where('active', 1)->firstOrFail();

        Storage::fake('public');
        Storage::disk('public')->put('resumes/maria-santos.pdf', 'resume-bytes');
        Storage::disk('public')->put('applicant-documents/coe.pdf', 'coe-bytes');

        return Applicant::create([
            'applicant_code' => 'APP-90001',
            'job_post_id' => $job->job_post_id,
            'name' => 'Maria Santos',
            'email' => 'maria.santos@example.com',
            'phone' => '0917-555-1234',
            'applied_at' => now(),
            'status' => 'fit',
            'stage' => 'Screened',
            'source' => 'Landing Page',
            'resume_file_path' => 'resumes/maria-santos.pdf',
            'resume_original_name' => 'maria-santos.pdf',
        ]);
    }

    private function makePendingDocument(Applicant $applicant): ApplicantDocument
    {
        return ApplicantDocument::create([
            'applicant_id' => $applicant->applicant_id,
            'doc_type' => 'COE',
            'title' => 'Certificate of Employment',
            'file_path' => 'applicant-documents/coe.pdf',
            'original_name' => 'coe.pdf',
            'verification_status' => 'PENDING',
        ]);
    }

    private function precomputedScreening(): array
    {
        return [
            'success' => true,
            'processing_status' => 'PROCESSED',
            'screening_status' => 'PERFECT_FOR_THE_JOB',
            'match_score' => 80,
            'resume_match_score' => 80,
            'matched_summary' => 'Matches the role requirements.',
            'score_breakdown' => ['skills' => ['earned' => 80]],
            'profile' => [
                'name' => 'Maria Santos',
                'work_experience' => [
                    ['company' => 'Acme Hotel', 'job_title' => 'Front Desk Agent', 'start_date' => '2020-01', 'end_date' => '2023-01'],
                ],
            ],
            'entities' => [],
            'validation' => ['missing_information' => []],
            'alternative_job' => null,
            'document_verification' => null,
            'screening_reasons' => [],
            'model_info' => null,
        ];
    }

    public function test_pending_documents_are_verified_once_the_resume_is_screened(): void
    {
        $applicant = $this->makeApplicant();
        $document = $this->makePendingDocument($applicant);

        $nlp = Mockery::mock(NlpService::class);
        $nlp->shouldReceive('verifySupportingDocument')->once()->andReturn([
            'ok' => true,
            'data' => [
                'success' => true,
                'document_type' => 'COE',
                'verification_status' => 'VERIFIED',
                'summary' => 'Employer and job title match the resume.',
                'checks' => [
                    'company' => [
                        'resume_value' => 'Acme Hotel',
                        'document_value' => 'Acme Hotel',
                        'result' => 'MATCH',
                    ],
                ],
                'extracted_document_profile' => ['name' => 'Maria Santos'],
            ],
            'error' => null,
        ]);
        $nlp->shouldReceive('reclassifyScreening')->once()->andReturn([
            'ok' => true,
            'data' => [
                'success' => true,
                'screening_status' => 'PERFECT_FOR_THE_JOB',
                'match_score' => 88,
                'resume_match_score' => 80,
                'matched_summary' => 'Matches the role requirements.',
                'alternative_job' => null,
                'screening_reasons' => [],
                'document_verification' => [
                    'status' => 'VERIFIED',
                    'verified_count' => 1,
                    'discrepancy_count' => 0,
                    'unable_count' => 0,
                    'flags' => [],
                ],
            ],
            'error' => null,
        ]);
        $this->app->instance(NlpService::class, $nlp);

        $screening = app(ScreeningService::class)
            ->screenAndPersist($applicant, $this->precomputedScreening());

        $this->assertNotNull($screening);

        // The document is no longer stuck at PENDING and carries a real verdict.
        $document->refresh();
        $this->assertSame('VERIFIED', $document->verification_status);
        $this->assertSame('MATCH', $document->verification_result_json['checks']['company']['result']);
        $this->assertSame('Maria Santos', $document->extracted_profile_json['name']);

        // The evidence was blended into the ranking, not just stored.
        $screening->refresh();
        $this->assertEquals(88, (float) $screening->match_score);
        $this->assertSame('VERIFIED', $screening->document_verification_json['status']);
        $this->assertSame('fit', $applicant->refresh()->status);
        $this->assertEquals(88, (float) $applicant->fit_score);
    }

    public function test_landing_apply_with_a_supporting_document_returns_a_real_match_result(): void
    {
        $job = JobPost::where('active', 1)->firstOrFail();

        $nlp = Mockery::mock(NlpService::class);
        $nlp->shouldReceive('screenResumeStructured')->once()->andReturn([
            'ok' => true,
            'error' => null,
            'data' => $this->precomputedScreening(),
        ]);
        $nlp->shouldReceive('verifySupportingDocument')->once()->andReturn([
            'ok' => true,
            'error' => null,
            'data' => [
                'success' => true,
                'document_type' => 'COE',
                'verification_status' => 'VERIFIED',
                'summary' => 'Employer and job title match the resume.',
                'checks' => [
                    'company' => [
                        'resume_value' => 'Acme Hotel',
                        'document_value' => 'Acme Hotel',
                        'result' => 'MATCH',
                    ],
                    'position' => [
                        'resume_value' => 'Front Desk Agent',
                        'document_value' => 'Front Desk Agent',
                        'result' => 'MATCH',
                    ],
                ],
                'extracted_document_profile' => ['name' => 'Maria Santos'],
            ],
        ]);
        $nlp->shouldReceive('reclassifyScreening')->once()->andReturn([
            'ok' => true,
            'error' => null,
            'data' => [
                'success' => true,
                'screening_status' => 'PERFECT_FOR_THE_JOB',
                'match_score' => 88,
                'resume_match_score' => 80,
                'matched_summary' => 'Matches the role requirements.',
                'alternative_job' => null,
                'screening_reasons' => [],
                'document_verification' => [
                    'status' => 'VERIFIED',
                    'verified_count' => 1,
                    'discrepancy_count' => 0,
                    'unable_count' => 0,
                    'flags' => [],
                ],
            ],
        ]);
        $this->app->instance(NlpService::class, $nlp);

        Storage::fake('public');

        $response = $this->post('/api/v1/landing/apply', [
            'job_post_id' => $job->job_post_id,
            'name' => 'Maria Santos',
            'email' => 'maria.landing@example.com',
            'phone' => '0917-555-1234',
            'resume' => UploadedFile::fake()->create('maria-santos.pdf', 100, 'application/pdf'),
            'verification_docs' => [UploadedFile::fake()->create('coe.pdf', 100, 'application/pdf')],
            'verification_doc_types' => ['COE'],
        ])->assertCreated();

        $applicantId = $response->json('data.applicant_id');
        $document = ApplicantDocument::where('applicant_id', $applicantId)->firstOrFail();

        // Before the fix this stayed PENDING (no checks) forever, so the
        // Resume vs Documents Match panel had nothing to show.
        $this->assertSame('VERIFIED', $document->verification_status);
        $this->assertSame('MATCH', $document->verification_result_json['checks']['company']['result']);
        $this->assertNotEmpty($document->verification_result_json['checks']);
        $this->assertSame('Maria Santos', $document->extracted_profile_json['name']);

        $this->assertDatabaseHas('applicants', [
            'applicant_id' => $applicantId,
            'fit_score' => 88,
        ]);
    }

    public function test_backfill_command_verifies_documents_left_pending_by_the_old_flow(): void
    {
        $applicant = $this->makeApplicant();
        $document = $this->makePendingDocument($applicant);

        // The screening already exists (it ran after the documents were
        // uploaded) but the documents were never re-checked — the state the
        // old landing flow left behind.
        ApplicantScreening::create([
            'applicant_id' => $applicant->applicant_id,
            'job_post_id' => $applicant->job_post_id,
            'processing_status' => 'PROCESSED',
            'screening_result' => 'fit',
            'match_score' => 80,
            'resume_match_score' => 80,
            'profile_json' => $this->precomputedScreening()['profile'],
            'validation_json' => ['missing_information' => []],
            'processed_at' => now(),
        ]);

        $nlp = Mockery::mock(NlpService::class);
        $nlp->shouldReceive('verifySupportingDocument')->once()->andReturn([
            'ok' => true,
            'error' => null,
            'data' => [
                'success' => true,
                'document_type' => 'COE',
                'verification_status' => 'VERIFIED',
                'summary' => 'Employer matches the resume.',
                'checks' => [
                    'company' => [
                        'resume_value' => 'Acme Hotel',
                        'document_value' => 'Acme Hotel',
                        'result' => 'MATCH',
                    ],
                ],
                'extracted_document_profile' => ['name' => 'Maria Santos'],
            ],
        ]);
        $nlp->shouldReceive('reclassifyScreening')->once()->andReturn([
            'ok' => true,
            'error' => null,
            'data' => [
                'success' => true,
                'screening_status' => 'PERFECT_FOR_THE_JOB',
                'match_score' => 88,
                'resume_match_score' => 80,
                'matched_summary' => 'Matches the role requirements.',
                'alternative_job' => null,
                'screening_reasons' => [],
                'document_verification' => [
                    'status' => 'VERIFIED',
                    'verified_count' => 1,
                    'discrepancy_count' => 0,
                    'unable_count' => 0,
                    'flags' => [],
                ],
            ],
        ]);
        $this->app->instance(NlpService::class, $nlp);

        $this->artisan('applicants:verify-pending-documents', [
            '--applicant' => $applicant->applicant_id,
        ])->assertSuccessful();

        $this->assertSame('VERIFIED', $document->refresh()->verification_status);
        $this->assertSame('MATCH', $document->verification_result_json['checks']['company']['result']);
        $this->assertEquals(88, (float) $applicant->refresh()->fit_score);
    }

    public function test_already_verified_documents_do_not_trigger_another_recompute(): void
    {
        $applicant = $this->makeApplicant();

        ApplicantDocument::create([
            'applicant_id' => $applicant->applicant_id,
            'doc_type' => 'COE',
            'title' => 'Certificate of Employment',
            'file_path' => 'applicant-documents/coe.pdf',
            'original_name' => 'coe.pdf',
            'verification_status' => 'VERIFIED',
            'verified_at' => now(),
        ]);

        $nlp = Mockery::mock(NlpService::class);
        $nlp->shouldReceive('verifySupportingDocument')->never();
        $nlp->shouldReceive('reclassifyScreening')->never();
        $this->app->instance(NlpService::class, $nlp);

        $screening = app(ScreeningService::class)
            ->screenAndPersist($applicant, $this->precomputedScreening());

        $this->assertNotNull($screening);
        $this->assertSame('PROCESSED', $screening->processing_status);
    }
}

<?php

namespace Modules\ApplicantManagement\Services;

use App\Services\AuditLogger;
use App\Services\NlpService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\ApplicantManagement\Http\Controllers\ScreeningReferenceController;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantDocument;
use Modules\ApplicantManagement\Services\ScreeningService;

/**
 * Orchestrates supporting-document verification:
 *  1. loads the applicant's latest resume screening profile (applicant_screenings.profile_json),
 *  2. resolves the stored document file,
 *  3. calls the Python NLP service (document text extraction + field comparison),
 *  4. persists the structured result back on the applicant_documents row,
 *  5. logs the action through AuditLogger.
 *
 * Documents uploaded before any screening exists stay at PENDING and can be
 * re-verified later via POST /api/v1/applicant-documents/{id}/verify (e.g.
 * after the resume has been re-screened). The existing resume screening and
 * 7-point credential verification pipeline is completely untouched.
 */
class DocumentVerificationService
{
    public function __construct(protected NlpService $nlp)
    {
    }

    public function verifyDocument(ApplicantDocument $document): ApplicantDocument
    {
        $document->update(['verification_status' => 'PROCESSING']);

        try {
            $resumeProfile = $this->resumeProfile($document);

            if (empty($resumeProfile)) {
                $document->update([
                    'verification_status'      => 'PENDING',
                    'verification_result_json' => [
                        'success'             => false,
                        'document_type'       => $document->doc_type,
                        'verification_status' => 'PENDING',
                        'checks'              => [],
                        'summary'             => 'Waiting for the applicant\'s resume screening — the document will be compared against the resume claims once a screening profile is available.',
                    ],
                    'verified_at'              => null,
                ]);

                return $document->refresh();
            }

            $filePath = $this->absolutePath($document);
            if (!$filePath || !is_file($filePath)) {
                $document->update([
                    'verification_status'      => 'UNABLE_TO_VERIFY',
                    'verification_result_json' => [
                        'success'             => false,
                        'document_type'       => $document->doc_type,
                        'verification_status' => 'UNABLE_TO_VERIFY',
                        'checks'              => [],
                        'summary'             => 'The stored document file could not be found on disk, so no comparison against the resume claims was possible.',
                        'error'               => 'Stored file missing: ' . ($document->file_path ?? 'null'),
                    ],
                    'verified_at'              => now(),
                ]);

                return $document->refresh();
            }

            $result = $this->nlp->verifySupportingDocument(
                $filePath,
                $document->original_name ?: basename($filePath),
                (string) $document->doc_type,
                $resumeProfile,
                $this->referenceData()
            );

            if (!($result['ok'] ?? false)) {
                $document->update([
                    'verification_status'      => 'UNABLE_TO_VERIFY',
                    'verification_result_json' => [
                        'success'             => false,
                        'document_type'       => $document->doc_type,
                        'verification_status' => 'UNABLE_TO_VERIFY',
                        'checks'              => [],
                        'summary'             => 'Automatic verification failed: ' . ($result['error'] ?? 'unknown error'),
                        'error'               => $result['error'] ?? null,
                    ],
                    'verified_at'              => now(),
                ]);
            } else {
                $data = $result['data'] ?? [];
                $document->update([
                    'verification_status'      => $data['verification_status'] ?? 'UNABLE_TO_VERIFY',
                    'verification_result_json' => $data,
                    'extracted_profile_json'   => $data['extracted_document_profile'] ?? null,
                    'verified_at'              => now(),
                ]);
            }

            AuditLogger::log(
                action: 'Verification Document Checked',
                module: 'Applicant Management',
                severity: $document->verification_status === 'DISCREPANCY_FOUND' ? 'Warning' : 'Info',
                targetType: 'Applicant Document',
                targetId: (string) $document->applicant_document_id,
                details: sprintf(
                    'Supporting-document verification for %s (%s): %s.',
                    $document->original_name ?: ($document->title ?: 'document #' . $document->applicant_document_id),
                    $document->doc_type,
                    $document->verification_status
                )
            );

            // Feed the fresh verification result into the applicant's ranking:
            // the screening score/status is recomputed with the document
            // evidence, so the percentage, rank order and official status stay
            // in sync (a discrepancy flips the candidate to Invalid credential).
            $this->refreshRanking($document->applicant, 'document verification');
        } catch (\Throwable $e) {
            Log::error('Supporting-document verification failed: ' . $e->getMessage());

            $document->update([
                'verification_status'      => 'UNABLE_TO_VERIFY',
                'verification_result_json' => [
                    'success'             => false,
                    'document_type'       => $document->doc_type,
                    'verification_status' => 'UNABLE_TO_VERIFY',
                    'checks'              => [],
                    'summary'             => 'Automatic verification failed: ' . $e->getMessage(),
                    'error'               => $e->getMessage(),
                ],
                'verified_at'              => now(),
            ]);
        }

        return $document->refresh();
    }

    /**
     * Refreshes the applicant's screening score and status with the current
     * supporting-document evidence. Called after a document is verified or
     * removed. Failures are logged and never bubble up: a document action must
     * always complete for HR even when the NLP service is offline.
     */
    public function refreshRanking(?Applicant $applicant, string $reason = 'document verification'): void
    {
        if (! $applicant) {
            return;
        }

        try {
            $screening = app(ScreeningService::class)->recomputeWithDocuments($applicant);
            if (! $screening) {
                return;
            }

            AuditLogger::log(
                action: 'Screening Recomputed With Supporting Documents',
                module: 'Applicant Management',
                severity: $screening->screening_result === 'credential' ? 'Warning' : 'Info',
                targetType: 'Applicant',
                targetId: (string) $applicant->applicant_id,
                details: sprintf(
                    'Ranking score refreshed to %s%% (%s) after %s for %s.',
                    rtrim(rtrim((string) $screening->match_score, '0'), '.'),
                    $screening->screening_result ?? 'unchanged',
                    $reason,
                    $applicant->name
                )
            );
        } catch (\Throwable $e) {
            Log::warning('Could not recompute the screening ranking after document verification: ' . $e->getMessage());
        }
    }

    /**
     * The applicant's latest resume screening profile; null when the applicant
     * has not been screened yet (or the screening produced no profile).
     */
    protected function resumeProfile(ApplicantDocument $document): ?array
    {
        $applicant = $document->applicant;
        if (!$applicant) {
            return null;
        }

        $screening = $applicant->screenings()->latest('screening_id')->first();
        $profile = $screening?->profile_json; // array-cast by the model

        return is_array($profile) && $profile !== [] ? $profile : null;
    }

    protected function absolutePath(ApplicantDocument $document): ?string
    {
        if (!$document->file_path) {
            return null;
        }

        try {
            return Storage::disk('public')->path($document->file_path);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * DB-managed reference aliases (skills/job_roles/certifications) shared
     * with resume screening; falls back to the NLP service's bundled seed
     * data when unavailable.
     */
    protected function referenceData(): ?array
    {
        try {
            return ScreeningReferenceController::groupedMapping();
        } catch (\Throwable $e) {
            Log::warning('Screening reference data unavailable for document verification: ' . $e->getMessage());

            return null;
        }
    }
}

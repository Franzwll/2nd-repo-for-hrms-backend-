<?php

namespace Modules\EmployeeRecords\Services;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Support\Facades\Storage;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\NewHireOnboarding\Models\NewHire;

/**
 * Promotes recruitment and onboarding documents into the Employee Records
 * Management (ERM) file set once an applicant becomes an employee.
 *
 * Two sources are covered:
 *  - the applicant's resume and supporting documents (COE, certificates,
 *    credentials) uploaded during recruitment;
 *  - the documents a new hire uploads against their onboarding checklist.
 *
 * Only pointers are copied — the file bytes stay on disk and are never
 * duplicated. Provenance is stored (source_type/source_id) so each ERM
 * document can be traced back to its applicant upload / onboarding item.
 *
 * Idempotent: re-running never creates duplicates.
 */
class EmployeeRecordProvisioner
{
    /**
     * Copies everything a new hire carries (their applicant documents plus any
     * onboarding-checklist uploads) into ERM. Idempotent.
     *
     * @return int number of employee documents created (0 when nothing new)
     */
    public function fromNewHire(NewHire $newHire, Employee $employee, ?Applicant $applicant = null): int
    {
        $created = 0;

        if ($newHire->applicant_id) {
            $applicant ??= Applicant::find($newHire->applicant_id);
        }
        if ($applicant) {
            $created += $this->fromApplicant($applicant, $employee);
        }

        $created += $this->fromOnboardingItems($newHire, $employee);

        return $created;
    }

    /**
     * Copies the documents a hire uploaded against their onboarding checklist
     * (employee_onboarding_items with a stored file) into ERM.
     *
     * @return int number of employee documents created (0 when nothing new)
     */
    public function fromOnboardingItems(NewHire $newHire, Employee $employee): int
    {
        // Query fresh (not loadMissing) so a just-uploaded file is always seen
        // even when the caller already holds a stale relation.
        $items = $newHire->onboardingItems()->get();

        $created = 0;

        foreach ($items as $item) {
            if (empty($item->file_path)) {
                continue;
            }

            $attributes = [
                'title' => $item->item_text ?: 'Onboarding requirement',
                'original_name' => $item->file_name ?: basename((string) $item->file_path),
                'file_path' => $this->normalizePath($item->file_path),
                'mime_type' => $this->guessMime($item->file_name ?: $item->file_path),
                'file_size_bytes' => $this->fileSize($item->file_path),
                'document_status' => $item->done ? 'Verified' : 'Pending Verification',
                'document_date' => optional($item->submitted_at ?? $item->completed_at)->toDateString()
                    ?? now()->toDateString(),
            ];

            // Re-uploads replace the file in place so ERM always mirrors the
            // latest submission instead of keeping the stale first copy.
            $existing = EmployeeDocument::where('employee_id', $employee->employee_id)
                ->where('source_type', 'onboarding_item')
                ->where('source_id', $item->employee_onboarding_item_id)
                ->first();

            if ($existing) {
                $existing->update($attributes);
                continue;
            }

            EmployeeDocument::create($attributes + [
                'employee_id' => $employee->employee_id,
                'document_code' => 'ONB-' . $item->employee_onboarding_item_id,
                'category' => 'Onboarding',
                'source_type' => 'onboarding_item',
                'source_id' => $item->employee_onboarding_item_id,
                'source_hash' => null,
            ]);
            $created++;
        }

        return $created;
    }
    /**
     * @return int number of employee documents created (0 when nothing new)
     */
    public function fromApplicant(Applicant $applicant, Employee $employee): int
    {
        $applicant->loadMissing('documents');

        $created = 0;

        // Resume / CV -------------------------------------------------------
        if (! empty($applicant->resume_file_path)) {
            if (! $this->alreadyCopied($employee, 'applicant_resume', (int) $applicant->applicant_id)) {
                EmployeeDocument::create([
                    'employee_id' => $employee->employee_id,
                    'document_code' => 'RES-' . $applicant->applicant_id,
                    'title' => 'Resume / Curriculum Vitae',
                    'category' => 'Resume',
                    'source_type' => 'applicant_resume',
                    'source_id' => $applicant->applicant_id,
                    'original_name' => $applicant->resume_original_name ?: basename((string) $applicant->resume_file_path),
                    'source_hash' => $applicant->resume_hash,
                    'file_path' => $this->normalizePath($applicant->resume_file_path),
                    'mime_type' => $this->guessMime($applicant->resume_file_path),
                    'file_size_bytes' => null,
                    'document_status' => 'Verified',
                    'document_date' => optional($applicant->applied_at)->toDateString() ?? now()->toDateString(),
                ]);
                $created++;
            }
        }

        // Supporting documents (COE, Certificate, Credential, Others) ------
        foreach ($applicant->documents as $doc) {
            if ($this->alreadyCopied($employee, 'applicant_document', (int) $doc->applicant_document_id)) {
                continue;
            }

            EmployeeDocument::create([
                'employee_id' => $employee->employee_id,
                'document_code' => 'APL-' . $doc->applicant_document_id,
                'title' => $doc->title ?: ($doc->doc_type . ' (application)'),
                'category' => $doc->doc_type ?: 'Others',
                'source_type' => 'applicant_document',
                'source_id' => $doc->applicant_document_id,
                'original_name' => $doc->original_name ?: basename((string) $doc->file_path),
                'source_hash' => null,
                'file_path' => $this->normalizePath($doc->file_path),
                'mime_type' => $this->guessMime($doc->file_path),
                'file_size_bytes' => null,
                'document_status' => 'Pending Verification',
                'document_date' => optional($doc->uploaded_at)->toDateString() ?? now()->toDateString(),
            ]);
            $created++;
        }

        return $created;
    }

    private function alreadyCopied(Employee $employee, string $sourceType, int $sourceId): bool
    {
        return EmployeeDocument::where('employee_id', $employee->employee_id)
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->exists();
    }

    /**
     * Normalise a stored path to the shape the ERM/ESS file streamer expects
     * (relative to the public disk, no leading slash or storage/ prefix).
     */
    private function normalizePath(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        $relative = ltrim($path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        return $relative;
    }

    private function fileSize(?string $path): ?int
    {
        $relative = $this->normalizePath($path);
        if ($relative === null) {
            return null;
        }

        try {
            if (Storage::disk('public')->exists($relative)) {
                return (int) Storage::disk('public')->size($relative);
            }
        } catch (\Throwable) {
            // Size is best-effort metadata.
        }

        return null;
    }

    private function guessMime(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return match ($ext) {
            'pdf' => 'application/pdf',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            default => null,
        };
    }
}

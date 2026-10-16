<?php

namespace Modules\EmployeeRecords\Services;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Modules\ApplicantManagement\Models\Applicant;

/**
 * Promotes an applicant's recruitment documents into the Employee Records
 * Management (ERM) file set once they become an employee.
 *
 * The applicant's resume and supporting documents (COE, certificates,
 * credentials) are recorded as employee_documents so the employee's 201 file
 * is complete from day one. Only pointers are copied — the file bytes stay on
 * disk and are never duplicated. Provenance is stored (source_type/source_id)
 * so each ERM document can be traced back to the applicant upload.
 *
 * Idempotent: re-running for the same applicant never creates duplicates.
 */
class EmployeeRecordProvisioner
{
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

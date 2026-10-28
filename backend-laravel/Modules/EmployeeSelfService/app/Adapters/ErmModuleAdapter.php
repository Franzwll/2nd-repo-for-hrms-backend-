<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\EssRequest;
use App\Models\SystemUser;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeRecords\Services\EmployeeDocumentCodeGenerator;

/**
 * Employee Records module: owns hr_document requests and returns the actual
 * file (fresh upload or an existing archived document).
 */
class ErmModuleAdapter extends BaseModuleAdapter
{
    public function key(): string
    {
        return 'erm';
    }

    /**
     * When ESS Management releases the request, archive the outbound
     * attachment as an EmployeeDocument so it appears in the employee's
     * "My Documents" tab automatically.
     */
    public function onRelease(EssRequest $request): void
    {
        $attachment = $request->outboundAttachment();

        if (! $attachment || ! $attachment->file_path) {
            return;
        }

        // If an archived document was used as the source, it already exists
        // in employee_documents — skip to avoid duplicating.
        $payload = $this->latestResultPayload($request);
        $ref = $payload['reference'] ?? '';
        if (str_starts_with($ref, 'document:')) {
            return;
        }

        $employee = Employee::where('employee_id', $request->employee_id)->first();

        if (! $employee) {
            Log::warning('ErmModuleAdapter::onRelease — employee not found', [
                'employee_id' => $request->employee_id,
                'request_code' => $request->request_code,
            ]);

            return;
        }

        // Prevent creating a duplicate if this request was already archived
        // (e.g. re-release after a file replacement).
        $exists = EmployeeDocument::where('source_type', 'ess_request')
            ->where('source_id', $request->ess_request_id)
            ->exists();

        if ($exists) {
            // Update the existing record in case the file was replaced.
            EmployeeDocument::where('source_type', 'ess_request')
                ->where('source_id', $request->ess_request_id)
                ->update([
                    'file_path'       => $attachment->file_path,
                    'original_name'   => $attachment->original_name,
                    'mime_type'       => $attachment->mime_type,
                    'file_size_bytes' => $attachment->file_size_bytes,
                    'document_status' => 'Verified',
                    'last_updated_at' => now(),
                ]);

            return;
        }

        try {
            app(EmployeeDocumentCodeGenerator::class)->create($employee, [
                'title'           => $request->request_type ?: 'HR Document',
                'category'        => 'HR Document',
                'source_type'     => 'ess_request',
                'source_id'       => $request->ess_request_id,
                'original_name'   => $attachment->original_name,
                'file_path'       => $attachment->file_path,
                'mime_type'       => $attachment->mime_type,
                'file_size_bytes' => $attachment->file_size_bytes,
                'document_status' => 'Verified',
                'document_date'   => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('ErmModuleAdapter::onRelease — failed to archive document', [
                'request_code' => $request->request_code,
                'error'        => $e->getMessage(),
            ]);
        }
    }

    public function validateResult(EssRequest $request, array $payload, ?array $filePayload): void
    {
        if (! $filePayload && empty($payload['document_id'])) {
            throw new \RuntimeException(
                'Attach the requested document (or select an archived document) before sending it back.'
            );
        }

        if (! $filePayload && ! empty($payload['document_id'])) {
            $document = EmployeeDocument::where('document_id', (int) $payload['document_id'])
                ->where('employee_id', $request->employee_id)
                ->first();

            if (! $document) {
                throw new \RuntimeException(
                    'The selected archived document does not belong to this employee.'
                );
            }
        }
    }

    public function applyResult(
        EssRequest $request,
        array $payload,
        ?array $filePayload,
        ?SystemUser $actor
    ): array {
        $reference = null;

        if ($filePayload) {
            $attachment = $this->storeOutboundAttachment($request, $filePayload, $actor, $this->key());
            $reference = $attachment ? 'attachment:' . $attachment->ess_request_attachment_id : null;
        } else {
            $document = EmployeeDocument::where('document_id', (int) $payload['document_id'])
                ->where('employee_id', $request->employee_id)
                ->firstOrFail();

            $attachment = $this->storeOutboundAttachment($request, [
                'file_path' => $document->file_path,
                'original_name' => $document->original_name ?: $document->title,
                'mime_type' => $document->mime_type ?: 'application/pdf',
                'file_size_bytes' => (int) ($document->file_size_bytes ?? 0),
            ], $actor, $this->key());

            $reference = 'document:' . $document->document_id;
        }

        return [
            'reference' => $reference,
            'note' => $payload['note'] ?? null,
        ];
    }

    public function reverseResult(EssRequest $request, ?SystemUser $actor, string $reason): void
    {
        // The archive document itself is untouched; only the outbound copy
        // attached to this request is removed.
        $this->removeModuleAttachments($request, $this->key());
    }
}

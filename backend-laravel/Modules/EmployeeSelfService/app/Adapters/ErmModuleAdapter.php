<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\EmployeeDocument;
use App\Models\EssRequest;
use App\Models\SystemUser;
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

    /**
     * A released request must also appear in the employee's My Documents.
     * Copy the outbound file into employee_documents while leaving the ESS
     * attachment intact. source_type/source_id make repeat releases idempotent.
     */
    public function onRelease(EssRequest $request): void
    {
        $request->loadMissing('employee', 'category', 'attachments');
        $attachment = $request->outboundAttachment();

        if (! $attachment || ! $request->employee) {
            return;
        }

        $alreadyCopied = EmployeeDocument::withTrashed()
            ->where('source_type', 'fulfillment')
            ->where('source_id', $attachment->ess_request_attachment_id)
            ->exists();
        if ($alreadyCopied) {
            return;
        }

        $title = $attachment->original_name
            ?: ($request->request_type ?: 'ESS Fulfilled Document');
        $category = $request->category?->name ?: 'ESS Fulfillment';

        app(EmployeeDocumentCodeGenerator::class)->create($request->employee, [
            'title' => mb_substr($title, 0, 190),
            'category' => mb_substr($category, 0, 75),
            'source_type' => 'fulfillment',
            'source_id' => $attachment->ess_request_attachment_id,
            'original_name' => $attachment->original_name,
            'source_hash' => hash('sha256', implode(':', [
                $request->ess_request_id,
                $attachment->ess_request_attachment_id,
                (string) $attachment->file_path,
            ])),
            'file_path' => $attachment->file_path,
            'mime_type' => $attachment->mime_type,
            'file_size_bytes' => $attachment->file_size_bytes,
            'document_status' => 'Verified',
            'document_date' => now()->toDateString(),
            'last_updated_at' => now(),
        ]);
    }
}

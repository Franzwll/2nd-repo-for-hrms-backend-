<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\EmployeeDocument;
use App\Models\EssRequest;
use App\Models\SystemUser;

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
}

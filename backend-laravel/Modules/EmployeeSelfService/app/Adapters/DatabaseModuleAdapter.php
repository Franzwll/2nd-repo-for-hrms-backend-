<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\EssRequest;
use App\Models\SystemUser;

/**
 * Neutral adapter for modules that are configured but do not ship a dedicated
 * adapter yet. It records a note and optional file, which is enough to run the
 * full gate -> module -> release loop while a real module is being built.
 */
class DatabaseModuleAdapter extends BaseModuleAdapter
{
    public function __construct(private readonly string $module)
    {
    }

    public function key(): string
    {
        return $this->module;
    }

    public function validateResult(EssRequest $request, array $payload, ?array $filePayload): void
    {
        if (! $filePayload && trim((string) ($payload['note'] ?? '')) === '') {
            throw new \RuntimeException('Add a note describing the module result.');
        }
    }

    public function applyResult(
        EssRequest $request,
        array $payload,
        ?array $filePayload,
        ?SystemUser $actor
    ): array {
        $attachment = $this->storeOutboundAttachment($request, $filePayload, $actor, $this->key());

        return [
            'reference' => $attachment ? 'attachment:' . $attachment->ess_request_attachment_id : null,
            'note' => $payload['note'] ?? null,
        ];
    }

    public function reverseResult(EssRequest $request, ?SystemUser $actor, string $reason): void
    {
        $this->removeModuleAttachments($request, $this->key());
    }
}

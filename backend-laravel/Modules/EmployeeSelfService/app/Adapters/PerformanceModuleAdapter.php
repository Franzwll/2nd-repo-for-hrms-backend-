<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\EssRequest;
use App\Models\SystemUser;

/**
 * Performance module: owns promotion, reclassification and career requests.
 * The result is an outcome (approved/rejected) plus a note; the actual grade
 * change is applied by the Performance module, not by ESS.
 */
class PerformanceModuleAdapter extends BaseModuleAdapter
{
    public function key(): string
    {
        return 'performance';
    }

    public function validateResult(EssRequest $request, array $payload, ?array $filePayload): void
    {
        if (trim((string) ($payload['note'] ?? '')) === '') {
            throw new \RuntimeException('Add the performance decision before sending it back.');
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
            'reference' => ! empty($payload['promotion_request_id'])
                ? 'promotion:' . $payload['promotion_request_id']
                : ($attachment ? 'attachment:' . $attachment->ess_request_attachment_id : null),
            'note' => $payload['note'] ?? null,
            'ledger' => ['decision' => $payload['decision'] ?? null],
        ];
    }

    public function reverseResult(EssRequest $request, ?SystemUser $actor, string $reason): void
    {
        $this->removeModuleAttachments($request, $this->key());
    }
}

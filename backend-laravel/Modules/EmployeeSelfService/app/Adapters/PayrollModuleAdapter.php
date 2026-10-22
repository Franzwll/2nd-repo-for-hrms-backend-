<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\EssRequest;
use App\Models\SystemUser;

/**
 * Payroll module: owns payslip copies, tax adjustments, salary advances and
 * benefit/loan inquiries. The result is either a generated payslip file, a
 * reference to an existing payroll record, or an explanatory note.
 */
class PayrollModuleAdapter extends BaseModuleAdapter
{
    public function key(): string
    {
        return 'payroll';
    }

    public function validateResult(EssRequest $request, array $payload, ?array $filePayload): void
    {
        if (! $filePayload && empty($payload['payslip_id']) && trim((string) ($payload['note'] ?? '')) === '') {
            throw new \RuntimeException(
                'Attach the payslip, reference a payroll record, or add a note before sending it back.'
            );
        }
    }

    public function applyResult(
        EssRequest $request,
        array $payload,
        ?array $filePayload,
        ?SystemUser $actor
    ): array {
        $attachment = $this->storeOutboundAttachment($request, $filePayload, $actor, $this->key());

        $reference = ! empty($payload['payslip_id'])
            ? 'payslip:' . $payload['payslip_id']
            : ($attachment ? 'attachment:' . $attachment->ess_request_attachment_id : null);

        return [
            'reference' => $reference,
            'note' => $payload['note'] ?? null,
        ];
    }

    public function reverseResult(EssRequest $request, ?SystemUser $actor, string $reason): void
    {
        $this->removeModuleAttachments($request, $this->key());
    }
}

<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\EssRequest;
use App\Models\LeaveBalance;
use App\Models\SystemUser;
use Carbon\Carbon;

/**
 * Attendance module: owns leave, shift and attendance-correction requests.
 *
 * Leave is deducted HERE, when the module approves the request — not when ESS
 * Management approves it and not when ESS Management releases it. The
 * compensating reverseResult() restores the days if the result is rerouted or
 * voided.
 */
class AttendanceModuleAdapter extends BaseModuleAdapter
{
    public function key(): string
    {
        return 'attendance';
    }

    public function validateResult(EssRequest $request, array $payload, ?array $filePayload): void
    {
        if (! $this->isLeave($request, $payload)) {
            // Shift swaps / time corrections only need an outcome note.
            if (trim((string) ($payload['note'] ?? '')) === '') {
                throw new \RuntimeException('Add a note describing the attendance decision.');
            }

            return;
        }

        $decision = $this->decision($payload);

        if ($decision === 'approved') {
            $leave = $this->leaveDetails($request, $payload);

            $balance = LeaveBalance::firstOrNew([
                'employee_id' => $request->employee_id,
                'leave_type' => $leave['leave_type'],
                'period_year' => $leave['period_year'],
            ]);

            $total = (float) ($balance->total_days ?? 0);
            $used = (float) ($balance->used_days ?? 0);

            if ($total > 0 && ($used + $leave['days']) > $total) {
                throw new \RuntimeException(sprintf(
                    'Insufficient %s balance: %.2f day(s) requested, %.2f available.',
                    $leave['leave_type'],
                    $leave['days'],
                    max(0, $total - $used)
                ));
            }
        }
    }

    public function applyResult(
        EssRequest $request,
        array $payload,
        ?array $filePayload,
        ?SystemUser $actor
    ): array {
        $decision = $this->decision($payload);
        $reference = null;
        $ledger = ['decision' => $decision];

        if ($this->isLeave($request, $payload) && $decision === 'approved') {
            $leave = $this->leaveDetails($request, $payload);

            $balance = LeaveBalance::firstOrCreate([
                'employee_id' => $request->employee_id,
                'leave_type' => $leave['leave_type'],
                'period_year' => $leave['period_year'],
            ], [
                'total_days' => 15.0,
                'used_days' => 0.0,
            ]);

            $balance->used_days = min(
                (float) $balance->total_days,
                (float) $balance->used_days + $leave['days']
            );
            $balance->save();

            $reference = 'leave:' . $balance->leave_balance_id . ':' . $leave['days'];
            $ledger = array_merge($ledger, [
                'deducted' => true,
                'leave_type' => $leave['leave_type'],
                'days' => $leave['days'],
                'period_year' => $leave['period_year'],
            ]);
        }

        if ($filePayload) {
            $attachment = $this->storeOutboundAttachment($request, $filePayload, $actor, $this->key());
            $reference ??= $attachment ? 'attachment:' . $attachment->ess_request_attachment_id : null;
        }

        return [
            'reference' => $reference,
            'note' => $payload['note'] ?? null,
            'ledger' => $ledger,
        ];
    }

    public function reverseResult(EssRequest $request, ?SystemUser $actor, string $reason): void
    {
        $payload = $this->latestResultPayload($request);

        if (($payload['decision'] ?? null) !== 'approved' || empty($payload['deducted'])) {
            return;
        }

        $balance = LeaveBalance::where('employee_id', $request->employee_id)
            ->where('leave_type', $payload['leave_type'] ?? '')
            ->where('period_year', (int) ($payload['period_year'] ?? now()->year))
            ->first();

        if (! $balance) {
            return;
        }

        $days = (float) ($payload['days'] ?? 0);
        $balance->used_days = max(0, (float) $balance->used_days - $days);
        $balance->save();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{leave_type:string,days:float,period_year:int}
     */
    private function leaveDetails(EssRequest $request, array $payload): array
    {
        $leaveType = trim((string) ($payload['leave_type'] ?? ''));

        if ($leaveType === '') {
            $type = (string) $request->request_type;

            if (stripos($type, 'Sick') !== false) {
                $leaveType = 'Sick Leave';
            } elseif (stripos($type, 'Emergency') !== false) {
                $leaveType = 'Emergency Leave';
            } elseif (stripos($type, 'Maternity') !== false || stripos($type, 'Paternity') !== false) {
                $leaveType = 'Maternity / Paternity Leave';
            } elseif (stripos($type, 'Bereavement') !== false) {
                $leaveType = 'Bereavement Leave';
            } elseif (stripos($type, 'Magna Carta') !== false) {
                $leaveType = 'Magna Carta Leave';
            } else {
                $leaveType = 'Vacation Leave';
            }
        }

        $from = $payload['date_from'] ?? $request->date_from;
        $to = $payload['date_to'] ?? $request->date_to;

        $days = 1.0;
        if ($from && $to) {
            $days = max(1.0, (float) (Carbon::parse($from)->diffInDays(Carbon::parse($to)) + 1));
        }

        return [
            'leave_type' => $leaveType,
            'days' => $days,
            'period_year' => (int) ($payload['period_year'] ?? Carbon::today()->year),
        ];
    }

    /** @param array<string, mixed> $payload */
    private function decision(array $payload): string
    {
        $decision = strtolower(trim((string) ($payload['decision'] ?? 'approved')));

        if (! in_array($decision, ['approved', 'rejected'], true)) {
            throw new \RuntimeException('Module decision must be approved or rejected.');
        }

        return $decision;
    }

    /** @param array<string, mixed> $payload */
    private function isLeave(EssRequest $request, array $payload): bool
    {
        $type = strtolower((string) ($payload['request_kind'] ?? 'leave'));

        if ($type !== 'leave') {
            return false;
        }

        return stripos((string) $request->request_type, 'leave') !== false
            || strtolower((string) ($request->category?->code ?? '')) === 'leave';
    }
}

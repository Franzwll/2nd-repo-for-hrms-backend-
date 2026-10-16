<?php

namespace Modules\EmployeeRecords\Console;

use App\Models\EmployeeDocument;
use App\Services\AuditLogger;
use App\Services\Notifier;
use Illuminate\Console\Command;

/**
 * Warns Records/HR staff about 201-file documents that are about to expire
 * (e.g. medical clearances, NBI/police clearances, licenses, passports) so they
 * can be renewed before lapsing.
 */
class NotifyExpiringDocuments extends Command
{
    protected $signature = 'erm:notify-expiring-documents {--days=30 : Look-ahead window in days}';

    protected $description = 'Notify HR/Records staff about employee documents expiring within the look-ahead window';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $today = now()->startOfDay();
        $until = (clone $today)->addDays($days);

        $documents = EmployeeDocument::with('employee')
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [$today->toDateString(), $until->toDateString()])
            ->whereHas('employee', fn ($q) => $q->whereIn('status', ['Active', 'On Leave']))
            ->orderBy('expiry_date')
            ->get();

        if ($documents->isEmpty()) {
            $this->info("No documents expiring within {$days} day(s).");

            return self::SUCCESS;
        }

        $byEmployee = $documents->groupBy('employee_id');
        $recipients = array_merge(Notifier::hrAdminIds(), Notifier::superAdminIds());

        foreach ($byEmployee as $group) {
            $employee = $group->first()->employee;
            if (! $employee) {
                continue;
            }

            $titles = $group->map(fn ($d) => sprintf(
                '%s (expires %s)',
                $d->title,
                $d->expiry_date?->toDateString()
            ))->implode('; ');

            Notifier::to($recipients, [
                'title' => 'Documents expiring soon',
                'body' => "{$employee->full_name} ({$employee->employee_code}): {$titles}",
                'type' => 'warning',
                'module_name' => 'Employee Records',
                'target_type' => 'employee',
                'target_id' => $employee->employee_id,
            ]);
        }

        AuditLogger::log(
            'Expiring document sweep ran',
            'Employee Records',
            'Info',
            'document',
            null,
            sprintf('%d document(s) across %d employee(s) expiring within %d day(s).', $documents->count(), $byEmployee->count(), $days),
        );

        $this->info(sprintf(
            'Notified %d recipient(s) about %d document(s) across %d employee(s).',
            count(array_unique($recipients)),
            $documents->count(),
            $byEmployee->count()
        ));

        return self::SUCCESS;
    }
}

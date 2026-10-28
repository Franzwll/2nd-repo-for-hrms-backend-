<?php

namespace Modules\EmployeeRecords\Console;

use App\Models\Employee;
use Illuminate\Console\Command;
use Modules\EmployeeRecords\Services\EmployeeRecordProvisioner;
use Modules\NewHireOnboarding\Models\NewHire;

class BackfillEmployeeDocuments extends Command
{
    protected $signature = 'erm:backfill-documents
        {--employee= : Limit the backfill to one employee_id}
        {--chunk=100 : Number of new-hire records to process per batch}';

    protected $description = 'Copy applicant and onboarding documents into Employee Records for existing employees';

    public function handle(EmployeeRecordProvisioner $provisioner): int
    {
        $employeeId = $this->option('employee');
        $chunk = max(1, (int) $this->option('chunk'));

        $query = NewHire::query()
            ->whereNotNull('employee_id')
            ->orderBy('new_hire_id');

        if ($employeeId !== null && $employeeId !== '') {
            $query->where('employee_id', (int) $employeeId);
        }

        $created = 0;
        $skipped = 0;
        $failed = 0;

        $query->chunkById($chunk, function ($newHires) use (
            $provisioner,
            &$created,
            &$skipped,
            &$failed,
        ) {
            foreach ($newHires as $newHire) {
                $employee = Employee::find($newHire->employee_id);
                if (! $employee) {
                    $skipped++;
                    continue;
                }

                try {
                    $created += $provisioner->fromNewHire($newHire, $employee);
                } catch (\Throwable $e) {
                    $failed++;
                    $this->warn(sprintf(
                        'Employee %s (new hire %s): %s',
                        $newHire->employee_id,
                        $newHire->new_hire_code,
                        $e->getMessage(),
                    ));
                }
            }
        }, 'new_hire_id');

        $this->info(sprintf(
            'Backfill complete: %d created, %d skipped, %d failed.',
            $created,
            $skipped,
            $failed,
        ));

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Decision record 3b: restore payroll_periods from the live labels on
     * payroll_records, then re-add the foreign key. The backup snapshot only
     * fills periods that no live record references.
     */
    public function up(): void
    {
        if (! Schema::hasTable('payroll_periods')) {
            Schema::create('payroll_periods', function (Blueprint $table) {
                $table->id('payroll_period_id');
                $table->string('period_code', 40)->unique();
                $table->string('period_name', 120);
                $table->date('period_start');
                $table->date('period_end');
                $table->date('payout_date')->nullable();
                $table->string('status', 20)->default('Open');
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('status', 'idx_payroll_periods_status');
            });

            DB::statement("ALTER TABLE `payroll_periods` ADD CONSTRAINT `chk_payroll_periods_status` CHECK (`status` IN ('Open', 'Closed'))");
        }

        $periods = [];

        if (Schema::hasTable('payroll_records')) {
            $records = DB::table('payroll_records')
                ->whereNotNull('payroll_period_id')
                ->orderBy('payroll_period_id')
                ->get();

            foreach ($records->groupBy('payroll_period_id') as $id => $group) {
                $first = $group->first();
                $periods[(int) $id] = [
                    'payroll_period_id' => (int) $id,
                    'period_code' => $first->period_code ?: 'PAY-' . $id,
                    'period_name' => $first->period_name ?: 'Payroll Period ' . $id,
                    'period_start' => $group->min('pay_period_start'),
                    'period_end' => $group->max('pay_period_end'),
                    'payout_date' => $group->max('payout_date'),
                    'status' => $group->every(fn ($r) => $r->status === 'Released') ? 'Closed' : 'Open',
                ];
            }
        }

        $backup = $this->backupPeriods();
        foreach ($backup as $id => $row) {
            if (! isset($periods[$id])) {
                $periods[$id] = $row;
            }
        }

        if ($periods === []) {
            $this->seedDefaultPeriods($periods);
        }

        foreach ($periods as $id => $row) {
            DB::table('payroll_periods')->updateOrInsert(
                ['payroll_period_id' => $id],
                [
                    'period_code' => $row['period_code'],
                    'period_name' => $row['period_name'],
                    'period_start' => $row['period_start'],
                    'period_end' => $row['period_end'],
                    'payout_date' => $row['payout_date'],
                    'status' => $row['status'],
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ]
            );
        }

        $maxId = (int) DB::table('payroll_periods')->max('payroll_period_id');
        if ($maxId > 0) {
            DB::statement('ALTER TABLE `payroll_periods` AUTO_INCREMENT = ' . ($maxId + 1));
        }

        if (Schema::hasTable('payroll_records')) {
            $this->reconcilePeriodReferences();
            $this->addPayrollRecordsForeignKey();
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('payroll_records')) {
            $this->dropPayrollRecordsForeignKey();
        }

        Schema::dropIfExists('payroll_periods');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function backupPeriods(): array
    {
        if (! Schema::hasTable('system_settings')) {
            return [];
        }

        $raw = DB::table('system_settings')
            ->where('setting_key', 'migration_backup.payroll_periods')
            ->value('setting_value');
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($decoded)) {
            return [];
        }

        $rows = [];
        foreach ($decoded as $row) {
            $id = (int) ($row['payroll_period_id'] ?? 0);
            if ($id > 0) {
                $rows[$id] = [
                    'payroll_period_id' => $id,
                    'period_code' => $row['period_code'] ?? 'PAY-' . $id,
                    'period_name' => $row['period_name'] ?? 'Payroll Period ' . $id,
                    'period_start' => $row['period_start'] ?? now()->toDateString(),
                    'period_end' => $row['period_end'] ?? now()->toDateString(),
                    'payout_date' => $row['payout_date'] ?? null,
                    'status' => in_array($row['status'] ?? 'Open', ['Open', 'Closed'], true) ? $row['status'] : 'Open',
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ];
            }
        }

        return $rows;
    }

    /**
     * @param  array<int, array<string, mixed>>  $periods
     */
    private function seedDefaultPeriods(array &$periods): void
    {
        $cursors = [];
        foreach ([1, 2, 3, 4] as $id) {
            $start = now()->startOfMonth()->addDays(($id - 1) * 15);
            $end = $start->copy()->addDays(14);
            $cursors[$id] = [
                'payroll_period_id' => $id,
                'period_code' => 'PAY-' . $start->format('Y-m') . '-' . $id . 'C',
                'period_name' => ($id % 2 === 1 ? '1st' : '2nd') . ' Cut-off ' . $start->format('F Y'),
                'period_start' => $start->toDateString(),
                'period_end' => $end->toDateString(),
                'payout_date' => $end->copy()->addDays(5)->toDateString(),
                'status' => 'Open',
            ];
        }

        $periods = $cursors + $periods;
        ksort($periods);
    }

    private function reconcilePeriodReferences(): void
    {
        $orphans = DB::table('payroll_records')
            ->whereNotNull('payroll_period_id')
            ->whereNotIn('payroll_period_id', DB::table('payroll_periods')->select('payroll_period_id'))
            ->pluck('payroll_period_id')
            ->unique();

        foreach ($orphans as $id) {
            DB::table('payroll_periods')->insertOrIgnore([
                'payroll_period_id' => $id,
                'period_code' => 'PAY-' . $id,
                'period_name' => 'Payroll Period ' . $id,
                'period_start' => now()->toDateString(),
                'period_end' => now()->toDateString(),
                'status' => 'Open',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function addPayrollRecordsForeignKey(): void
    {
        $create = collect(DB::select('SHOW CREATE TABLE payroll_records'))->first()?->{'Create Table'} ?? '';
        if (str_contains($create, 'fk_payroll_records_payroll_period_id')) {
            return;
        }

        DB::statement(
            'ALTER TABLE `payroll_records` ADD CONSTRAINT `fk_payroll_records_payroll_period_id` '
            . 'FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`payroll_period_id`)'
        );
    }

    private function dropPayrollRecordsForeignKey(): void
    {
        $create = collect(DB::select('SHOW CREATE TABLE payroll_records'))->first()?->{'Create Table'} ?? '';
        if (str_contains($create, 'fk_payroll_records_payroll_period_id')) {
            DB::statement('ALTER TABLE `payroll_records` DROP FOREIGN KEY `fk_payroll_records_payroll_period_id`');
        }
    }
};

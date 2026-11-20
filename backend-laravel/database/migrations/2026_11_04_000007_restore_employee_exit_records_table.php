<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Decision record 3g: restore employee_exit_records as one row per
     * separation cycle. employee_id is indexed but not unique, and a nullable
     * rehire_date closes each cycle.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        if (! Schema::hasTable('employee_exit_records')) {
            Schema::create('employee_exit_records', function (Blueprint $table) {
                $table->id('exit_record_id');
                $table->unsignedBigInteger('employee_id');
                $table->string('exit_type', 30);
                $table->date('exit_date');
                $table->string('clearance_status', 20);
                $table->string('coe_status', 20);
                $table->text('notes')->nullable();
                $table->date('rehire_date')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('employee_id', 'idx_employee_exit_records_employee_id');
                $table->index('rehire_date', 'idx_employee_exit_records_rehire_date');

                $table->foreign('employee_id', 'fk_employee_exit_records_employee_id')
                    ->references('employee_id')->on('employees')->onDelete('cascade');
            });
        }

        $inserted = 0;

        if (Schema::hasColumn('employees', 'exit_type')) {
            $employees = DB::table('employees')
                ->whereNotNull('exit_type')
                ->orderBy('employee_id')
                ->get();

            foreach ($employees as $employee) {
                if (DB::table('employee_exit_records')->where('employee_id', $employee->employee_id)->exists()) {
                    continue;
                }

                DB::table('employee_exit_records')->insert([
                    'employee_id' => $employee->employee_id,
                    'exit_type' => $employee->exit_type,
                    'exit_date' => $employee->exit_date ?? now()->toDateString(),
                    'clearance_status' => $employee->clearance_status ?? 'Pending',
                    'coe_status' => $employee->coe_status ?? 'Pending',
                    'notes' => $employee->exit_notes,
                    'rehire_date' => null,
                    'created_at' => $employee->updated_at ?? now(),
                    'updated_at' => $employee->updated_at ?? now(),
                ]);
                $inserted++;
            }
        }

        if ($inserted === 0) {
            foreach ($this->backupRecords() as $row) {
                DB::table('employee_exit_records')->updateOrInsert(
                    ['exit_record_id' => $row['exit_record_id']],
                    $row
                );
            }
        }

        $maxId = (int) DB::table('employee_exit_records')->max('exit_record_id');
        if ($maxId > 0) {
            DB::statement('ALTER TABLE `employee_exit_records` AUTO_INCREMENT = ' . ($maxId + 1));
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('employee_exit_records')) {
            return;
        }

        if (Schema::hasTable('employees')) {
            $latest = DB::table('employee_exit_records')
                ->orderBy('exit_date')
                ->orderBy('exit_record_id')
                ->get()
                ->groupBy('employee_id');

            foreach ($latest as $employeeId => $rows) {
                $row = $rows->last();

                DB::table('employees')->where('employee_id', $employeeId)->update([
                    'exit_type' => $row->exit_type,
                    'exit_date' => $row->exit_date,
                    'clearance_status' => $row->clearance_status,
                    'coe_status' => $row->coe_status,
                    'exit_notes' => $row->notes,
                ]);
            }
        }

        Schema::dropIfExists('employee_exit_records');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function backupRecords(): array
    {
        if (! Schema::hasTable('system_settings')) {
            return [];
        }

        $raw = DB::table('system_settings')
            ->where('setting_key', 'migration_backup.employee_exit_records')
            ->value('setting_value');
        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;
        if (! is_array($decoded)) {
            return [];
        }

        $rows = [];
        foreach ($decoded as $row) {
            $id = (int) ($row['exit_record_id'] ?? 0);
            $employeeId = (int) ($row['employee_id'] ?? 0);
            if ($id > 0 && $employeeId > 0) {
                $rows[$id] = [
                    'exit_record_id' => $id,
                    'employee_id' => $employeeId,
                    'exit_type' => $row['exit_type'] ?? 'Resigned',
                    'exit_date' => $row['exit_date'] ?? now()->toDateString(),
                    'clearance_status' => $row['clearance_status'] ?? 'Pending',
                    'coe_status' => $row['coe_status'] ?? 'Pending',
                    'notes' => $row['notes'] ?? null,
                    'rehire_date' => $row['rehire_date'] ?? null,
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ];
            }
        }

        return $rows;
    }
};

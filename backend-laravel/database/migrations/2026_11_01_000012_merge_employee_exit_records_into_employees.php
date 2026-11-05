<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Inlines employee_exit_records into columns on the employees table
     * (exit_type, exit_date, clearance_status, coe_status, exit_notes),
     * then drops the child table. Original rows are snapshotted in
     * system_settings so down() can recreate the exact table and rows.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employee_exit_records')) {
            return;
        }

        // 1. Add exit columns to employees if missing
        if (Schema::hasTable('employees') && ! Schema::hasColumn('employees', 'exit_type')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->string('exit_type', 30)->nullable()->after('salary_step');
                $table->date('exit_date')->nullable()->after('exit_type');
                $table->string('clearance_status', 20)->nullable()->after('exit_date');
                $table->string('coe_status', 20)->nullable()->after('clearance_status');
                $table->text('exit_notes')->nullable()->after('coe_status');
            });
        }

        // 2. Snapshot original rows for rollback
        $rows = DB::table('employee_exit_records')->orderBy('exit_record_id')->get();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.employee_exit_records'],
                ['setting_value' => json_encode($rows->map(fn ($r) => (array) $r)->all()), 'updated_at' => now()]
            );
        }

        // 3. Copy exit facts onto the employee row
        foreach ($rows as $r) {
            DB::table('employees')
                ->where('employee_id', $r->employee_id)
                ->update([
                    'exit_type'        => $r->exit_type,
                    'exit_date'        => $r->exit_date,
                    'clearance_status' => $r->clearance_status,
                    'coe_status'       => $r->coe_status,
                    'exit_notes'       => $r->notes,
                ]);
        }

        // 4. Drop foreign key, then the child table
        Schema::table('employee_exit_records', function (Blueprint $table) {
            $table->dropForeign('fk_employee_exit_records_employee_id');
        });
        Schema::dropIfExists('employee_exit_records');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates employee_exit_records (structure, index and FK), restores
     * every original row with its exit_record_id, and drops the exit columns
     * from employees. Synthetic rows never happen here because each exit
     * record always belongs to an existing employee.
     */
    public function down(): void
    {
        // 1. Recreate employee_exit_records
        if (! Schema::hasTable('employee_exit_records')) {
            Schema::create('employee_exit_records', function (Blueprint $table) {
                $table->id('exit_record_id');
                $table->unsignedBigInteger('employee_id')->unique();
                $table->string('exit_type', 30);
                $table->date('exit_date');
                $table->string('clearance_status', 20);
                $table->string('coe_status', 20);
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('employee_id', 'idx_employee_exit_records_employee_id');

                $table->foreign('employee_id', 'fk_employee_exit_records_employee_id')
                      ->references('employee_id')->on('employees')->onDelete('cascade');
            });
        }

        // 2. Restore rows from system_settings backup (preferred) or from the
        //    exit columns on employees (fallback)
        $backupRows = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')
                ->where('setting_key', 'migration_backup.employee_exit_records')
                ->first();
            if ($row && ! empty($row->setting_value)) {
                $backupRows = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;

        if (is_array($backupRows) && ! empty($backupRows)) {
            foreach ($backupRows as $r) {
                DB::table('employee_exit_records')->insert([
                    'exit_record_id'    => $r['exit_record_id'],
                    'employee_id'       => $r['employee_id'],
                    'exit_type'         => $r['exit_type'],
                    'exit_date'         => $r['exit_date'],
                    'clearance_status'  => $r['clearance_status'],
                    'coe_status'        => $r['coe_status'],
                    'notes'             => $r['notes'] ?? null,
                    'created_at'        => $r['created_at'] ?? now(),
                    'updated_at'        => $r['updated_at'] ?? now(),
                ]);
                $maxId = max($maxId, (int) $r['exit_record_id']);
            }
        } elseif (Schema::hasTable('employees') && Schema::hasColumn('employees', 'exit_type')) {
            $exited = DB::table('employees')
                ->whereNotNull('exit_type')
                ->orderBy('employee_id')
                ->get(['employee_id', 'exit_type', 'exit_date', 'clearance_status', 'coe_status', 'exit_notes']);

            foreach ($exited as $e) {
                $maxId++;
                DB::table('employee_exit_records')->insert([
                    'exit_record_id'    => $maxId,
                    'employee_id'       => $e->employee_id,
                    'exit_type'         => $e->exit_type,
                    'exit_date'         => $e->exit_date,
                    'clearance_status'  => $e->clearance_status ?? 'Pending',
                    'coe_status'        => $e->coe_status ?? 'Pending',
                    'notes'             => $e->exit_notes,
                ]);
            }
        }

        if ($maxId > 0) {
            DB::statement('ALTER TABLE employee_exit_records AUTO_INCREMENT = ' . ($maxId + 1));
        }

        // 3. Drop the exit columns from employees
        if (Schema::hasTable('employees') && Schema::hasColumn('employees', 'exit_type')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn(['exit_type', 'exit_date', 'clearance_status', 'coe_status', 'exit_notes']);
            });
        }

        // 4. Clean up the backup key
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->where('setting_key', 'migration_backup.employee_exit_records')
                ->delete();
        }
    }
};
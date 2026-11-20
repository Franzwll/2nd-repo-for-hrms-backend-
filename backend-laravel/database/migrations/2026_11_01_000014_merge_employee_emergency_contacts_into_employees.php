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
     * Inlines employee_emergency_contacts into employees.emergency_contacts_json
     * (contacts ordered by emergency_contact_id), then drops the child table.
     * Original rows are snapshotted in system_settings so down() can recreate
     * the exact table, rows, index and foreign key.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employee_emergency_contacts')) {
            return;
        }

        // 1. Add emergency_contacts_json column to employees if missing
        if (Schema::hasTable('employees') && ! Schema::hasColumn('employees', 'emergency_contacts_json')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->longText('emergency_contacts_json')->nullable()->after('exit_notes');
            });
        }

        // 2. Snapshot original rows for rollback
        $rows = DB::table('employee_emergency_contacts')->orderBy('emergency_contact_id')->get();

        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'migration_backup.employee_emergency_contacts'],
                ['setting_value' => json_encode($rows->map(fn ($r) => (array) $r)->all()), 'updated_at' => now()]
            );
        }

        // 3. Group by employee_id and inline as JSON
        $byEmployee = [];
        foreach ($rows as $r) {
            $byEmployee[$r->employee_id][] = [
                'emergency_contact_id' => (int) $r->emergency_contact_id,
                'employee_id'          => (int) $r->employee_id,
                'name'                 => $r->name,
                'relationship'         => $r->relationship,
                'phone'                => $r->phone,
                'address'              => $r->address,
                'is_primary'           => (bool) $r->is_primary,
                'created_at'           => (string) $r->created_at,
                'updated_at'           => (string) $r->updated_at,
            ];
        }

        foreach ($byEmployee as $employeeId => $contacts) {
            DB::table('employees')
                ->where('employee_id', $employeeId)
                ->update(['emergency_contacts_json' => json_encode($contacts)]);
        }

        // 4. Drop the foreign key, then the child table
        Schema::table('employee_emergency_contacts', function (Blueprint $table) {
            $table->dropForeign('fk_employee_emergency_contacts_employee_id');
        });
        Schema::dropIfExists('employee_emergency_contacts');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates employee_emergency_contacts (structure, index and FK),
     * restores every original row with its emergency_contact_id, then drops
     * the emergency_contacts_json column from employees.
     */
    public function down(): void
    {
        // 1. Recreate employee_emergency_contacts
        if (! Schema::hasTable('employee_emergency_contacts')) {
            Schema::create('employee_emergency_contacts', function (Blueprint $table) {
                $table->id('emergency_contact_id');
                $table->unsignedBigInteger('employee_id');
                $table->string('name', 160);
                $table->string('relationship', 80)->nullable();
                $table->string('phone', 40)->nullable();
                $table->text('address')->nullable();
                $table->boolean('is_primary')->default(1);
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('employee_id', 'idx_employee_emergency_contacts_employee_id');

                $table->foreign('employee_id', 'fk_employee_emergency_contacts_employee_id')
                      ->references('employee_id')->on('employees')->onDelete('cascade');
            });
        }

        // 2. Restore rows from system_settings backup (preferred) or from the
        //    employees.emergency_contacts_json column (fallback)
        $backupRows = null;
        if (Schema::hasTable('system_settings')) {
            $row = DB::table('system_settings')
                ->where('setting_key', 'migration_backup.employee_emergency_contacts')
                ->first();
            if ($row && ! empty($row->setting_value)) {
                $backupRows = json_decode($row->setting_value, true);
            }
        }

        $maxId = 0;

        if (is_array($backupRows) && ! empty($backupRows)) {
            foreach ($backupRows as $r) {
                DB::table('employee_emergency_contacts')->insert([
                    'emergency_contact_id' => $r['emergency_contact_id'],
                    'employee_id'          => $r['employee_id'],
                    'name'                 => $r['name'],
                    'relationship'         => $r['relationship'] ?? null,
                    'phone'                => $r['phone'] ?? null,
                    'address'              => $r['address'] ?? null,
                    'is_primary'           => (int) $r['is_primary'],
                    'created_at'           => $r['created_at'] ?? now(),
                    'updated_at'           => $r['updated_at'] ?? now(),
                ]);
                $maxId = max($maxId, (int) $r['emergency_contact_id']);
            }
        } elseif (Schema::hasTable('employees') && Schema::hasColumn('employees', 'emergency_contacts_json')) {
            $employees = DB::table('employees')->whereNotNull('emergency_contacts_json')->get();

            foreach ($employees as $e) {
                $contacts = json_decode((string) $e->emergency_contacts_json, true) ?: [];
                foreach ($contacts as $contact) {
                    $maxId++;
                    DB::table('employee_emergency_contacts')->insert([
                        'emergency_contact_id' => $maxId,
                        'employee_id'          => (int) ($contact['employee_id'] ?? $e->employee_id),
                        'name'                 => $contact['name'] ?? '',
                        'relationship'         => $contact['relationship'] ?? null,
                        'phone'                => $contact['phone'] ?? null,
                        'address'              => $contact['address'] ?? null,
                        'is_primary'           => ! empty($contact['is_primary']),
                        'created_at'           => $contact['created_at'] ?? now(),
                        'updated_at'           => $contact['updated_at'] ?? now(),
                    ]);
                }
            }
        }

        if ($maxId > 0) {
            DB::statement('ALTER TABLE employee_emergency_contacts AUTO_INCREMENT = ' . ($maxId + 1));
        }

        // 3. Drop emergency_contacts_json from employees
        if (Schema::hasTable('employees') && Schema::hasColumn('employees', 'emergency_contacts_json')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('emergency_contacts_json');
            });
        }

        // 4. Clean up the backup key
        if (Schema::hasTable('system_settings')) {
            DB::table('system_settings')
                ->where('setting_key', 'migration_backup.employee_emergency_contacts')
                ->delete();
        }
    }
};
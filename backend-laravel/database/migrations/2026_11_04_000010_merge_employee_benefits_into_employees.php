<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 5f: merge employee_benefits into employees.benefits_json. The
     * EmployeeBenefit model stays; the Employee model hydrates it from JSON.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        if (! Schema::hasColumn('employees', 'benefits_json')) {
            Schema::table('employees', function (Blueprint $table) {
                $after = Schema::hasColumn('employees', 'schedule_json') ? 'schedule_json' : 'emergency_contacts_json';
                $table->longText('benefits_json')->nullable()->after($after);
            });
        }

        if (! Schema::hasTable('employee_benefits')) {
            return;
        }

        $benefits = DB::table('employee_benefits')->orderBy('employee_benefit_id')->get();
        $byEmployee = $benefits->groupBy('employee_id');

        foreach ($byEmployee as $employeeId => $rows) {
            DB::table('employees')->where('employee_id', $employeeId)->update([
                'benefits_json' => json_encode($rows->map(fn ($row) => [
                    'employee_benefit_id' => (int) $row->employee_benefit_id,
                    'employee_id' => (int) $row->employee_id,
                    'benefit_name' => $row->benefit_name,
                    'reference_value' => $row->reference_value,
                    'note' => $row->note,
                    'effective_date' => $row->effective_date,
                    'end_date' => $row->end_date,
                    'status' => $row->status,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ])->values()->all()),
            ]);
        }

        Schema::table('employee_benefits', function (Blueprint $table) {
            $table->dropForeign('fk_employee_benefits_employee_id');
        });
        Schema::dropIfExists('employee_benefits');
    }

    public function down(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        if (! Schema::hasTable('employee_benefits')) {
            Schema::create('employee_benefits', function (Blueprint $table) {
                $table->id('employee_benefit_id');
                $table->unsignedBigInteger('employee_id');
                $table->string('benefit_name', 100);
                $table->string('reference_value', 190)->nullable();
                $table->text('note')->nullable();
                $table->date('effective_date')->nullable();
                $table->date('end_date')->nullable();
                $table->string('status', 30);
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('employee_id', 'idx_employee_benefits_employee_id');
                $table->foreign('employee_id', 'fk_employee_benefits_employee_id')
                    ->references('employee_id')->on('employees')->onDelete('cascade');
            });

            DB::statement("ALTER TABLE `employee_benefits` ADD CONSTRAINT `chk_employee_benefits_status` CHECK (`status` IN ('Active', 'Inactive', 'Expired'))");
        }

        if (Schema::hasColumn('employees', 'benefits_json')) {
            $rows = DB::table('employees')->whereNotNull('benefits_json')->get(['employee_id', 'benefits_json']);

            foreach ($rows as $employee) {
                $decoded = json_decode((string) $employee->benefits_json, true);
                if (! is_array($decoded)) {
                    continue;
                }

                foreach ($decoded as $row) {
                    if (! is_array($row)) {
                        continue;
                    }

                    $values = [
                        'employee_id' => $employee->employee_id,
                        'benefit_name' => (string) ($row['benefit_name'] ?? 'Benefit'),
                        'reference_value' => $row['reference_value'] ?? null,
                        'note' => $row['note'] ?? null,
                        'effective_date' => $row['effective_date'] ?? null,
                        'end_date' => $row['end_date'] ?? null,
                        'status' => in_array($row['status'] ?? '', ['Active', 'Inactive', 'Expired'], true)
                            ? $row['status']
                            : 'Active',
                        'created_at' => $row['created_at'] ?? now(),
                        'updated_at' => $row['updated_at'] ?? now(),
                    ];

                    if (! empty($row['employee_benefit_id'])) {
                        DB::table('employee_benefits')->updateOrInsert(
                            ['employee_benefit_id' => (int) $row['employee_benefit_id']],
                            $values
                        );
                    } else {
                        DB::table('employee_benefits')->insert($values);
                    }
                }
            }

            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('benefits_json');
            });
        }
    }
};

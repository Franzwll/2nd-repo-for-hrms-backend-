<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 5d: merge work_schedules into employees.schedule_json. The model
     * class stays; the Employee model hydrates schedule models from this JSON.
     */
    public function up(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        if (! Schema::hasColumn('employees', 'schedule_json')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->longText('schedule_json')->nullable()->after('emergency_contacts_json');
            });
        }

        if (! Schema::hasTable('work_schedules')) {
            return;
        }

        $schedules = DB::table('work_schedules')->orderBy('work_schedule_id')->get();
        $byEmployee = $schedules->groupBy('employee_id');

        foreach ($byEmployee as $employeeId => $rows) {
            DB::table('employees')->where('employee_id', $employeeId)->update([
                'schedule_json' => json_encode($rows->map(fn ($row) => [
                    'work_schedule_id' => (int) $row->work_schedule_id,
                    'employee_id' => (int) $row->employee_id,
                    'day_of_week' => (int) $row->day_of_week,
                    'shift_name' => $row->shift_name,
                    'start_time' => $row->start_time,
                    'end_time' => $row->end_time,
                    'location' => $row->location,
                    'is_rest_day' => (bool) $row->is_rest_day,
                    'effective_from' => $row->effective_from,
                    'effective_to' => $row->effective_to,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ])->values()->all()),
            ]);
        }

        Schema::table('work_schedules', function (Blueprint $table) {
            $table->dropForeign('fk_work_schedules_employee_id');
        });
        Schema::dropIfExists('work_schedules');
    }

    public function down(): void
    {
        if (! Schema::hasTable('employees')) {
            return;
        }

        if (! Schema::hasTable('work_schedules')) {
            Schema::create('work_schedules', function (Blueprint $table) {
                $table->id('work_schedule_id');
                $table->unsignedBigInteger('employee_id');
                $table->smallInteger('day_of_week');
                $table->string('shift_name', 80)->nullable();
                $table->time('start_time')->nullable();
                $table->time('end_time')->nullable();
                $table->string('location', 120)->nullable();
                $table->boolean('is_rest_day')->default(false);
                $table->date('effective_from');
                $table->date('effective_to')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('employee_id', 'idx_work_schedules_employee_id');
                $table->foreign('employee_id', 'fk_work_schedules_employee_id')
                    ->references('employee_id')->on('employees')->onDelete('cascade');
            });

            DB::statement("ALTER TABLE `work_schedules` ADD CONSTRAINT `chk_work_schedules_day_of_week` CHECK (`day_of_week` BETWEEN 0 AND 6)");
        }

        if (Schema::hasColumn('employees', 'schedule_json')) {
            $rows = DB::table('employees')->whereNotNull('schedule_json')->get(['employee_id', 'schedule_json']);

            foreach ($rows as $employee) {
                $decoded = json_decode((string) $employee->schedule_json, true);
                if (! is_array($decoded)) {
                    continue;
                }

                foreach ($decoded as $row) {
                    if (! is_array($row)) {
                        continue;
                    }

                    $values = [
                        'employee_id' => $employee->employee_id,
                        'day_of_week' => (int) ($row['day_of_week'] ?? 1),
                        'shift_name' => $row['shift_name'] ?? null,
                        'start_time' => $row['start_time'] ?? null,
                        'end_time' => $row['end_time'] ?? null,
                        'location' => $row['location'] ?? null,
                        'is_rest_day' => (int) ! empty($row['is_rest_day']),
                        'effective_from' => $row['effective_from'] ?? now()->toDateString(),
                        'effective_to' => $row['effective_to'] ?? null,
                        'created_at' => $row['created_at'] ?? now(),
                        'updated_at' => $row['updated_at'] ?? now(),
                    ];

                    if (! empty($row['work_schedule_id'])) {
                        DB::table('work_schedules')->updateOrInsert(
                            ['work_schedule_id' => (int) $row['work_schedule_id']],
                            $values
                        );
                    } else {
                        DB::table('work_schedules')->insert($values);
                    }
                }
            }

            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('schedule_json');
            });
        }
    }
};

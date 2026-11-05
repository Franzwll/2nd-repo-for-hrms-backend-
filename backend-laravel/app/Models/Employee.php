<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class Employee extends Model
{
    use SoftDeletes;

    protected $table = 'employees';
    protected $primaryKey = 'employee_id';

    protected $fillable = [
        'employee_code',
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'personal_email',
        'phone',
        'address',
        'birth_date',
        'gender',
        'civil_status',
        'nationality',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
        'tin_number',
        'position_id',
        'department_id',
        'employment_type',
        'date_hired',
        'supervisor_employee_id',
        'status',
        'onboarding_complete',
        'salary_grade_id',
        'employee_record_last_updated_at',
        'salary_step',
        'emergency_contacts_json',
        'schedule_json',
        'benefits_json',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'date_hired' => 'date',
        'onboarding_complete' => 'boolean',
        'employee_record_last_updated_at' => 'date',
        'emergency_contacts_json' => 'array',
        'schedule_json' => 'array',
        'benefits_json' => 'array',
    ];

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id', 'position_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function salaryGrade(): BelongsTo
    {
        return $this->belongsTo(SalaryGrade::class, 'salary_grade_id', 'salary_grade_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'supervisor_employee_id', 'employee_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'supervisor_employee_id', 'employee_id');
    }

    /**
     * Emergency contacts hydrated from emergency_contacts_json (Phase 3i).
     *
     * When the legacy child table still exists (for example right after a
     * migrate:rollback) the contacts come from the real relation; otherwise
     * they are hydrated from this employee's emergency_contacts_json column,
     * preserving each contact's id, fields and is_primary flag.
     */
    public function getEmergencyContactsAttribute(): \Illuminate\Support\Collection
    {
        if (Schema::hasTable('employee_emergency_contacts')) {
            return $this->hasMany(EmployeeEmergencyContact::class, 'employee_id', 'employee_id')
                ->orderBy('emergency_contact_id')
                ->get();
        }

        $raw = $this->emergency_contacts_json;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }
        if (! is_array($raw)) {
            return collect();
        }

        return collect($raw)->values()->map(function (array $contact) {
            $model = new EmployeeEmergencyContact;
            $model->forceFill([
                'emergency_contact_id' => $contact['emergency_contact_id'] ?? null,
                'employee_id'          => $contact['employee_id'] ?? $this->employee_id,
                'name'                 => $contact['name'] ?? '',
                'relationship'         => $contact['relationship'] ?? null,
                'phone'                => $contact['phone'] ?? null,
                'address'              => $contact['address'] ?? null,
                'is_primary'           => $contact['is_primary'] ?? false,
                'created_at'           => $contact['created_at'] ?? $this->created_at,
                'updated_at'           => $contact['updated_at'] ?? $this->updated_at,
            ]);
            return $model;
        });
    }

    public function positionHistory(): HasMany
    {
        return $this->hasMany(EmployeePositionHistory::class, 'employee_id', 'employee_id')
            ->orderByDesc('effective_date');
    }

    public function exitRecord(): HasOne
    {
        return $this->hasOne(EmployeeExitRecord::class, 'employee_id', 'employee_id')
            ->latestOfMany('exit_date');
    }

    public function exitRecords(): HasMany
    {
        return $this->hasMany(EmployeeExitRecord::class, 'employee_id', 'employee_id')
            ->orderByDesc('exit_date');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class, 'employee_id', 'employee_id');
    }

    public function systemUser(): HasOne
    {
        return $this->hasOne(SystemUser::class, 'employee_id', 'employee_id');
    }

    public function essRequests(): HasMany
    {
        return $this->hasMany(EssRequest::class, 'employee_id', 'employee_id')
            ->orderByDesc('filed_at');
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class, 'employee_id', 'employee_id');
    }

    /**
     * Work schedule rows hydrated from schedule_json (Phase 5d).
     */
    public function getWorkSchedulesAttribute(): Collection
    {
        return collect($this->schedule_json ?? [])
            ->filter(fn ($row) => is_array($row))
            ->map(function (array $row) {
                $model = new WorkSchedule;
                $model->forceFill($row);
                $model->exists = true;

                return $model;
            })
            ->sortBy('work_schedule_id')
            ->values();
    }

    /**
     * Benefit rows hydrated from benefits_json (Phase 5f).
     */
    public function getBenefitsAttribute(): Collection
    {
        return collect($this->benefits_json ?? [])
            ->filter(fn ($row) => is_array($row))
            ->map(function (array $row) {
                $model = new EmployeeBenefit;
                $model->forceFill($row);
                $model->exists = true;

                return $model;
            })
            ->sortBy('employee_benefit_id')
            ->values();
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class, 'employee_id', 'employee_id')
            ->orderByDesc('work_date');
    }

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ])));
    }
}
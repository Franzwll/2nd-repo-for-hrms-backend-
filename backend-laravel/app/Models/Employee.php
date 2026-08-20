<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
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
    ];

    protected $casts = [
        'birth_date' => 'date',
        'date_hired' => 'date',
        'onboarding_complete' => 'boolean',
        'employee_record_last_updated_at' => 'date',
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

    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(EmployeeEmergencyContact::class, 'employee_id', 'employee_id');
    }

    public function positionHistory(): HasMany
    {
        return $this->hasMany(EmployeePositionHistory::class, 'employee_id', 'employee_id')
            ->orderByDesc('effective_date');
    }

    public function exitRecord(): HasOne
    {
        return $this->hasOne(EmployeeExitRecord::class, 'employee_id', 'employee_id');
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

    public function workSchedules(): HasMany
    {
        return $this->hasMany(WorkSchedule::class, 'employee_id', 'employee_id');
    }

    public function benefits(): HasMany
    {
        return $this->hasMany(EmployeeBenefit::class, 'employee_id', 'employee_id');
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
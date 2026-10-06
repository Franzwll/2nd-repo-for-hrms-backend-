<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'position_id' => $this->position_id,
            'position_code' => $this->position_code,
            'title' => $this->title,
            'department_id' => $this->department_id,
            'department_name' => $this->whenLoaded('department', fn () => $this->department?->name),
            'salary_grade_id' => $this->salary_grade_id,
            'salary_grade' => $this->whenLoaded('salaryGrade', fn () => $this->salaryGrade?->code),
            // Full band for the Recruitment job-post builder: selecting a
            // position auto-fills the Job Info salary range + grade picker.
            'salary_grade_code' => $this->whenLoaded('salaryGrade', fn () => $this->salaryGrade?->code),
            'salary_grade_title' => $this->whenLoaded('salaryGrade', fn () => $this->salaryGrade?->title),
            'salary_grade_min' => $this->whenLoaded('salaryGrade', fn () => $this->salaryGrade?->min_salary !== null ? (float) $this->salaryGrade->min_salary : null),
            'salary_grade_max' => $this->whenLoaded('salaryGrade', fn () => $this->salaryGrade?->max_salary !== null ? (float) $this->salaryGrade->max_salary : null),
            'level' => $this->level,
            'headcount' => $this->headcount,
            'filled_count' => $this->filled_count,
            'vacancies' => max(0, (int) $this->headcount - (int) $this->filled_count),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
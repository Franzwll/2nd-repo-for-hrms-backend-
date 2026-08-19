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
            'salary_grade' => $this->whenLoaded('salaryGrade', fn () => $this->salaryGrade?->grade_name),
            'level' => $this->level,
            'headcount' => $this->headcount,
            'filled_count' => $this->filled_count,
            'vacancies' => max(0, (int) $this->headcount - (int) $this->filled_count),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
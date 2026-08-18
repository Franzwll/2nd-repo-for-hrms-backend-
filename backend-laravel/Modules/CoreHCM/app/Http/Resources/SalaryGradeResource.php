<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryGradeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'salary_grade_id' => $this->salary_grade_id,
            'code' => $this->code,
            'title' => $this->title,
            'min_salary' => $this->min_salary,
            'max_salary' => $this->max_salary,
            'currency_code' => $this->currency_code,
            'level' => $this->level,
            'notes' => $this->notes,
        ];
    }
}
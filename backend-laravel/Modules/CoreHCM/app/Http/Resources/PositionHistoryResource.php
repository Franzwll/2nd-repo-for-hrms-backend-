<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'position_history_id' => $this->position_history_id,
            'effective_date' => $this->effective_date?->toDateString(),
            'change_type' => $this->change_type,
            'old_position_id' => $this->old_position_id,
            'new_position_id' => $this->new_position_id,
            'old_salary_grade_id' => $this->old_salary_grade_id,
            'new_salary_grade_id' => $this->new_salary_grade_id,
            'notes' => $this->notes,
        ];
    }
}
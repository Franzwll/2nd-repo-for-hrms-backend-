<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'department_id' => $this->department_id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'head_employee_id' => $this->head_employee_id,
            'head' => $this->whenLoaded('head', fn () => $this->head?->full_name),
            'budget' => $this->budget,
            'staff_count' => $this->whenCounted('employees'),
            'positions_count' => $this->whenCounted('positions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
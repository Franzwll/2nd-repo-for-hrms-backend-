<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrgChartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'department_id' => $this->department_id,
            'code' => $this->code,
            'name' => $this->name,
            'head' => $this->whenLoaded('head', function () {
                return $this->head ? [
                    'employee_id' => $this->head->employee_id,
                    'full_name' => $this->head->full_name,
                    'position_title' => $this->head->position?->title,
                ] : null;
            }),
            'headcount' => $this->positions->sum('headcount'),
            'filled' => $this->positions->sum('filled_count'),
            'positions' => PositionResource::collection($this->whenLoaded('positions')),
        ];
    }
}
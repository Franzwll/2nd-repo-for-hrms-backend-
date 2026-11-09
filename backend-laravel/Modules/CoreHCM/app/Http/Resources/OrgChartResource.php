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
                $head = $this->head;

                // A separated employee must never be presented as a head.
                if (! $head || in_array($head->status, ['Resigned', 'Terminated', 'Retired'], true)) {
                    return null;
                }

                return [
                    'employee_id' => $head->employee_id,
                    'full_name' => $head->full_name,
                    'position_title' => $head->position?->title,
                ];
            }),
            'headcount' => $this->positions->sum('headcount'),
            'filled' => $this->positions->sum('filled_count'),
            'positions' => PositionResource::collection($this->whenLoaded('positions')),
        ];
    }
}
<?php

namespace Modules\NewHireOnboarding\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChecklistRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'checklist_request_id'  => $this->checklist_request_id,
            'request_code'          => $this->request_code,
            'employee_id'           => $this->employee_id,
            'template_id'           => $this->template_id,
            'template_title'        => $this->whenLoaded('template', fn () => $this->template->title),
            'phase'                 => $this->phase,
            'items_json'            => $this->items_json ?? [],
            'status'                => $this->status,
            'requested_by_user_id'  => $this->requested_by_user_id,
            'requested_at'          => $this->requested_at?->toDateString(),
            'created_at'            => $this->created_at?->toISOString(),
            'updated_at'            => $this->updated_at?->toISOString(),
        ];
    }
}

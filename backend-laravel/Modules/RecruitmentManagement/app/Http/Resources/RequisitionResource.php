<?php

namespace Modules\RecruitmentManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'requisition_id'        => $this->requisition_id,
            'requisition_code'      => $this->requisition_code,
            'position_id'           => $this->position_id,
            'position_title'        => $this->position_title,
            'department_id'         => $this->department_id,
            'department'            => $this->whenLoaded('department', fn () => $this->department->name),
            'requested_by_user_id'  => $this->requested_by_user_id,
            'requested_count'       => (int) $this->requested_count,
            'urgency'               => $this->urgency,
            'justification'         => $this->justification,
            'status'                => $this->status,
            'requested_at'          => $this->requested_at?->toDateString(),
            'converted_job_post_id' => $this->converted_job_post_id,
            'created_at'            => $this->created_at?->toISOString(),
            'updated_at'            => $this->updated_at?->toISOString(),
        ];
    }
}

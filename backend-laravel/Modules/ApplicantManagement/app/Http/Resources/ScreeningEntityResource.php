<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScreeningEntityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'entity_id'    => $this->entity_id,
            'applicant_id' => $this->applicant_id,
            'label'        => $this->label,
            'value'        => $this->value,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}

<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FacilityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'facility_id' => $this->facility_id,
            'name'        => $this->name,
            'type'        => $this->type,
            'location'    => $this->location,
            'capacity'    => $this->capacity,
            'icon'        => $this->icon,
            'description' => $this->description,
            'is_active'   => (bool) $this->is_active,
        ];
    }
}

<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExitRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'exit_record_id' => $this->exit_record_id,
            'exit_type' => $this->exit_type,
            'exit_date' => $this->exit_date?->toDateString(),
            'clearance_status' => $this->clearance_status,
            'coe_status' => $this->coe_status,
            'notes' => $this->notes,
        ];
    }
}
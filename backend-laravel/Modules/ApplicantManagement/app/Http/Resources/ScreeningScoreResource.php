<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScreeningScoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'score_id'     => $this->score_id,
            'applicant_id' => $this->applicant_id,
            'criterion'    => $this->criterion,
            'score'        => (float) $this->score,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}

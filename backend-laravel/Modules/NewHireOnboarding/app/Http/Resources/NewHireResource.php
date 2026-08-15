<?php

namespace Modules\NewHireOnboarding\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewHireResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'new_hire_id'         => $this->new_hire_id,
            'new_hire_code'       => $this->new_hire_code,
            'applicant_id'        => $this->applicant_id,
            'employee_id'         => $this->employee_id,
            'name'                => $this->name,
            'email'               => $this->email,
            'phone'               => $this->phone,
            'position_id'         => $this->position_id,
            'department_id'       => $this->department_id,
            'department'          => $this->whenLoaded('department', fn () => $this->department->name),
            'position'            => $this->whenLoaded('position',   fn () => $this->position->title),
            'stage'               => $this->stage,
            'start_date'          => $this->start_date?->toDateString(),
            'completion_percent'  => $this->whenLoaded('onboardingItems', fn () => $this->completionPercentage()),
            'onboarding_items'    => $this->whenLoaded('onboardingItems', function () {
                return $this->onboardingItems->map(fn ($item) => [
                    'employee_onboarding_item_id' => $item->employee_onboarding_item_id,
                    'item_text'                   => $item->item_text,
                    'done'                         => (bool) $item->done,
                    'completed_at'                 => $item->completed_at?->toISOString(),
                ]);
            }),
            'created_at'          => $this->created_at?->toISOString(),
            'updated_at'          => $this->updated_at?->toISOString(),
        ];
    }
}

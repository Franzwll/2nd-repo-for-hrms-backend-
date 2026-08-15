<?php

namespace Modules\NewHireOnboarding\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChecklistTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'template_id'         => $this->template_id,
            'template_code'       => $this->template_code,
            'title'               => $this->title,
            'phase'               => $this->phase,
            'position_scope'      => $this->position_scope_json ?? [],
            'status'              => $this->status,
            'items_count'         => $this->whenLoaded('items', fn () => $this->items->count()),
            'items'               => $this->whenLoaded('items', function () {
                return $this->items->map(fn ($item) => [
                    'template_item_id' => $item->template_item_id,
                    'item_text'        => $item->item_text,
                    'sort_order'       => $item->sort_order,
                ]);
            }),
            'created_at'          => $this->created_at?->toISOString(),
            'updated_at'          => $this->updated_at?->toISOString(),
        ];
    }
}

<?php

namespace Modules\Landing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatbotFaqResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'faq_id' => $this->faq_id,
            'question' => $this->question,
            'answer' => $this->answer,
            'keywords' => $this->keywords,
            'enabled' => (bool) $this->enabled,
            'sort_order' => (int) $this->sort_order,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
<?php

namespace Modules\Landing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->announcement_id,
            'announcement_id' => $this->announcement_id,
            'title' => $this->title,
            'body' => $this->body,
            'published_date' => $this->published_date?->toDateString(),
            'audience' => $this->audience,
            'status' => $this->status,
            'author' => $this->createdBy?->full_name ?? $this->createdBy?->username ?? 'System',
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
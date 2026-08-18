<?php

namespace Modules\CoreHCM\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'document_id' => $this->document_id,
            'document_code' => $this->document_code,
            'title' => $this->title,
            'category' => $this->category,
            'file_path' => $this->file_path,
            'mime_type' => $this->mime_type,
            'file_size_bytes' => $this->file_size_bytes,
            'document_status' => $this->document_status,
            'document_date' => $this->document_date?->toDateString(),
            'expiry_date' => $this->expiry_date?->toDateString(),
        ];
    }
}
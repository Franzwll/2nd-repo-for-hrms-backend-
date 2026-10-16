<?php

namespace Modules\EmployeeRecords\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class EmployeeDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $relative = ltrim((string) $this->file_path, '/');
        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }
        $hasFile = $relative !== '' && Storage::disk('public')->exists($relative);

        return [
            'document_id' => $this->document_id,
            'document_code' => $this->document_code,
            'title' => $this->title,
            'category' => $this->category,
            'source_type' => $this->source_type,
            'source_id' => $this->source_id,
            'original_name' => $this->original_name,
            'file_path' => $this->file_path,
            'file_url' => $hasFile ? '/storage/' . $relative : null,
            'mime_type' => $this->mime_type,
            'file_size_bytes' => $this->file_size_bytes,
            'document_status' => $this->document_status,
            'document_date' => $this->document_date?->toDateString(),
            'expiry_date' => $this->expiry_date?->toDateString(),
            'has_file' => $hasFile,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

<?php

namespace Modules\ApplicantManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicantDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'applicant_document_id' => $this->applicant_document_id,
            'applicant_id'          => $this->applicant_id,
            'doc_type'              => $this->doc_type,
            'title'                 => $this->title,
            'original_copy'         => (bool) $this->original_copy,
            'file_path'             => $this->file_path,
            'original_name'         => $this->original_name,
            'uploaded_at'           => $this->uploaded_at?->toISOString(),

            /* Supporting-document verification results (NLP comparison
             * against the applicant's resume claims). */
            'verification_status'   => $this->verification_status,
            'verification_result'   => $this->verification_result_json,
            'extracted_profile'     => $this->extracted_profile_json,
            'verified_at'           => $this->verified_at?->toISOString(),

            'created_at'            => $this->created_at?->toISOString(),
            'updated_at'            => $this->updated_at?->toISOString(),
        ];
    }
}

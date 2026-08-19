<?php

namespace Modules\ApplicantManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Decode flags_json when it arrives as a JSON string (multipart uploads
     * always send it as a string, e.g. "[]"), so the 'array' rule passes.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('flags_json') && is_string($this->input('flags_json'))) {
            $decoded = json_decode($this->input('flags_json'), true);
            if (is_array($decoded)) {
                $this->merge(['flags_json' => $decoded]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'job_post_id'  => ['required', 'integer', 'exists:job_posts,job_post_id'],
            'name'         => ['required', 'string', 'max:160'],
            'email'        => ['required', 'email', 'max:190'],
            'phone'        => ['nullable', 'string', 'max:40'],
            'source'       => ['nullable', 'string', 'max:60'],
            'summary'      => ['nullable', 'string'],
            'flags_json'   => ['nullable', 'array'],
            'status'       => ['required', 'string', 'in:fit,other-role,credential,not-fit'],
            'stage'        => ['required', 'string', 'in:Screened,Interview Scheduled,Assessed,Offer,Hired,Rejected,Accepted'],
            'fit_score'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'resume'       => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,webp,heic,heif,bmp,gif,tiff,tif,avif,svg', 'max:20480'],
        ];
    }
}

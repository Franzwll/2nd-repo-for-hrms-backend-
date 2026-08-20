<?php

namespace Modules\ApplicantManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicantRequest extends FormRequest
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
            'job_post_id'  => ['sometimes', 'integer', 'exists:job_posts,job_post_id'],
            'name'         => ['sometimes', 'string', 'max:160'],
            'email'        => ['sometimes', 'email', 'max:190'],
            'phone'        => ['nullable', 'string', 'max:40'],
            'source'       => ['nullable', 'string', 'max:60'],
            'summary'      => ['nullable', 'string'],
            'fit_score'    => ['nullable', 'numeric', 'min:0', 'max:100'],
            'flags_json'   => ['nullable', 'array'],
            'status'       => ['sometimes', 'string', 'in:fit,other-role,credential,not-fit'],
            'stage'        => ['sometimes', 'string', 'in:Screened,Interview Scheduled,Assessed,Offer,Hired,Rejected,Accepted'],
            'resume'       => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ];
    }
}

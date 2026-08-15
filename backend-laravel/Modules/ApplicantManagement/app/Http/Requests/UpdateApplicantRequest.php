<?php

namespace Modules\ApplicantManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'stage'        => ['sometimes', 'string', 'in:Screened,Interview Scheduled,Assessed,Offer,Hired,Rejected'],
            'resume'       => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ];
    }
}

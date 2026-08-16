<?php

namespace Modules\ApplicantManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
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
            'resume'       => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ];
    }
}

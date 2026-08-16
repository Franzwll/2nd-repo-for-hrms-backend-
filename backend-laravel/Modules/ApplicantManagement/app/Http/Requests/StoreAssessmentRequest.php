<?php

namespace Modules\ApplicantManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'applicant_id'    => ['required', 'integer', 'exists:applicants,applicant_id'],
            'assessor_user_id'=> ['nullable', 'integer', 'exists:system_users,system_user_id'],
            'assessment_date' => ['required', 'date'],
            'scores_json'     => ['nullable', 'array'],
            'total_score'     => ['nullable', 'numeric', 'min:0', 'max:100'],
            'outcome'         => ['required', 'string', 'in:Recommended,Hold,Not Recommended'],
            'remarks'         => ['nullable', 'string'],
        ];
    }
}

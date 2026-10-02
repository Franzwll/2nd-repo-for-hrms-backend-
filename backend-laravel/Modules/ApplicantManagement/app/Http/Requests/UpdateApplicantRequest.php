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
            // Pipeline stages must match the chk_applicants_stage database
            // constraint (extended by 2026_09_05_000008 with the evaluation
            // pipeline stages). Omitting any of them makes the generic stage
            // update fail with "The selected stage is invalid." even though the
            // stage record itself (assessment test / practical / final
            // evaluation) was already persisted by its own controller.
            'stage'        => ['sometimes', 'string', 'in:Screened,Interview Scheduled,Assessed,Assessment Test,Practical Test,Final Evaluation,Offer,Hired,Rejected,Accepted'],
            // Same extension-based rule as StoreApplicantRequest — see the note
            // there on why `mimes` was replaced by `extensions`.
            'resume'       => ['nullable', 'file', 'extensions:pdf,doc,docx,jpg,jpeg,png,webp,heic,heif,bmp,gif,tiff,tif,avif,svg', 'max:20480'],
        ];
    }
}

<?php

namespace Modules\Landing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Landing\Http\Controllers\LandingController;

class JobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'job_post_id' => ['required', 'integer', 'exists:job_posts,job_post_id'],
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'source' => ['nullable', 'string', 'max:60'],
            'summary' => ['nullable', 'string', 'max:255'],
            'resume' => ['nullable', 'file', LandingController::uploadExtensionRule(), 'max:20480'],
            // Supporting docs from the unified 1-box uploader (recognized types
            // sent alongside each file: COE | Certificate | Credential | Others).
            'verification_docs' => ['sometimes', 'array', 'max:10'],
            'verification_docs.*' => ['file', LandingController::uploadExtensionRule(), 'max:20480'],
            'verification_doc_types' => ['sometimes', 'array'],
            'verification_doc_types.*' => ['string', 'in:COE,Certificate,Credential,Others'],
        ];
    }
}
<?php

namespace Modules\Landing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,webp,heic,heif,bmp,gif,tiff,tif,avif,svg', 'max:20480'],
        ];
    }
}
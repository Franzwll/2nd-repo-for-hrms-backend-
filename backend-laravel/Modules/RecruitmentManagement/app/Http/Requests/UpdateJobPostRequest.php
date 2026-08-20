<?php

namespace Modules\RecruitmentManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:150'],
            'department_id' => ['sometimes', 'integer', 'exists:departments,department_id'],
            'position_id' => ['sometimes', 'integer', 'exists:positions,position_id'],
            'employment_type' => ['sometimes', 'string', 'in:Full-time,Part-time,Contract,Seasonal'],
            'schedule' => ['nullable', 'string', 'max:120'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'vacancies' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'string', 'in:Open,Closed,Draft'],
            'active' => ['sometimes', 'boolean'],
            'experience_level' => ['nullable', 'string', 'in:No Experience,1-2 Years,3-5 Years,5+ Years'],
            'education_level' => ['nullable', 'string', 'in:High School Graduate,Vocational / TESDA,College Level,Bachelor\'s Degree'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'responsibilities' => ['nullable', 'array'],
            'qualifications' => ['nullable', 'array'],
            'skills' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'platforms' => ['nullable', 'array'],
            'platforms.*' => ['string', 'in:Website,Facebook,Instagram,Indeed'],
            'picture' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}

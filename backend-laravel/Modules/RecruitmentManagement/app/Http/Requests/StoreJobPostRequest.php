<?php

namespace Modules\RecruitmentManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\RecruitmentManagement\Enums\WorkSchedule;

class StoreJobPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:150'],
            'department_id' => ['required', 'integer', 'exists:departments,department_id'],
            'position_id' => ['required', 'integer', 'exists:positions,position_id'],
            'employment_type' => ['required', 'string', 'in:Full-time,Part-time,Contract,Seasonal'],
            'schedule' => ['nullable', 'string', 'max:120', Rule::in(WorkSchedule::values())],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0', 'gte:salary_min'],
            'vacancies' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', 'in:Open,Closed,Draft'],
            'active' => ['boolean'],
            'experience_level' => ['nullable', 'string', 'in:No Experience,1-2 Years,3-5 Years,5+ Years'],
            'education_level' => ['nullable', 'string', 'in:High School Graduate,Vocational / TESDA,College Level,Bachelor\'s Degree'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'responsibilities' => ['nullable', 'array'],
            'qualifications' => ['nullable', 'array'],
            'skills' => ['nullable', 'array'],
            'platforms' => ['nullable', 'array'],
            'platforms.*' => ['string', 'in:Website,Facebook,Instagram,Indeed'],
            'picture' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}

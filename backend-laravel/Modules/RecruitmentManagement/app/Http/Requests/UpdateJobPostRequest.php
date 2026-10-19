<?php

namespace Modules\RecruitmentManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\RecruitmentManagement\Enums\WorkSchedule;

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
            'schedule' => ['nullable', 'string', 'max:120', Rule::in(WorkSchedule::values())],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'vacancies' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'string', 'in:Open,Closed,Draft'],
            'active' => ['sometimes', 'boolean'],
            /* Test requirements are owned by Core HCM (positions table) — the
               Recruitment toggles were removed. These keys are no longer
               accepted here; legacy rows keep their stored values as fallback. */
            'experience_level' => ['nullable', 'string', 'in:No Experience,1-2 Years,3-5 Years,5+ Years'],
            'education_level' => ['nullable', 'string', 'in:High School Graduate,Vocational / TESDA,College Level,Bachelor\'s Degree'],
            /* Accepted level lists from the Screening Requirements chips. The
               scalar columns above are kept in step by the controller (the
               weakest accepted level), so either shape can be sent. */
            'experience_levels' => ['nullable', 'array'],
            'experience_levels.*' => ['string', 'in:No Experience,1-2 Years,3-5 Years,5+ Years'],
            'education_levels' => ['nullable', 'array'],
            'education_levels.*' => ['string', 'in:High School Graduate,Vocational / TESDA,College Level,Bachelor\'s Degree'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'responsibilities' => ['nullable', 'array'],
            'qualifications' => ['nullable', 'array'],
            'skills' => ['nullable', 'array'],
            'additional' => ['nullable', 'array'],
            'instructions' => ['nullable', 'string'],
            'about' => ['nullable', 'string'],
            'platforms' => ['nullable', 'array'],
            // Social media (Facebook / Instagram) and job-board (Indeed)
            // posting targets were removed — Website is the only channel.
            'platforms.*' => ['string', 'in:Website'],
            /* The recruiter's drag-and-drop block order on the builder canvas. */
            'blocks' => ['nullable', 'array'],
            'blocks.*' => ['string', 'in:title,info,picture,description,responsibilities,qualifications,skills,additional,instructions,about'],
            'picture' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}

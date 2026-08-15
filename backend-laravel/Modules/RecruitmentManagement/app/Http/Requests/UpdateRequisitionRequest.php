<?php

namespace Modules\RecruitmentManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequisitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'position_id'     => ['nullable', 'integer', 'exists:positions,position_id'],
            'position_title'  => ['nullable', 'string', 'max:150'],
            'department_id'   => ['sometimes', 'integer', 'exists:departments,department_id'],
            'requested_count' => ['sometimes', 'integer', 'min:1'],
            'urgency'         => ['sometimes', 'string', 'in:Normal,High,Urgent,Low'],
            'justification'   => ['sometimes', 'string'],
            'status'          => ['sometimes', 'string', 'in:Pending,Done,Converted'],
            'requested_at'    => ['sometimes', 'date'],
        ];
    }
}

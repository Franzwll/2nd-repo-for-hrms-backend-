<?php

namespace Modules\RecruitmentManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequisitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'position_id'            => ['nullable', 'integer', 'exists:positions,position_id'],
            'position_title'         => ['nullable', 'string', 'max:150'],
            'department_id'          => ['required', 'integer', 'exists:departments,department_id'],
            'requested_count'        => ['required', 'integer', 'min:1'],
            'urgency'                => ['required', 'string', 'in:Normal,High,Urgent,Low'],
            'justification'          => ['required', 'string'],
            'status'                 => ['sometimes', 'string', 'in:Pending,Done,Converted'],
            'requested_at'           => ['required', 'date'],
        ];
    }
}

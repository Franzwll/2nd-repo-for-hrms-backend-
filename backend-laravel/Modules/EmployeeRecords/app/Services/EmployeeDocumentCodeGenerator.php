<?php

namespace Modules\EmployeeRecords\Services;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Support\Facades\DB;

/**
 * Single source of truth for issuing employee-document codes.
 *
 * All paths that create an employee_documents row (ESS self-upload, ERM 201-file
 * upload, request fulfilment) mint their code here. The sequence row is locked
 * for the life of the surrounding transaction, so concurrent uploads serialise
 * and can never collide on the (employee_id, document_code) natural key.
 */
class EmployeeDocumentCodeGenerator
{
    /**
     * Create an employee document with a collision-free DOC-##### code.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function create(Employee $employee, array $attributes): EmployeeDocument
    {
        return DB::transaction(function () use ($employee, $attributes) {
            $row = DB::table('document_code_sequences')->where('id', 1)->lockForUpdate()->first();

            // Floor against existing rows so seeded / legacy documents (which
            // may use their own codes) can never be re-issued.
            $floor = (int) (EmployeeDocument::withTrashed()->max('document_id') ?? 0);

            if (! $row) {
                // Self-heal on legacy databases where the seed row is missing.
                DB::table('document_code_sequences')->insert(['id' => 1, 'next_val' => $floor]);
                $row = (object) ['next_val' => $floor];
            }

            $next = max((int) $row->next_val, $floor) + 1;

            DB::table('document_code_sequences')->where('id', 1)->update(['next_val' => $next]);

            return EmployeeDocument::create([
                'employee_id' => $employee->employee_id,
                'document_code' => 'DOC-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT),
                ...$attributes,
            ]);
        });
    }
}

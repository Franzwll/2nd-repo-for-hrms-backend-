<?php

namespace App\Services\Integration\Mocks;

use App\Models\EmployeeDocument;
use App\Services\Integration\Contracts\DocumentArchiveProvider;

/**
 * Demo/local implementation of the Team 8 (Document Management / Archiving)
 * seam. Until Team 8 exposes its archive API, this surfaces the employee's
 * already-verified ERM documents as the archive pool HR can attach when
 * fulfilling a document request.
 */
class MockDocumentArchiveProvider implements DocumentArchiveProvider
{
    public function archivedDocumentsFor(int $employeeId): array
    {
        return EmployeeDocument::where('employee_id', $employeeId)
            ->orderByDesc('document_date')
            ->get()
            ->map(fn (EmployeeDocument $d) => [
                'id' => $d->document_id,
                'code' => $d->document_code,
                'title' => $d->title,
                'category' => $d->category,
                'status' => $d->document_status,
                'document_date' => $d->document_date?->toDateString(),
                'file_path' => $d->file_path,
            ])->all();
    }
}

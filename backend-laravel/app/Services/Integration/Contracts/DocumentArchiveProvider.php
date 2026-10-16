<?php

namespace App\Services\Integration\Contracts;

/**
 * Integration seam for Facilities & Administrative Management (Cluster 4,
 * Team 8): Document Management (Archiving System) and Records Retention.
 *
 * Employee Records is the front door + fulfilment layer; Team 8 owns the
 * archive of record. When HR fulfils a document request they can either
 * upload a fresh file or attach an existing archived document surfaced here.
 */
interface DocumentArchiveProvider
{
    /**
     * Archived documents available for an employee.
     *
     * @return array<int, array<string, mixed>>
     */
    public function archivedDocumentsFor(int $employeeId): array;
}

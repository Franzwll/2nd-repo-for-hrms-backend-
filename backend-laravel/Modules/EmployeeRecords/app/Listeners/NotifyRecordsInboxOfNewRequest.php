<?php

namespace Modules\EmployeeRecords\Listeners;

use App\Services\Notifier;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeSelfService\Events\EssRequestFiled;

/**
 * "Inbound" half of the ESS <-> ERM loop. When an employee files a document
 * request (category hr_document), the Employee Records team is notified so the
 * request shows up on their radar immediately.
 */
class NotifyRecordsInboxOfNewRequest
{
    public function handle(EssRequestFiled $event): void
    {
        $request = $event->request;
        $request->loadMissing('category', 'employee');

        if (! $this->isDocumentRequest($request)) {
            return;
        }

        $employeeName = $request->employee?->full_name ?? 'An employee';

        $recipients = array_merge(Notifier::hrAdminIds(), Notifier::superAdminIds());

        Notifier::to($recipients, [
            'title' => 'New document request',
            'body' => "{$employeeName} requested \"{$request->request_type}\" ({$request->request_code}). Review it in ESS Management; once approved, upload the file from Employee Records → Document Requests.",
            'type' => 'info',
            'module_name' => 'Employee Records',
            'target_type' => 'ess_request',
            'target_id' => (string) $request->ess_request_id,
        ]);

        Log::info('ERM received document request', [
            'request_code' => $request->request_code,
        ]);
    }

    private function isDocumentRequest($request): bool
    {
        $code = strtolower((string) ($request->category?->code ?? ''));
        $type = strtolower((string) $request->request_type);

        return $code === 'hr_document'
            || str_contains($type, 'document')
            || str_contains($type, 'certificate')
            || str_contains($type, 'coe');
    }
}

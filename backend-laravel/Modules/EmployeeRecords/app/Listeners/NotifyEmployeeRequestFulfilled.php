<?php

namespace Modules\EmployeeRecords\Listeners;

use App\Models\SystemUser;
use App\Services\Notifier;
use Illuminate\Support\Facades\Log;
use Modules\EmployeeSelfService\Events\EssRequestFulfilled;

/**
 * "Return" half of the ESS <-> ERM loop. When HR attaches the requested file,
 * the employee is notified in-app that their document is ready to download.
 */
class NotifyEmployeeRequestFulfilled
{
    public function handle(EssRequestFulfilled $event): void
    {
        $request = $event->request;
        $request->loadMissing('employee');

        $recipientIds = SystemUser::where('employee_id', $request->employee_id)
            ->pluck('system_user_id')
            ->all();

        if (empty($recipientIds)) {
            Log::info('Fulfilled ESS request but no portal account found for employee', [
                'request_code' => $request->request_code,
                'employee_id' => $request->employee_id,
            ]);

            return;
        }

        Notifier::to($recipientIds, [
            'title' => 'Your document is ready',
            'body' => "Your request \"{$request->request_type}\" ({$request->request_code}) has been fulfilled. You can now download the file from your Request Center.",
            'type' => 'success',
            'module_name' => 'Employee Self-Service',
            'target_type' => 'ess_request',
            'target_id' => (string) $request->ess_request_id,
        ]);
    }
}

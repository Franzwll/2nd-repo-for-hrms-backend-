<?php

namespace Modules\EmployeeSelfService\Adapters;

use App\Models\EssRequest;
use App\Models\EssRequestAttachment;
use App\Models\SystemUser;
use Modules\EmployeeSelfService\Contracts\EssModuleAdapter;

abstract class BaseModuleAdapter implements EssModuleAdapter
{
    public function supports(EssRequest $request): bool
    {
        return true;
    }

    public function onRelease(EssRequest $request): void
    {
        // Most modules have nothing to do at release; delivery is the same
        // notification path for every category.
    }

    /**
     * @param  array{file_path:string,original_name:string,mime_type:string,file_size_bytes:int}|null  $filePayload
     */
    protected function storeOutboundAttachment(
        EssRequest $request,
        ?array $filePayload,
        ?SystemUser $actor,
        string $module
    ): ?EssRequestAttachment {
        if (! $filePayload) {
            return null;
        }

        return EssRequestAttachment::create([
            'ess_request_id' => $request->ess_request_id,
            'direction' => 'hr',
            'source_module' => $module,
            'file_path' => $filePayload['file_path'],
            'original_name' => $filePayload['original_name'],
            'mime_type' => $filePayload['mime_type'],
            'file_size_bytes' => $filePayload['file_size_bytes'],
            'uploaded_by_user_id' => $actor?->system_user_id,
        ]);
    }

    protected function removeModuleAttachments(EssRequest $request, string $module): void
    {
        EssRequestAttachment::where('ess_request_id', $request->ess_request_id)
            ->where('source_module', $module)
            ->delete();
    }

    /**
     * Latest result payload recorded for this request (used for compensation).
     *
     * @return array<string, mixed>
     */
    protected function latestResultPayload(EssRequest $request): array
    {
        $routing = $request->routings()
            ->where('action', 'complete')
            ->orderByDesc('ess_request_routing_id')
            ->first();

        return is_array($routing?->result_payload) ? $routing->result_payload : [];
    }
}

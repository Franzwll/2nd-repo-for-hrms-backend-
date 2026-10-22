<?php

namespace Modules\EmployeeSelfService\Contracts;

use App\Models\EssRequest;
use App\Models\SystemUser;

/**
 * Seam between ESS workflow and the module that owns a request.
 *
 * The module never completes a request. It validates and applies a result,
 * which moves the request to "For Release"; only ESS Management releases it
 * to the employee.
 */
interface EssModuleAdapter
{
    public function key(): string;

    /** Reject categories this module does not own. */
    public function supports(EssRequest $request): bool;

    /**
     * Validate a module result before anything is written.
     *
     * @param  array<string, mixed>  $payload
     * @param  array{file_path:string,original_name:string,mime_type:string,file_size_bytes:int}|null  $filePayload
     */
    public function validateResult(EssRequest $request, array $payload, ?array $filePayload): void;

    /**
     * Persist module-side effects and return metadata for the request row.
     *
     * Runs inside the submitResult transaction, so effects that must be
     * immediate (e.g. leave deduction) commit together with "For Release".
     *
     * @param  array<string, mixed>  $payload
     * @param  array{file_path:string,original_name:string,mime_type:string,file_size_bytes:int}|null  $filePayload
     * @return array{reference?:string|null,note?:string|null,ledger?:array<string,mixed>}
     */
    public function applyResult(
        EssRequest $request,
        array $payload,
        ?array $filePayload,
        ?SystemUser $actor
    ): array;

    /**
     * Compensate applyResult when a result is voided or rerouted.
     * Must be idempotent.
     */
    public function reverseResult(EssRequest $request, ?SystemUser $actor, string $reason): void;

    /** Delivery side effects applied exactly once at release. Never mutates balances. */
    public function onRelease(EssRequest $request): void;
}

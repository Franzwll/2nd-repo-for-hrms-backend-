<?php

namespace Modules\NewHireOnboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\NewHireOnboarding\Models\EmployeeOnboardingItem;
use Modules\NewHireOnboarding\Models\NewHire;
use App\Services\AuditLogger;
use App\Services\Notifier;

class EmployeeOnboardingItemController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/new-hires/{new_hire}/onboarding-items                   */
    /* Read-time union computed in NewHire::visibleOnboardingItems():       */
    /* materialized rows + virtual items from Active checklist templates    */
    /* that match the hire's stage and position.                            */
    /*                                                                      */
    /* A checklist template is SHOW/HIDE driven:                            */
    /*  - activating a template makes its items appear (no rows inserted);  */
    /*  - deactivating (or deleting) a template hides its items again;      */
    /*  - completion state is preserved on the materialized rows.           */
    /* ------------------------------------------------------------------ */

    public function index(int $new_hire): JsonResponse
    {
        $newHire = NewHire::findOrFail($new_hire);

        return response()->json($newHire->visibleOnboardingItems());
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/onboarding-items/{item}/toggle                        */
    /* Toggle the done flag (or force it via body `done`); auto-complete   */
    /* onboarding when all items are done                                  */
    /* ------------------------------------------------------------------ */

    public function toggle(Request $request, int $item): JsonResponse
    {
        $model = EmployeeOnboardingItem::findOrFail($item);

        $data = $request->validate([
            'done'        => ['sometimes', 'boolean'],
            'review_note' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($model, $request, $data) {
            $nowDone = array_key_exists('done', $data)
                ? (bool) $data['done']
                : ! $model->done;
            $model->update([
                'done'                 => $nowDone,
                'completed_at'         => $nowDone ? now() : null,
                'completed_by_user_id' => $nowDone ? ($request->user()?->id ?? null) : null,
                // Verifying resolves any prior correction note; reopening
                // keeps (or sets) the note so the employee sees the reason.
                'review_note'          => $nowDone ? null : ($data['review_note'] ?? $model->review_note),
            ]);

            // Check if all items for this new hire are complete
            if ($nowDone && $model->new_hire_id) {
                $newHire    = NewHire::with('onboardingItems')->find($model->new_hire_id);
                $allDone    = $newHire?->onboardingItems->every(fn ($i) => (bool) $i->done);

                if ($allDone && $newHire?->employee_id) {
                    // Mark the employee's onboarding_complete flag
                    \DB::table('employees')
                        ->where('employee_id', $newHire->employee_id)
                        ->update(['onboarding_complete' => true]);
                }
            }
        });

        AuditLogger::log(
            action: 'Onboarding Item Toggled',
            module: 'New Hire Onboarding',
            targetType: 'Onboarding Item',
            targetId: (string) $model->getKey(),
            details: ($model->done ? 'Completed' : 'Reopened')
                . " onboarding item '{$model->item_text}'"
                . ($model->new_hire_id ? " (new hire #{$model->new_hire_id})" : '') . '.',
        );

        // Verification changes what the employee sees — tell them.
        if ($model->done) {
            $this->notifyEmployee(
                $model,
                'Requirement verified',
                "Your onboarding requirement '{$model->item_text}' was verified by HR.",
                'success'
            );
        }

        return response()->json([
            'employee_onboarding_item_id' => $model->employee_onboarding_item_id,
            'done'                         => (bool) $model->done,
            'completed_at'                 => $model->completed_at?->toISOString(),
            'review_note'                  => $model->review_note,
            'returned_count'               => (int) ($model->returned_count ?? 0),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/onboarding-submissions                                */
    /* HR review queue: every submitted-but-unverified item across hires */
    /* (Edit-gated — employees keep using their own ESS checklist).      */
    /* ------------------------------------------------------------------ */

    public function pendingReview(Request $request): JsonResponse
    {
        $items = EmployeeOnboardingItem::with(['newHire', 'templateItem.template'])
            ->whereNotNull('submitted_at')
            ->where('done', false)
            ->orderByDesc('submitted_at')
            ->get();

        return response()->json([
            'count' => $items->count(),
            'data'  => $items->map(fn ($i) => [
                'employee_onboarding_item_id' => $i->employee_onboarding_item_id,
                'new_hire_id'                 => $i->new_hire_id,
                'hire_name'                   => $i->newHire?->name ?? 'Unknown',
                'hire_stage'                  => $i->newHire?->stage,
                'employee_id'                 => $i->employee_id,
                'item_text'                   => $i->item_text,
                'phase'                       => $i->templateItem?->template?->phase,
                'file_name'                   => $i->file_name,
                'notes'                       => $i->notes,
                'submitted_at'                => $i->submitted_at?->toISOString(),
                'returned_count'              => (int) ($i->returned_count ?? 0),
                'review_note'                 => $i->review_note,
            ]),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/onboarding-items/{item}/return                         */
    /* HR sends a submission back for correction with a reason. The item   */
    /* stays submitted (file kept) but unverified; the employee sees the   */
    /* note and resubmits via the normal upload flow.                      */
    /* ------------------------------------------------------------------ */

    public function returnItem(Request $request, int $item): JsonResponse
    {
        $model = EmployeeOnboardingItem::findOrFail($item);

        $data = $request->validate([
            'note' => ['required', 'string', 'max:1000'],
        ]);

        $model->update([
            'done'                   => false,
            'completed_at'           => null,
            'completed_by_user_id'   => null,
            'review_note'            => $data['note'],
            'returned_count'         => ((int) ($model->returned_count ?? 0)) + 1,
        ]);

        AuditLogger::log(
            action: 'Onboarding Item Returned',
            module: 'New Hire Onboarding',
            targetType: 'Onboarding Item',
            targetId: (string) $model->getKey(),
            details: "Returned onboarding item '{$model->item_text}' for correction"
                . ($model->new_hire_id ? " (new hire #{$model->new_hire_id})" : '')
                . ": {$data['note']}",
        );

        $this->notifyEmployee(
            $model,
            'Requirement returned for correction',
            "HR returned '{$model->item_text}' for correction: {$data['note']}",
            'warning'
        );

        return response()->json([
            'employee_onboarding_item_id' => $model->employee_onboarding_item_id,
            'done'                        => false,
            'review_note'                 => $model->review_note,
            'returned_count'              => (int) $model->returned_count,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Notification helpers (helpful-only: bell rings when someone must    */
    /* act or know — submissions ping HR, verification/returns ping the    */
    /* employee). Failures here must never break the main request.        */
    /* ------------------------------------------------------------------ */

    private function employeeUserIds(EmployeeOnboardingItem $model): array
    {
        if (! $model->employee_id) {
            return [];
        }

        return SystemUser::where('employee_id', $model->employee_id)
            ->pluck('system_user_id')
            ->all();
    }

    private function notifyEmployee(
        EmployeeOnboardingItem $model,
        string $title,
        string $body,
        string $type = 'info'
    ): void {
        try {
            $ids = $this->employeeUserIds($model);
            if (empty($ids)) {
                return;
            }
            Notifier::to($ids, [
                'title'       => $title,
                'body'        => $body,
                'type'        => $type,
                'module_name' => 'New Hire Onboarding',
                'target_type' => 'onboarding_item',
                'target_id'   => (string) $model->getKey(),
            ]);
        } catch (\Throwable) {
            // Notifications are best-effort.
        }
    }

    private function notifyHrAdmins(
        string $title,
        string $body,
        EmployeeOnboardingItem $model,
        ?int $actorId,
        string $type = 'info'
    ): void {
        try {
            $ids = array_values(array_diff(
                array_merge(Notifier::hrAdminIds(), Notifier::superAdminIds()),
                $actorId ? [$actorId] : []
            ));
            if (empty($ids)) {
                return;
            }
            Notifier::to($ids, [
                'title'       => $title,
                'body'        => $body,
                'type'        => $type,
                'module_name' => 'New Hire Onboarding',
                'target_type' => 'onboarding_item',
                'target_id'   => (string) $model->getKey(),
            ]);
        } catch (\Throwable) {
            // Notifications are best-effort.
        }
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/new-hires/{new_hire}/onboarding-items/bulk             */
    /* Seed items from a checklist template for a new hire                 */
    /* ------------------------------------------------------------------ */

    public function bulkCreate(Request $request, int $new_hire): JsonResponse
    {
        $model = NewHire::findOrFail($new_hire);

        $data = $request->validate([
            'template_id'  => ['required', 'integer', 'exists:onboarding_checklist_templates,template_id'],
        ]);

        $items = \Modules\NewHireOnboarding\Models\OnboardingChecklistItem
            ::where('template_id', $data['template_id'])
            ->orderBy('sort_order')
            ->get();

        // Skip template items already applied to this new hire
        $existing = $model->onboardingItems()
            ->whereNotNull('template_item_id')
            ->pluck('template_item_id')
            ->all();

        $created = [];
        foreach ($items as $templateItem) {
            if (in_array($templateItem->template_item_id, $existing, true)) {
                continue;
            }
            $oi = EmployeeOnboardingItem::create([
                'employee_id'      => $model->employee_id,
                'new_hire_id'      => $new_hire,
                'template_item_id' => $templateItem->template_item_id,
                'item_text'        => $templateItem->item_text,
                'done'             => false,
            ]);
            $created[] = $oi;
        }

        return response()->json([
            'message' => count($created) . ' onboarding items created.',
            'count'   => count($created),
        ], 201);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/new-hires/{new_hire}/onboarding-items                  */
    /* Materialize a single virtual template item into a tracked row so    */
    /* its completion can be persisted (done flag, completed_at).          */
    /* ------------------------------------------------------------------ */

    public function materialize(Request $request, int $new_hire): JsonResponse
    {
        $model = NewHire::findOrFail($new_hire);

        $data = $request->validate([
            'template_item_id' => ['required', 'integer', 'exists:onboarding_checklist_items,template_item_id'],
        ]);

        $existing = $model->onboardingItems()
            ->where('template_item_id', $data['template_item_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'employee_onboarding_item_id' => $existing->employee_onboarding_item_id,
                'template_item_id'             => $existing->template_item_id,
                'item_text'                    => $existing->item_text,
                'done'                          => (bool) $existing->done,
                'phase'                         => $existing->templateItem?->template?->phase
                    ?? $model->stageForOnboardingItem($existing),
            ]);
        }

        $templateItem = \Modules\NewHireOnboarding\Models\OnboardingChecklistItem
            ::findOrFail($data['template_item_id']);

        $oi = EmployeeOnboardingItem::create([
            'employee_id'      => $model->employee_id,
            'new_hire_id'      => $new_hire,
            'template_item_id' => $templateItem->template_item_id,
            'item_text'        => $templateItem->item_text,
            'done'             => false,
        ]);

        return response()->json([
            'employee_onboarding_item_id' => $oi->employee_onboarding_item_id,
            'template_item_id'             => $oi->template_item_id,
            'item_text'                    => $oi->item_text,
            'instructions'                 => $templateItem->instructions,
            'requires_upload'              => (bool) $templateItem->requires_upload,
            'upload_placeholder'           => $templateItem->upload_placeholder,
            'file_path'                    => null,
            'file_name'                    => null,
            'file_url'                     => null,
            'notes'                        => null,
            'done'                          => false,
            'phase'                         => $oi->templateItem?->template?->phase
                ?? $model->stageForOnboardingItem($oi),
        ], 201);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/onboarding-items/{item}/upload                         */
    /* Employee SUBMITS a requirement: optional document + optional notes. */
    /* Submission is recorded via submitted_at but does NOT mark the item  */
    /* done — only Admin/Super Admin verification (toggle) moves progress. */
    /* ------------------------------------------------------------------ */

    public function upload(Request $request, int $item): JsonResponse
    {
        $model = EmployeeOnboardingItem::findOrFail($item);

        $request->validate([
            'file'  => ['nullable', 'file', 'max:10240'], // 10MB max
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $file = $request->file('file');
        $fileName = null;
        $filePath = $model->file_path;

        if ($file) {
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('onboarding_documents', 'public');

            // Clean up old file if replacing
            if ($model->file_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($model->file_path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($model->file_path);
            }
        }

        DB::transaction(function () use ($model, $filePath, $fileName, $request) {
            $model->update([
                'file_path'    => $filePath,
                'file_name'    => $fileName ?? $model->file_name,
                'notes'        => $request->filled('notes')
                    ? $request->input('notes')
                    : $model->notes,
                'submitted_at' => now(),
            ]);
        });

        AuditLogger::log(
            action: 'Onboarding Item Document Submitted',
            module: 'New Hire Onboarding',
            targetType: 'Onboarding Item',
            targetId: (string) $model->getKey(),
            details: ($fileName ? "Submitted document '{$fileName}'" : 'Submitted notes')
                . " for onboarding item '{$model->item_text}'"
                . ($model->new_hire_id ? " (new hire #{$model->new_hire_id})" : '') . '.',
        );

        // A submission needs HR action — tell HR admins and super admins.
        $hireName = $model->newHire?->name ?? 'A new hire';
        $this->notifyHrAdmins(
            'Onboarding document submitted',
            "{$hireName} submitted '{$model->item_text}' — awaiting verification.",
            $model,
            $request->user()?->system_user_id
        );

        return response()->json([
            'employee_onboarding_item_id' => $model->employee_onboarding_item_id,
            'file_path'                    => $model->file_path,
            'file_name'                    => $model->file_name,
            'file_url'                     => $model->file_url,
            'notes'                        => $model->notes,
            'submitted_at'                 => $model->submitted_at?->toISOString(),
            'done'                         => (bool) $model->done,
            'completed_at'                 => $model->completed_at?->toISOString(),
            'message'                      => $fileName
                ? "Document '{$fileName}' submitted — awaiting HR verification."
                : 'Submission sent — awaiting HR verification.',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/onboarding-items/{item}/document                        */
    /* Streams the employee's uploaded document from storage. Used instead */
    /* of the public /storage URL so files stay accessible even when the   */
    /* public/storage symlink or host root changes.                        */
    /* ------------------------------------------------------------------ */

    public function document(Request $request, int $item): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
    {
        // Files are previewed inside a browser <iframe>/<img>, which cannot send
        // an Authorization header, so authenticate directly from the ?token=
        // query param (Bearer header accepted as a fallback) instead of relying
        // on the auth:sanctum middleware. Permission is also enforced here.
        $user = $this->resolveTokenUser($request);

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! $this->hasOnboardingView($user)) {
            return response()->json([
                'message' => 'Access denied: you do not have permission to view this document.',
            ], 403);
        }

        $model = EmployeeOnboardingItem::findOrFail($item);

        if (! $model->file_path || ! \Illuminate\Support\Facades\Storage::disk('public')->exists($model->file_path)) {
            return response()->json(['message' => 'No document found for this checklist item.'], 404);
        }

        $disk = \Illuminate\Support\Facades\Storage::disk('public');
        $path = $disk->path($model->file_path);
        $name = $model->file_name ?: 'document';

        // Serve inline (not as an attachment) so browsers render PDFs/images in
        // an <iframe>/<img> instead of triggering a download. DOCX/etc. can't be
        // previewed in-browser and fall back to a Download action in the UI.
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $mimeMap = [
            'pdf'  => 'application/pdf',
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'bmp'  => 'image/bmp',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls'  => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        $mime = $mimeMap[$ext]
            ?? (function_exists('mime_content_type') ? @mime_content_type($path) : null)
            ?? 'application/octet-stream';

        return response()->file($path, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . $name . '"',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Token-based authentication for direct browser previews              */
    /* ------------------------------------------------------------------ */

    private function resolveTokenUser(Request $request): ?SystemUser
    {
        $token = $request->query('token') ?? $request->bearerToken();

        if (! $token) {
            return null;
        }

        $pat = PersonalAccessToken::findToken($token);

        if (! $pat || ! $pat->tokenable instanceof SystemUser) {
            return null;
        }

        return $pat->tokenable;
    }

    private function hasOnboardingView(SystemUser $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $ranks = [
            'Full'                => 3,
            'Edit'                => 2,
            'Write'               => 2,
            'Approve / Reject Only' => 2,
            'View'                => 1,
            'Read'                => 1,
            'None'                => 0,
        ];

        $level = $user->permissions->firstWhere('module_name', 'New Hire Onboarding')?->permission_level ?? 'None';

        return ($ranks[$level] ?? 0) >= 1;
    }
}

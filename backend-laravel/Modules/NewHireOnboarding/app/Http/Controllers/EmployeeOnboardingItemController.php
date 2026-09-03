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

        DB::transaction(function () use ($model, $request) {
            $nowDone = $request->has('done')
                ? (bool) $request->input('done')
                : ! $model->done;
            $model->update([
                'done'                 => $nowDone,
                'completed_at'         => $nowDone ? now() : null,
                'completed_by_user_id' => $nowDone ? ($request->user()?->id ?? null) : null,
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

        return response()->json([
            'employee_onboarding_item_id' => $model->employee_onboarding_item_id,
            'done'                         => (bool) $model->done,
            'completed_at'                 => $model->completed_at?->toISOString(),
        ]);
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

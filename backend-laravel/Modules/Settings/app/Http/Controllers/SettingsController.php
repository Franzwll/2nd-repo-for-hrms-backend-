<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Settings\Http\Requests\BulkUpsertSettingRequest;
use Modules\Settings\Http\Requests\UpsertSettingRequest;
use Modules\Settings\Http\Resources\SystemSettingResource;
use Modules\Settings\Models\SystemSetting;

class SettingsController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/settings                                                */
    /* Returns all settings as a flat key в†’ value map (plus full rows)    */
    /* ------------------------------------------------------------------ */

    public function index(): JsonResponse
    {
        $settings = SystemSetting::orderBy('setting_key')->get();

        return response()->json([
            // Full row collection (for admin table view)
            'data' => SystemSettingResource::collection($settings),

            // Convenience map:  { "some_key": <value>, ... }
            'map'  => $settings->pluck('setting_value', 'setting_key'),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/settings/{key}                                          */
    /* ------------------------------------------------------------------ */

    public function show(string $key): JsonResponse
    {
        $setting = SystemSetting::where('setting_key', $key)->firstOrFail();
        return response()->json(new SystemSettingResource($setting));
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/settings/{key}                                          */
    /* Create-or-update a single setting by its key                        */
    /* ------------------------------------------------------------------ */

    public function upsert(UpsertSettingRequest $request, string $key): JsonResponse
    {
        $userId  = $request->user()?->id ?? null;
        $setting = SystemSetting::setValue($key, $request->validated('setting_value'), $userId);

        return response()->json(new SystemSettingResource($setting));
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/settings/bulk                                         */
    /* Save multiple settings in a single request                          */
    /* ------------------------------------------------------------------ */

    public function bulkUpsert(BulkUpsertSettingRequest $request): JsonResponse
    {
        $userId  = $request->user()?->id ?? null;
        $updated = [];

        foreach ($request->validated('settings') as $entry) {
            $updated[] = SystemSetting::setValue($entry['key'], $entry['value'], $userId);
        }

        return response()->json([
            'message' => count($updated) . ' setting(s) saved.',
            'data'    => SystemSettingResource::collection(collect($updated)),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/settings/{key}                                       */
    /* Remove a setting entirely (use with caution)                        */
    /* ------------------------------------------------------------------ */

    public function destroy(string $key): JsonResponse
    {
        $deleted = SystemSetting::where('setting_key', $key)->delete();

        if (! $deleted) {
            return response()->json(['message' => "Setting '{$key}' not found."], 404);
        }

        return response()->json(['message' => "Setting '{$key}' deleted."]);
    }
}

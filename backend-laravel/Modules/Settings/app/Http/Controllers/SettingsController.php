<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\Settings\Http\Requests\BulkUpsertSettingRequest;
use Modules\Settings\Http\Requests\UpsertSettingRequest;
use Modules\Settings\Http\Resources\SystemSettingResource;
use Modules\Settings\Models\SystemSetting;
use Modules\Settings\Models\SystemUser;

class SettingsController extends Controller
{
    private const SENSITIVE_KEYS = ['default_password'];

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/settings                                                */
    /* Returns all settings as a flat key → value map (plus full rows)    */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $settings = SystemSetting::orderBy('setting_key')->get();

        if (! $this->isFullSettings($request)) {
            $settings = $settings->reject(fn ($setting) => in_array($setting->setting_key, self::SENSITIVE_KEYS, true));
        }

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

    public function show(Request $request, string $key): JsonResponse
    {
        if (in_array($key, self::SENSITIVE_KEYS, true) && ! $this->isFullSettings($request)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

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

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/system-users                                            */
    /* Lightweight user list (id + name) for pickers like the assessor     */
    /* selector in the applicant assessment dialog.                        */
    /* ------------------------------------------------------------------ */

    public function listSystemUsers(): JsonResponse
    {
        $users = SystemUser::orderBy('full_name')
            ->get()
            ->map(fn ($user) => [
                'system_user_id' => $user->system_user_id,
                'full_name'      => $user->full_name ?? $user->username,
                'username'       => $user->username,
                'department_name'=> $user->department_name,
            ]);

        return response()->json(['data' => $users]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/reset-default-password                                 */
    /* Change the default password of ALL system users at once, and store  */
    /* it in system_settings so newly created accounts (new hires, etc.)   */
    /* start with the same default password.                               */
    /* Restricted to Super Admin (permission:Settings:Full).               */
    /* ------------------------------------------------------------------ */

    public function resetDefaultPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'max:72'],
        ]);

        $updated = SystemUser::query()
            ->where('status', 'Active')
            ->update(['password_hash' => Hash::make($data['password'])]);

        // Persist the new default password — read back via
        // GET /api/v1/settings/default_password for new-user account setup.
        SystemSetting::setValue(
            'default_password',
            ['password' => $data['password']],
            $request->user()?->id ?? null
        );

        return response()->json([
            'message' => "Default password changed for {$updated} active user(s).",
            'updated' => $updated,
        ]);
    }

    private function isFullSettings(Request $request): bool
    {
        $level = $request->user()?->permissions->firstWhere('module_name', 'Settings')?->permission_level;

        return $level === 'Full';
    }
}
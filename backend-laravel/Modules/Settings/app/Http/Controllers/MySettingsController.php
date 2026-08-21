<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Modules\Settings\Models\SystemSetting;

/**
 * Per-user portal settings (Notifications, Preferences, Change Password).
 *
 * The authenticated user is identified by their own account email. Per-user
 * values are stored under scope-scoped setting keys, e.g.
 *   my_notifications_kevin.santos@oxfordsuites.com.ph
 * so each portal user gets their own designated values while the global
 * system defaults (system_settings.notifications / .preferences) act as
 * fallbacks.
 */
class MySettingsController extends Controller
{
    /** Builds the storage key for a user's per-user scope. */
    private static function keyFor(string $scope, string $user): string
    {
        $slug = strtolower(trim($user));
        $slug = preg_replace('/[^a-z0-9@._-]/i', '', $slug) ?: 'user';
        return "my_{$scope}_{$slug}";
    }

    /** The email scope belongs to the authenticated account only. */
    private static function authenticatedUser(Request $request): string
    {
        return $request->user()->email ?? $request->user()->username;
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/my/settings                                             */
    /* Returns the current user's notifications + preferences, merged over  */
    /* the global system defaults.                                         */
    /* ------------------------------------------------------------------ */

    public function show(Request $request): JsonResponse
    {
        $user = static::authenticatedUser($request);

        $defaults = [
            'notifications' => SystemSetting::getValue('notifications', []),
            'preferences'   => SystemSetting::getValue('preferences', []),
        ];

        $mine = SystemSetting::getValue(static::keyFor('notifications', $user), []);
        $defaults['notifications'] = array_merge(
            is_array($defaults['notifications']) ? $defaults['notifications'] : [],
            is_array($mine) ? $mine : [],
        );

        $prefs = SystemSetting::getValue(static::keyFor('preferences', $user), []);
        $defaults['preferences'] = array_merge(
            is_array($defaults['preferences']) ? $defaults['preferences'] : [],
            is_array($prefs) ? $prefs : [],
        );

        return response()->json($defaults);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/my/settings/{scope}                                     */
    /* scope: notifications | preferences                                  */
    /* body: { value }                                                     */
    /* ------------------------------------------------------------------ */

    public function save(Request $request, string $scope): JsonResponse
    {
        if (! in_array($scope, ['notifications', 'preferences'], true)) {
            return response()->json(['message' => "Unknown settings scope '{$scope}'."], 422);
        }

        $data = $request->validate([
            'value' => ['required', 'array'],
        ]);

        $setting = SystemSetting::setValue(
            static::keyFor($scope, static::authenticatedUser($request)),
            $data['value'],
            $request->user()?->id ?? null
        );

        return response()->json([
            'setting_key'   => $setting->setting_key,
            'setting_value' => $setting->setting_value,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/my/change-password                                     */
    /* body: { current_password, new_password }                             */
    /* Verifies the current password against the authenticated account and */
    /* updates it.                                                         */
    /* ------------------------------------------------------------------ */

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'max:72'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password_hash' => Hash::make($data['new_password'])]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
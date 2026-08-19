<?php

namespace Modules\Settings\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Modules\Settings\Models\SystemSetting;
use Modules\Settings\Models\SystemUser;

/**
 * Per-user portal settings (Notifications, Preferences, Change Password).
 *
 * The app has no authentication layer, so the "current user" is identified by
 * the portal role's account key sent from the frontend (an email). Per-user
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

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/my/settings?user=<email>                                */
    /* Returns the current user's notifications + preferences, merged over  */
    /* the global system defaults.                                         */
    /* ------------------------------------------------------------------ */

    public function show(Request $request): JsonResponse
    {
        $user = (string) $request->query('user', '');

        $defaults = [
            'notifications' => SystemSetting::getValue('notifications', []),
            'preferences'   => SystemSetting::getValue('preferences', []),
        ];

        if ($user !== '') {
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
        }

        return response()->json($defaults);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/my/settings/{scope}                                     */
    /* scope: notifications | preferences                                  */
    /* body: { user, value }                                               */
    /* ------------------------------------------------------------------ */

    public function save(Request $request, string $scope): JsonResponse
    {
        if (! in_array($scope, ['notifications', 'preferences'], true)) {
            return response()->json(['message' => "Unknown settings scope '{$scope}'."], 422);
        }

        $data = $request->validate([
            'user'  => ['required', 'string', 'max:190'],
            'value' => ['required', 'array'],
        ]);

        $setting = SystemSetting::setValue(
            static::keyFor($scope, $data['user']),
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
    /* body: { user, current_password, new_password }                      */
    /* Verifies the current password against system_users.password_hash    */
    /* and updates it. A missing portal account is provisioned first with  */
    /* the default password so demo/new-hire users can change it.          */
    /* ------------------------------------------------------------------ */

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user'             => ['required', 'string', 'max:190'],
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'max:72'],
        ]);

        $user = SystemUser::where('email', $data['user'])
            ->orWhere('username', $data['user'])
            ->first();

        // Auto-provision missing demo accounts with the default password so
        // the portal's change-password flow works out of the box.
        if (! $user) {
            $defaultPassword = SystemSetting::getValue('default_password', []);
            $default = is_array($defaultPassword) && isset($defaultPassword['password'])
                ? (string) $defaultPassword['password']
                : 'Oxford@2026';

            $base = strtolower(preg_replace('/[^a-z0-9._-]/i', '', explode('@', $data['user'])[0] ?? 'user'));
            $username = $base;
            $suffix = 1;
            while (SystemUser::where('username', $username)->exists()) {
                $username = $base . $suffix++;
            }

            $user = SystemUser::create([
                'username'      => $username,
                'email'         => $data['user'],
                'password_hash' => Hash::make($default),
                'full_name'     => $username,
                'role_id'       => 3,
                'status'        => 'Active',
            ]);
        }

        if (! Hash::check($data['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password_hash' => Hash::make($data['new_password'])]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
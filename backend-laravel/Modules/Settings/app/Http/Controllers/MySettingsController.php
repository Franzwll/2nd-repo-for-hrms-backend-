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

<<<<<<< HEAD
    /**
     * Resolves the account these personal settings belong to.
     *
     * The authenticated session user (Bearer token) always wins; the explicit
     * ?user= / body parameter is only a fallback for token-less demo calls.
     */
    private static function resolveUser(Request $request, ?string $fallback = null): ?string
    {
        $sessionEmail = auth('sanctum')->user()?->email;

        return $sessionEmail ?: ($fallback ?: null);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/my/settings?user=<email>                                */
    /* Returns the current user's notifications + preferences (merged over  */
    /* the global system defaults) and their personal OTP flag.            */
=======
    /** The email scope belongs to the authenticated account only. */
    private static function authenticatedUser(Request $request): string
    {
        return $request->user()->email ?? $request->user()->username;
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/my/settings                                             */
    /* Returns the current user's notifications + preferences, merged over  */
    /* the global system defaults.                                         */
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb
    /* ------------------------------------------------------------------ */

    public function show(Request $request): JsonResponse
    {
<<<<<<< HEAD
        $session = auth('sanctum')->user();
        $user = self::resolveUser($request, (string) $request->query('user', '')) ?? '';
=======
        $user = static::authenticatedUser($request);
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb

        $defaults = [
            'notifications' => SystemSetting::getValue('notifications', []),
            'preferences'   => SystemSetting::getValue('preferences', []),
            'otp_enabled'   => true,
            'user'          => $user !== '' ? $user : $session?->email,
        ];

        $mine = SystemSetting::getValue(static::keyFor('notifications', $user), []);
        $defaults['notifications'] = array_merge(
            is_array($defaults['notifications']) ? $defaults['notifications'] : [],
            is_array($mine) ? $mine : [],
        );

<<<<<<< HEAD
            $prefs = SystemSetting::getValue(static::keyFor('preferences', $user), []);
            $defaults['preferences'] = array_merge(
                is_array($defaults['preferences']) ? $defaults['preferences'] : [],
                is_array($prefs) ? $prefs : [],
            );

            // Personal OTP flag lives on the account row itself.
            $account = $session
                ?? SystemUser::where('email', $user)->orWhere('username', $user)->first();
            if ($account) {
                $defaults['otp_enabled'] = (bool) ($account->otp_enabled ?? true);
            }
        }
=======
        $prefs = SystemSetting::getValue(static::keyFor('preferences', $user), []);
        $defaults['preferences'] = array_merge(
            is_array($defaults['preferences']) ? $defaults['preferences'] : [],
            is_array($prefs) ? $prefs : [],
        );
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb

        return response()->json($defaults);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/my/settings/{scope}                                     */
    /* scope: notifications | preferences                                  */
<<<<<<< HEAD
    /* body: { value }  (user param optional when authenticated)           */
=======
    /* body: { value }                                                     */
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb
    /* ------------------------------------------------------------------ */

    public function save(Request $request, string $scope): JsonResponse
    {
        if (! in_array($scope, ['notifications', 'preferences'], true)) {
            return response()->json(['message' => "Unknown settings scope '{$scope}'."], 422);
        }

        $data = $request->validate([
<<<<<<< HEAD
            'user'  => ['nullable', 'string', 'max:190'],
=======
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb
            'value' => ['required', 'array'],
        ]);

        $user = self::resolveUser($request, $data['user'] ?? null);

        if (! $user) {
            return response()->json(['message' => 'No authenticated user and no user provided.'], 401);
        }

        $setting = SystemSetting::setValue(
<<<<<<< HEAD
            static::keyFor($scope, $user),
=======
            static::keyFor($scope, static::authenticatedUser($request)),
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb
            $data['value'],
            auth('sanctum')->user()?->system_user_id
        );

        return response()->json([
            'setting_key'   => $setting->setting_key,
            'setting_value' => $setting->setting_value,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/my/otp                                                  */
    /* Toggle THIS account's OTP-at-login requirement.                     */
    /* body: { enabled, user? }                                            */
    /* ------------------------------------------------------------------ */

    public function toggleOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'user'    => ['nullable', 'string', 'max:190'],
        ]);

        $session = auth('sanctum')->user();

        $account = $session
            ?? SystemUser::where('email', $data['user'] ?? '')
                ->orWhere('username', $data['user'] ?? '')
                ->first();

        if (! $account) {
            return response()->json(['message' => 'Account not found.'], 404);
        }

        $account->update(['otp_enabled' => $data['enabled']]);

        return response()->json([
            'message'     => $data['enabled']
                ? 'OTP verification enabled for your account.'
                : 'OTP verification disabled for your account.',
            'otp_enabled' => (bool) $account->otp_enabled,
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
<<<<<<< HEAD
            'user'             => ['nullable', 'string', 'max:190'],
=======
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'max:72'],
        ]);

<<<<<<< HEAD
        $identifier = self::resolveUser($request, $data['user'] ?? null);

        if (! $identifier) {
            return response()->json(['message' => 'No authenticated user and no user provided.'], 401);
        }

        $user = SystemUser::where('email', $identifier)
            ->orWhere('username', $identifier)
            ->first();

        // Auto-provision missing demo accounts with the default password so
        // the portal's change-password flow works out of the box.
        if (! $user) {
            $defaultPassword = SystemSetting::getValue('default_password', []);
            $default = is_array($defaultPassword) && isset($defaultPassword['password'])
                ? (string) $defaultPassword['password']
                : 'Oxford@2026';

            $base = strtolower(preg_replace('/[^a-z0-9._-]/i', '', explode('@', $identifier)[0] ?? 'user'));
            $username = $base;
            $suffix = 1;
            while (SystemUser::where('username', $username)->exists()) {
                $username = $base . $suffix++;
            }

            $user = SystemUser::create([
                'username'      => $username,
                'email'         => $identifier,
                'password_hash' => Hash::make($default),
                'full_name'     => $username,
                'role_id'       => 3,
                'status'        => 'Active',
            ]);
        }
=======
        $user = $request->user();
>>>>>>> c9534c3a510cfd0fdda3bbc879d3dcc95cadcceb

        if (! Hash::check($data['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password_hash' => Hash::make($data['new_password'])]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
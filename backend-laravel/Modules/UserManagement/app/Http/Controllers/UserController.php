<?php

namespace Modules\UserManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemRole;
use App\Models\SystemUser;
use App\Services\AuditLogger;
use App\Services\SecurityPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Modules\UserManagement\Http\Requests\StoreUserRequest;
use Modules\UserManagement\Http\Requests\UpdateUserRequest;
use Modules\UserManagement\Http\Resources\LoginActivityResource;
use Modules\UserManagement\Http\Resources\UserManagementResource;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sort' => ['nullable', 'in:system_user_id,full_name,role,department_name,last_login_at,last_login_ip,status'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);

        $query = SystemUser::query()->with(['role', 'permissions']);

        if ($request->filled('q')) {
            $search = $request->string('q');

            $query->where(function ($q) use ($search) {
                $q->where('system_users.username', 'like', "%{$search}%")
                    ->orWhere('system_users.email', 'like', "%{$search}%")
                    ->orWhere('system_users.full_name', 'like', "%{$search}%")
                    ->orWhere('system_users.department_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('system_users.role_id', $request->integer('role_id'));
        }

        if ($request->filled('status')) {
            $query->where('system_users.status', $request->string('status'));
        }

        $sort = $data['sort'] ?? 'system_user_id';
        $direction = $data['direction'] ?? 'asc';

        if ($sort === 'role') {
            $query->leftJoin('system_roles', 'system_roles.role_id', '=', 'system_users.role_id')
                ->select('system_users.*')
                ->orderBy('system_roles.role_name', $direction);
        } else {
            $query->orderBy("system_users.{$sort}", $direction);
        }

        $users = $query->paginate($this->perPage($request));

        return response()->json([
            'data' => UserManagementResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'stats' => [
                'total' => SystemUser::count(),
                'active' => SystemUser::where('status', 'Active')->count(),
                'suspended' => SystemUser::where('status', 'Suspended')->count(),
                'admins' => SystemUser::whereHas('role', fn ($q) => $q->where('role_name', '!=', 'Employee'))->count(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['status'] ??= 'Active';

        $targetRole = SystemRole::find($validated['role_id']);

        if ($targetRole && $targetRole->is_super_admin && ! $request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Only a Super Admin can create a Super Admin account.'], 403);
        }

        $user = SystemUser::create([
            ...$validated,
            'password_hash' => Hash::make($validated['password']),
            'last_login_at' => null,
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'data' => new UserManagementResource($user->load('role', 'permissions')),
        ], 201);
    }

    public function show(SystemUser $user): JsonResponse
    {
        return response()->json([
            'data' => new UserManagementResource($user->load('role', 'permissions')),
        ]);
    }

    public function update(UpdateUserRequest $request, SystemUser $user): JsonResponse
    {
        $validated = $request->validated();
        $actor = $request->user();

        $targetRole = SystemRole::find($validated['role_id']);

        if ($targetRole && $targetRole->is_super_admin && ! $actor->isSuperAdmin()) {
            return response()->json(['message' => 'Only a Super Admin can assign the Super Admin role.'], 403);
        }

        if ($user->isSuperAdmin() && ! $actor->isSuperAdmin()) {
            return response()->json(['message' => 'Only a Super Admin can modify a Super Admin account.'], 403);
        }

        if ($user->system_user_id === $actor->system_user_id
            && (int) $validated['role_id'] !== $actor->role_id) {
            return response()->json(['message' => 'You cannot change your own role.'], 403);
        }

        if ($user->isSuperAdmin()
            && $user->status === 'Active'
            && (! $targetRole?->is_super_admin || $validated['status'] !== 'Active')) {
            $otherSuperAdmins = SystemUser::whereHas('role', fn ($q) => $q->where('is_super_admin', true))
                ->where('status', 'Active')
                ->where('system_user_id', '!=', $user->system_user_id)
                ->count();

            if ($otherSuperAdmins === 0) {
                return response()->json(['message' => 'Cannot deactivate or demote the last active Super Admin.'], 422);
            }
        }

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password_hash'] = Hash::make($validated['password']);
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => new UserManagementResource($user->load('role', 'permissions')),
        ]);
    }

    public function destroy(Request $request, SystemUser $user): JsonResponse
    {
        if ($user->system_user_id === $request->user()->system_user_id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $targetRole = $user->role_id ? SystemRole::find($user->role_id) : null;

        if ($user->isSuperAdmin() && ! $request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Only a Super Admin can delete a Super Admin account.'], 403);
        }

        if ($targetRole && $targetRole->is_super_admin && $user->status === 'Active') {
            $otherSuperAdmins = SystemUser::whereHas('role', fn ($q) => $q->where('is_super_admin', true))
                ->where('status', 'Active')
                ->where('system_user_id', '!=', $user->system_user_id)
                ->count();

            if ($otherSuperAdmins === 0) {
                return response()->json(['message' => 'Cannot delete the last active Super Admin.'], 422);
            }
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function resetPassword(Request $request, SystemUser $user): JsonResponse
    {
        $request->validate([
            'password' => SecurityPolicy::passwordRules(),
        ]);

        if ($user->isSuperAdmin() && ! $request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Only a Super Admin can reset a Super Admin password.'], 403);
        }

        $user->forceFill([
            'password_hash' => Hash::make($request->string('password')->value()),
            'failed_attempts' => 0,
            'locked_until' => null,
        ])->save();

        $user->tokens()->delete();

        AuditLogger::log(
            action: 'Password reset by administrator',
            module: 'User Management',
            targetType: 'SystemUser',
            targetId: $user->system_user_id,
            details: "Password reset for {$user->username}.",
        );

        return response()->json(['message' => 'Password reset successfully.']);
    }

    public function loginActivity(SystemUser $user): JsonResponse
    {
        $activities = $user->loginActivity()
            ->orderByDesc('login_at')
            ->paginate($this->perPage(request()));

        return response()->json([
            'data' => LoginActivityResource::collection($activities),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }

    private function perPage(Request $request): int
    {
        return min(max($request->integer('per_page', 25), 1), 100);
    }
}
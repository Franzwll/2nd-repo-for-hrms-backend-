<?php

namespace Modules\UserManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemRole;
use App\Models\SystemUser;
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
        $query = SystemUser::query()->with(['role', 'permissions']);

        if ($request->filled('q')) {
            $search = $request->string('q');

            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('department_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->integer('role_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $users = $query->orderBy('system_user_id')->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => UserManagementResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

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

        $targetRole = SystemRole::find($validated['role_id']);

        if ($targetRole && $targetRole->is_super_admin && ! $request->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Only a Super Admin can assign the Super Admin role.'], 403);
        }

        if ($user->system_user_id === $request->user()->system_user_id
            && (int) $validated['role_id'] !== $request->user()->role_id) {
            return response()->json(['message' => 'You cannot change your own role.'], 403);
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

        if ($targetRole && $targetRole->is_super_admin && $user->status === 'Active') {
            $otherSuperAdmins = SystemUser::whereHas('role', fn ($q) => $q->where('is_super_admin', true))
                ->where('status', 'Active')
                ->where('system_user_id', '!=', $user->system_user_id)
                ->count();

            if ($otherSuperAdmins === 0) {
                return response()->json(['message' => 'Cannot delete the last active Super Admin.'], 422);
            }
        }

        $username = $user->username;
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
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
        return $request->integer('per_page', 25);
    }
}
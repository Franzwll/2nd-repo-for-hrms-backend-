<?php

namespace Modules\UserManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\RolePermission;
use App\Models\SystemRole;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\UserManagement\Http\Requests\StoreRoleRequest;
use Modules\UserManagement\Http\Requests\UpdateRolePermissionsRequest;
use Modules\UserManagement\Http\Requests\UpdateRoleRequest;
use Modules\UserManagement\Http\Resources\RoleResource;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $roles = SystemRole::query()
            ->with('permissions')
            ->withCount('users')
            ->orderBy('role_id')
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => RoleResource::collection($roles),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'last_page' => $roles->lastPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
            ],
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = SystemRole::create($request->validated());

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => new RoleResource($role->load('permissions')),
        ], 201);
    }

    public function show(SystemRole $role): JsonResponse
    {
        $role->load('permissions');
        $role->loadCount('users');

        return response()->json([
            'data' => new RoleResource($role),
        ]);
    }

    public function update(UpdateRoleRequest $request, SystemRole $role): JsonResponse
    {
        $role->update($request->validated());

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => new RoleResource($role->load('permissions')),
        ]);
    }

    public function destroy(SystemRole $role): JsonResponse
    {
        if ($role->users()->exists()) {
            return response()->json(['message' => 'Cannot delete a role that has users assigned.'], 422);
        }

        $name = $role->role_name;
        $role->permissions()->delete();
        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    public function permissions(SystemRole $role): JsonResponse
    {
        $modules = RolePermission::query()
            ->select('module_name')
            ->distinct()
            ->orderBy('module_name')
            ->pluck('module_name');

        $current = $role->permissions->mapWithKeys(fn ($p) => [$p->module_name => $p->permission_level]);

        return response()->json([
            'data' => $modules->map(fn ($module) => [
                'module_name' => $module,
                'permission_level' => $current[$module] ?? 'None',
            ]),
        ]);
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, SystemRole $role): JsonResponse
    {
        $isSuperAdmin = $request->user()->isSuperAdmin();

        // System roles (e.g. Super Admin) have a protected permission matrix so
        // they cannot be accidentally locked out, even by a Super Admin.
        if ($role->is_protected) {
            return response()->json([
                'message' => "The {$role->role_name} role is a system role and its permissions are protected.",
            ], 403);
        }

        // Non-super-admins cannot modify their own role's permissions
        if (! $isSuperAdmin && $role->role_id === $request->user()->role_id) {
            return response()->json(['message' => 'You cannot change the permissions of your own role.'], 403);
        }

        $permissions = $request->input('permissions');

        DB::transaction(function () use ($role, $permissions) {
            $role->permissions()->delete();

            foreach ($permissions as $permission) {
                if ($permission['permission_level'] === 'None') {
                    continue;
                }

                RolePermission::create([
                    'role_id' => $role->role_id,
                    'module_name' => $permission['module_name'],
                    'permission_level' => $permission['permission_level'],
                ]);
            }
        });

        AuditLogger::log(
            'Role permissions updated',
            'User Management',
            'Info',
            'role',
            $role->role_name,
            'Updated permission matrix for ' . $role->role_name,
        );

        return response()->json([
            'message' => 'Role permissions updated successfully.',
            'data' => new RoleResource($role->load('permissions')),
        ]);
    }
}
<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Modules\CoreHCM\Http\Controllers\Concerns\AppliesTableQuery;
use Modules\CoreHCM\Http\Controllers\Concerns\HcmCache;
use Modules\CoreHCM\Http\Requests\StoreDepartmentRequest;
use Modules\CoreHCM\Http\Requests\UpdateDepartmentRequest;
use Modules\CoreHCM\Http\Resources\DepartmentResource;

class DepartmentController extends Controller
{
    use AppliesTableQuery;

    public function index(Request $request): JsonResponse
    {
        $payload = $this->rememberHcmIndex($request, 'hcm:departments', function () use ($request) {
            $query = Department::query()
                ->withCount(['employees', 'positions'])
                ->with('head');

            if ($request->filled('q')) {
                $search = $request->string('q');

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $this->applyFilters($request, $query, [
                'code' => 'code',
                'name' => 'name',
            ]);

            $this->applySort($request, $query, [
                'code' => 'code',
                'name' => 'name',
                'created_at' => 'created_at',
            ], ['name', 'asc']);

            $departments = $query->paginate($request->integer('per_page', 25));

            // Resolve resources to plain arrays — AnonymousResourceCollection
            // holds the request and can't be serialized into the cache store.
            $resolved = DepartmentResource::collection($departments)->resolve();

            return [
                'data' => $resolved,
                'meta' => [
                    'current_page' => $departments->currentPage(),
                    'last_page' => $departments->lastPage(),
                    'per_page' => $departments->perPage(),
                    'total' => $departments->total(),
                ],
            ];
        });

        return response()->json($payload);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());
        HcmCache::flush();

        return response()->json([
            'message' => 'Department created successfully.',
            'data' => new DepartmentResource($department),
        ], 201);
    }

    public function show(Department $department): JsonResponse
    {
        $department->load(['head', 'positions']);
        $department->loadCount(['employees', 'positions']);

        return response()->json([
            'data' => new DepartmentResource($department),
        ]);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $department->update($request->validated());
        HcmCache::flush();

        return response()->json([
            'message' => 'Department updated successfully.',
            'data' => new DepartmentResource($department),
        ]);
    }

    public function destroy(Department $department): JsonResponse
    {
        if ($department->employees()->exists()) {
            return response()->json(['message' => 'Cannot delete a department with assigned employees.'], 422);
        }

        $name = $department->name;
        $department->positions()->delete();
        $department->delete();
        HcmCache::flush();

        return response()->json(['message' => 'Department deleted successfully.']);
    }
}
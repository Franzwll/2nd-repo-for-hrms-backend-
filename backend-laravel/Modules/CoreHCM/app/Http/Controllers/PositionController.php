<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Position;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Modules\CoreHCM\Http\Requests\StorePositionRequest;
use Modules\CoreHCM\Http\Requests\UpdatePositionRequest;
use Modules\CoreHCM\Http\Resources\PositionResource;

class PositionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Position::query()->with(['department', 'salaryGrade']);

        if ($request->filled('q')) {
            $search = $request->string('q');

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('position_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        $positions = $query->orderBy('title')->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => PositionResource::collection($positions),
            'meta' => [
                'current_page' => $positions->currentPage(),
                'last_page' => $positions->lastPage(),
                'per_page' => $positions->perPage(),
                'total' => $positions->total(),
            ],
        ]);
    }

    public function store(StorePositionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $position = Position::create([
            ...$validated,
            'position_code' => $validated['position_code'] ?? $this->nextCode(),
            'level' => $validated['level'] ?? 'Rank & File',
            'filled_count' => 0,
        ]);

        AuditLogger::log(
            'Position created',
            'Core HCM',
            'Info',
            'position',
            $position->title,
            'Created position ' . $position->position_code,
        );

        return response()->json([
            'message' => 'Position created successfully.',
            'data' => new PositionResource($position->load('department', 'salaryGrade')),
        ], 201);
    }

    public function update(UpdatePositionRequest $request, Position $position): JsonResponse
    {
        $position->update($request->validated());

        AuditLogger::log(
            'Position updated',
            'Core HCM',
            'Info',
            'position',
            $position->title,
            'Updated position ' . $position->position_code,
        );

        return response()->json([
            'message' => 'Position updated successfully.',
            'data' => new PositionResource($position->load('department', 'salaryGrade')),
        ]);
    }

    public function destroy(Position $position): JsonResponse
    {
        if ($position->employees()->exists()) {
            return response()->json(['message' => 'Cannot delete a position with assigned employees.'], 422);
        }

        $title = $position->title;
        $position->delete();

        AuditLogger::log(
            'Position deleted',
            'Core HCM',
            'Warning',
            'position',
            $title,
            'Deleted position ' . $title,
        );

        return response()->json(['message' => 'Position deleted successfully.']);
    }

    private function nextCode(): string
    {
        return DB::transaction(function () {
            DB::selectOne('SELECT GET_LOCK(?, 5)', ['position_code_gen']);
            try {
                $count = Position::count() + 1;

                return 'POS-' . str_pad((string) $count, 3, '0', STR_PAD_LEFT);
            } finally {
                DB::selectOne('SELECT RELEASE_LOCK(?)', ['position_code_gen']);
            }
        });
    }
}
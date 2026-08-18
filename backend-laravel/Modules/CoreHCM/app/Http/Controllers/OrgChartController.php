<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Modules\CoreHCM\Http\Resources\OrgChartResource;

class OrgChartController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::query()
            ->with([
                'head' => fn ($q) => $q->with('position'),
                'positions',
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => OrgChartResource::collection($departments),
        ]);
    }
}
<?php

namespace Modules\CoreHCM\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Modules\CoreHCM\Http\Controllers\Concerns\HcmCache;
use Modules\CoreHCM\Http\Resources\OrgChartResource;

class OrgChartController extends Controller
{
    public function index(): JsonResponse
    {
        // Org chart is the heaviest dept-pos query (departments + heads +
        // positions) and changes rarely — cache the resolved payload 60s.
        // HcmCache::flush() on any HCM write keeps it fresh.
        $data = Cache::remember('hcm:org-chart', 60, function () {
            $departments = Department::query()
                ->with([
                    'head' => fn ($q) => $q->with('position'),
                    'positions',
                ])
                ->orderBy('name')
                ->get();

            return OrgChartResource::collection($departments)->resolve();
        });

        return response()->json([
            'data' => $data,
        ]);
    }
}
<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ApplicantManagement\Http\Resources\FacilityResource;
use Modules\ApplicantManagement\Models\Facility;

class FacilityController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* GET /api/v1/facilities                                              */
    /* List interview facilities (optional ?type=On-site|Virtual filter)   */
    /* ------------------------------------------------------------------ */

    public function index(Request $request): JsonResponse
    {
        $query = Facility::query()->where('is_active', true)->orderBy('facility_id');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $facilities = $query->get();

        return response()->json([
            'data' => FacilityResource::collection($facilities),
            'meta' => [
                'current_page' => 1,
                'last_page'    => 1,
                'per_page'     => $facilities->count(),
                'total'        => $facilities->count(),
            ],
        ]);
    }
}

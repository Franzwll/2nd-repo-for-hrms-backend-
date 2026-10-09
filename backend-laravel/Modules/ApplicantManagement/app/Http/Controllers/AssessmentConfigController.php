<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\ApplicantManagement\Services\AssessmentConfig;

class AssessmentConfigController extends Controller
{
    /* GET /api/v1/assessments/config — global switches owned by Core HCM. */
    public function show(): JsonResponse
    {
        return response()->json(['data' => AssessmentConfig::all()]);
    }
}

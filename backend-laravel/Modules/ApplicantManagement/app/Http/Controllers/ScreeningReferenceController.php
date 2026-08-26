<?php

namespace Modules\ApplicantManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Modules\ApplicantManagement\Models\ScreeningReferenceData;

/**
 * DB-managed screening reference data (skills, job roles, certifications and
 * aliases). The grouped mapping is fed by ScreeningService to the NLP service
 * per request; the bundled seed JSON remains a fallback only.
 *
 * The CRUD endpoints let HR admins manage the reference vocabulary from the
 * Applicant Management UI without touching code or reseeding.
 */
class ScreeningReferenceController extends Controller
{
    public function index(): JsonResponse
    {
        $data = $this->groupedMapping();

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'source' => 'database',
                'fallback' => 'nlp-service/app/data/*.json (used when the table is empty or the API is unreachable)',
                'types' => ['skill', 'job_role', 'certification'],
                'counts' => array_map('count', $data),
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* GET /api/v1/screening/reference-data/list                           */
    /* Flat admin listing with optional type filter and search.             */
    /* ------------------------------------------------------------------ */

    public function list(Request $request): JsonResponse
    {
        $query = ScreeningReferenceData::query()->orderBy('data_type')->orderBy('canonical_value');

        if ($type = $request->query('data_type')) {
            if (! in_array($type, ScreeningReferenceData::TYPES, true)) {
                return response()->json([
                    'message' => 'Invalid data_type. Allowed: ' . implode(', ', ScreeningReferenceData::TYPES),
                ], 422);
            }
            $query->ofType($type);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('canonical_value', 'like', "%{$search}%")
                    ->orWhere('aliases_json', 'like', "%{$search}%");
            });
        }

        $rows = $query->get();

        return response()->json([
            'success' => true,
            'data' => $rows,
            'meta' => [
                'total' => $rows->count(),
                'counts_by_type' => [
                    'skill' => $rows->where('data_type', 'skill')->count(),
                    'job_role' => $rows->where('data_type', 'job_role')->count(),
                    'certification' => $rows->where('data_type', 'certification')->count(),
                ],
            ],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* POST /api/v1/screening/reference-data                               */
    /* ------------------------------------------------------------------ */

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'data_type' => ['required', 'in:' . implode(',', ScreeningReferenceData::TYPES)],
            'canonical_value' => [
                'required',
                'string',
                'max:255',
                Rule::unique('screening_reference_data', 'canonical_value')->where(
                    fn ($q) => $q->where('data_type', $request->input('data_type'))
                ),
            ],
            'aliases_json' => ['nullable', 'array'],
            'aliases_json.*' => ['string', 'max:255'],
            'active' => ['boolean'],
        ]);

        $row = ScreeningReferenceData::create([
            'data_type' => $validated['data_type'],
            'canonical_value' => trim($validated['canonical_value']),
            'aliases_json' => $this->normalizeAliases($validated['aliases_json'] ?? []),
            'active' => $validated['active'] ?? true,
        ]);

        self::flushCache();

        AuditLogger::log(
            action: 'Reference Data Added',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Screening Reference Data',
            targetId: (string) $row->ref_id,
            details: "Added {$row->data_type} '{$row->canonical_value}'"
                . ($row->aliases_json ? ' (aliases: ' . implode(', ', $row->aliases_json) . ')' : '')
                . ' to the spaCy screening vocabulary.'
        );

        return response()->json(['success' => true, 'data' => $row, 'message' => 'Reference data created.'], 201);
    }

    /* ------------------------------------------------------------------ */
    /* PUT /api/v1/screening/reference-data/{id}                           */
    /* ------------------------------------------------------------------ */

    public function update(Request $request, int $id): JsonResponse
    {
        $row = ScreeningReferenceData::findOrFail($id);

        $validated = $request->validate([
            'data_type' => ['required', 'in:' . implode(',', ScreeningReferenceData::TYPES)],
            'canonical_value' => [
                'required',
                'string',
                'max:255',
                Rule::unique('screening_reference_data', 'canonical_value')
                    ->where(
                        fn ($q) => $q->where('data_type', $request->input('data_type'))
                    )
                    ->ignore($row->ref_id, 'ref_id'),
            ],
            'aliases_json' => ['nullable', 'array'],
            'aliases_json.*' => ['string', 'max:255'],
            'active' => ['boolean'],
        ]);

        $original = "{$row->data_type}:{$row->canonical_value}";

        $row->update([
            'data_type' => $validated['data_type'],
            'canonical_value' => trim($validated['canonical_value']),
            'aliases_json' => $this->normalizeAliases($validated['aliases_json'] ?? []),
            'active' => array_key_exists('active', $validated) ? (bool) $validated['active'] : $row->active,
        ]);

        self::flushCache();

        AuditLogger::log(
            action: 'Reference Data Updated',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Screening Reference Data',
            targetId: (string) $row->ref_id,
            details: "Updated screening reference '{$original}' -> '{$row->data_type}:{$row->canonical_value}'."
        );

        return response()->json(['success' => true, 'data' => $row, 'message' => 'Reference data updated.']);
    }

    /* ------------------------------------------------------------------ */
    /* DELETE /api/v1/screening/reference-data/{id}                        */
    /* ------------------------------------------------------------------ */

    public function destroy(int $id): JsonResponse
    {
        $row = ScreeningReferenceData::findOrFail($id);
        $details = "{$row->data_type}:{$row->canonical_value}";

        $row->delete();
        self::flushCache();

        AuditLogger::log(
            action: 'Reference Data Deleted',
            module: 'Applicant Management',
            severity: 'Warning',
            targetType: 'Screening Reference Data',
            targetId: (string) $id,
            details: "Deleted screening reference '{$details}'."
        );

        return response()->json(['success' => true, 'message' => "Deleted '{$details}'."]);
    }

    /* ------------------------------------------------------------------ */
    /* PATCH /api/v1/screening/reference-data/{id}/toggle                  */
    /* Inactive rows stay in the table but are excluded from the NLP       */
    /* mapping payload.                                                    */
    /* ------------------------------------------------------------------ */

    public function toggle(int $id): JsonResponse
    {
        $row = ScreeningReferenceData::findOrFail($id);

        $row->update(['active' => ! $row->active]);
        self::flushCache();

        AuditLogger::log(
            action: $row->active ? 'Reference Data Activated' : 'Reference Data Deactivated',
            module: 'Applicant Management',
            severity: 'Info',
            targetType: 'Screening Reference Data',
            targetId: (string) $row->ref_id,
            details: ($row->active ? 'Activated' : 'Deactivated') . " {$row->data_type} '{$row->canonical_value}'."
        );

        return response()->json(['success' => true, 'data' => $row]);
    }

    /** Grouped {skills, job_roles, certifications} mappings with short caching. */
    public static function groupedMapping(): array
    {
        return Cache::remember('screening_reference_data', 300, function () {
            return [
                'skills' => ScreeningReferenceData::mappingFor(ScreeningReferenceData::TYPE_SKILL),
                'job_roles' => ScreeningReferenceData::mappingFor(ScreeningReferenceData::TYPE_JOB_ROLE),
                'certifications' => ScreeningReferenceData::mappingFor(ScreeningReferenceData::TYPE_CERTIFICATION),
            ];
        });
    }

    /** Clears the cached mapping after reference-data changes. */
    public static function flushCache(): void
    {
        Cache::forget('screening_reference_data');
    }

    /** Trim, de-dupe and drop empty alias entries. */
    private function normalizeAliases(array $aliases): array
    {
        return array_values(array_unique(array_filter(
            array_map(fn ($a) => trim((string) $a), $aliases),
            fn ($a) => $a !== ''
        )));
    }
}

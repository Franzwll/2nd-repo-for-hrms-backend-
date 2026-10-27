<?php

namespace Modules\ApplicantManagement\Services;

use App\Models\Position as CorePosition;
use Modules\RecruitmentManagement\Models\JobPost;

/**
 * Single source of truth for "does this position require a practical exam?".
 *
 * Core HCM OWNS this flag: positions.requires_practical (toggled in the
 * Department & Position module) is authoritative — every applicant for a
 * flagged position (e.g. Front Desk) must undergo the practical exam. The
 * legacy per-job-post column (job_posts.requires_practical, formerly toggled
 * in Recruitment Management) is kept only as a read-only fallback for old
 * rows. The designated positions below are the last resort for posts whose
 * position carries no flag — it mirrors `PRACTICAL_POSITIONS` in
 * `frontend/src/data/applicants.ts`, so the UI and this API gate always agree
 * about whether the practical stage applies.
 */
class PracticalRequirement
{
    /** Positions designated for a hands-on practical assessment. */
    public const POSITIONS = [
        'Line Cook',
        'Bartender',
        'Front Desk Receptionist',
        'Restaurant Server',
    ];

    /** True when the position title is one of the designated positions. */
    public static function forPosition(?string $position): bool
    {
        $position = trim((string) $position);

        if ($position === '') {
            return false;
        }

        return in_array($position, self::POSITIONS, true);
    }

    /**
     * True when the practical assessment applies to this applicant's post:
     * the global Core HCM switch must be ON, then the Core HCM position flag
     * wins, otherwise the legacy job-post flag, otherwise the designated list.
     * Every applicant for a flagged position must undergo the practical exam.
     */
    public static function required(?JobPost $jobPost, ?string $position = null, ?CorePosition $corePosition = null): bool
    {
        if (! AssessmentConfig::practicalTestEnabled()) {
            return false;
        }

        // 1. Core HCM Position flag (Department & Position module) — OWNER.
        $pos = $corePosition ?? ($jobPost ? $jobPost->position : null);
        if (! $pos && $jobPost && $jobPost->position_id) {
            $pos = CorePosition::find($jobPost->position_id);
        }
        if (! $pos && $position) {
            $pos = CorePosition::where('title', trim($position))->first();
        }

        if ($pos !== null && $pos->requires_practical !== null) {
            return (bool) $pos->requires_practical;
        }

        // 2. Legacy job post flag (Recruitment Management toggle, removed).
        //    Read-only fallback for old rows — new posts never write it.
        if ($jobPost && $jobPost->requires_practical !== null) {
            return (bool) $jobPost->requires_practical;
        }

        return self::forPosition($position ?? $jobPost?->title ?? $pos?->title);
    }
}

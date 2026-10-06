<?php

namespace Modules\ApplicantManagement\Services;

use Modules\RecruitmentManagement\Models\JobPost;

/**
 * Single source of truth for "does this position require a practical exam?".
 *
 * The per-job-post flag (`job_posts.requires_practical`, toggleable from
 * Recruitment Management) is authoritative whenever it is set. The designated
 * positions below keep the behaviour for job posts that were never configured —
 * it mirrors `PRACTICAL_POSITIONS` in
 * `frontend/src/data/applicants.ts`, so the UI and this API gate always agree
 * about whether the practical stage applies. (A mismatch here is what made the
 * practical dialog open for positions the API then refused to save.)
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
     * the explicit job-post flag wins, otherwise the position is checked
     * against the designated list.
     */
    public static function required(?JobPost $jobPost, ?string $position = null): bool
    {
        if ($jobPost && (bool) $jobPost->requires_practical) {
            return true;
        }

        return self::forPosition($position ?? $jobPost?->title);
    }
}

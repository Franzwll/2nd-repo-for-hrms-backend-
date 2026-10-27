<?php

namespace Modules\ApplicantManagement\Services;

use App\Models\Position as CorePosition;
use Modules\RecruitmentManagement\Models\JobPost;

/**
 * Single source of truth for "does this position require an assessment test?".
 *
 * Core HCM OWNS this flag: positions.requires_assessment (toggled in the
 * Department & Position module) is authoritative. The legacy per-job-post
 * column (job_posts.requires_assessment, formerly toggled in Recruitment
 * Management) is kept only as a read-only fallback for old rows — new posts
 * never write it. The designated-positions list is the last resort for posts
 * whose position carries no flag.
 *
 * Priority: global Core HCM switch > position.requires_assessment
 *           > job_post.requires_assessment (legacy) > designated positions list
 */
class AssessmentRequirement
{
    /** Positions designated for an assessment test (fallback when no explicit flags). */
    public const POSITIONS = [
        'Front Desk Receptionist',
        'Guest Relations Officer',
        'HR Assistant',
        'HR Officer',
        'Accounting Assistant',
        'Accounting Supervisor',
        'Finance Officer',
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
     * True when the assessment test applies to this applicant's post:
     * global Core HCM switch > position.requires_assessment (Core HCM owner)
     * > job_post.requires_assessment (legacy) > designated positions list.
     * Every applicant for a flagged position (e.g. Front Desk) must undergo
     * the assessment test — no per-post opt-out.
     */
    public static function required(?JobPost $jobPost, ?string $position = null, ?CorePosition $corePosition = null): bool
    {
        if (! \Modules\ApplicantManagement\Services\AssessmentConfig::assessmentTestEnabled()) {
            return false;
        }

        // 1. Core HCM Position flag (Department & Position module) — OWNER.
        //    Every applicant for this position must undergo the assessment test.
        $pos = $corePosition ?? ($jobPost ? $jobPost->position : null);
        if (! $pos && $jobPost && $jobPost->position_id) {
            $pos = CorePosition::find($jobPost->position_id);
        }
        if (! $pos && $position) {
            $pos = CorePosition::where('title', trim($position))->first();
        }

        if ($pos !== null && $pos->requires_assessment !== null) {
            return (bool) $pos->requires_assessment;
        }

        // 2. Legacy job post flag (Recruitment Management toggle, removed).
        //    Read-only fallback for old rows — new posts never write it.
        if ($jobPost && $jobPost->requires_assessment !== null) {
            return (bool) $jobPost->requires_assessment;
        }

        // 3. Fallback: designated positions list
        return self::forPosition($position ?? $jobPost?->title ?? $pos?->title);
    }
}
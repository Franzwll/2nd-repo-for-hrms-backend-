<?php

namespace Modules\ApplicantManagement\Services;

use App\Models\Position as CorePosition;
use Modules\RecruitmentManagement\Models\JobPost;

/**
 * Single source of truth for "does this position require an assessment test?".
 *
 * Priority: global Core HCM switch > job_post.requires_assessment > position.requires_assessment > designated positions list
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
     * global Core HCM switch > job_post.requires_assessment > position.requires_assessment > designated positions list
     */
    public static function required(?JobPost $jobPost, ?string $position = null, ?CorePosition $corePosition = null): bool
    {
        if (! \Modules\ApplicantManagement\Services\AssessmentConfig::assessmentTestEnabled()) {
            return false;
        }

        // 1. Explicit job post flag (Recruitment Management)
        if ($jobPost && (bool) $jobPost->requires_assessment) {
            return true;
        }

        // 2. Core HCM Position flag (Department & Position module)
        $pos = $corePosition ?? ($jobPost ? $jobPost->position : null);
        if ($pos && (bool) $pos->requires_assessment) {
            return true;
        }

        // 3. Fallback: designated positions list
        return self::forPosition($position ?? $jobPost?->title ?? $pos?->title);
    }
}
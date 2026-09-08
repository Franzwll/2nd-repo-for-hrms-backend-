<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Central duplicate-application guard.
 *
 * Rule: block only when the SAME email already has an ACTIVE application
 * for the SAME job_post_id. Active = stage not in terminal states.
 * Same resume file applied to a DIFFERENT job is always allowed.
 * Filename is never used (same "resume.pdf" name across candidates
 * caused false-positive duplication warnings).
 */
class DuplicateApplicationService
{
    /** Stages that free the email+job slot for re-application. */
    public const TERMINAL_STAGES = ['Hired', 'Rejected'];

    /** Re-apply allowed after this many days even if still active. */
    public const REAPPLY_DAYS = 180;

    public static function hashFile(UploadedFile $file): ?string
    {
        try {
            $realPath = $file->getRealPath();
            if (! $realPath || ! is_file($realPath)) {
                return null;
            }

            return hash_file('sha256', $realPath) ?: null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return array|null existing applicant row (applicant_id, applicant_code, applied_at) or null
     */
    public static function findDuplicate(string $email, int $jobPostId): ?object
    {
        $email = mb_strtolower(trim($email));

        $cutoff = now()->subDays(static::REAPPLY_DAYS);

        return DB::table('applicants')
            ->select('applicant_id', 'applicant_code', 'applied_at', 'stage')
            ->where('job_post_id', $jobPostId)
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNotIn('stage', static::TERMINAL_STAGES)
            ->where('applied_at', '>=', $cutoff)
            ->orderByDesc('applied_at')
            ->first();
    }

    public static function duplicateResponse(object $existing, string $jobTitle = ''): array
    {
        return [
            'code' => 'DUPLICATE_APPLICATION',
            'message' => 'You have already applied for this position. Please check your existing application instead of submitting again.',
            'existing_applicant_code' => $existing->applicant_code ?? null,
            'applied_at' => $existing->applied_at ?? null,
            'job_title' => $jobTitle,
        ];
    }
}

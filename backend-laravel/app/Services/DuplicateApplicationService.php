<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Modules\Settings\Models\SystemSetting;

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

    /** System-setting key holding the failed-applicant cooldown (days). */
    public const COOLDOWN_SETTING_KEY = 'recruitment.reapply_cooldown_days';

    /** Default waiting period after a failed verdict (days). */
    public const COOLDOWN_DEFAULT_DAYS = 30;

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
    public static function findDuplicate(string $email, int $jobPostId, ?int $excludeApplicantId = null): ?object
    {
        $email = mb_strtolower(trim($email));

        $cutoff = now()->subDays(static::REAPPLY_DAYS);

        $query = DB::table('applicants')
            ->select('applicant_id', 'applicant_code', 'applied_at', 'stage')
            ->where('job_post_id', $jobPostId)
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNotIn('stage', static::TERMINAL_STAGES)
            ->where('applied_at', '>=', $cutoff);

        if ($excludeApplicantId) {
            $query->where('applicant_id', '!=', $excludeApplicantId);
        }

        return $query->orderByDesc('applied_at')->first();
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

    /**
     * Configured waiting period after a failed verdict (days).
     * HR edits it in Applicant Management → gear → Re-apply cooldown.
     */
    public static function cooldownDays(): int
    {
        try {
            $raw = SystemSetting::where('setting_key', static::COOLDOWN_SETTING_KEY)->value('setting_value');
            if (is_array($raw)) {
                $raw = $raw['days'] ?? $raw['value'] ?? null;
            }
            $days = (int) $raw;
            if ($days > 0 && $days <= 365) {
                return $days;
            }
        } catch (\Throwable) {
            // settings table unavailable — fall back to the default
        }

        return static::COOLDOWN_DEFAULT_DAYS;
    }

    /**
     * Finds an active re-apply cooldown for this email across ANY job.
     *
     * Skips: decliners (offer_status = Declined — welcome back anytime),
     * HR overrides (cooldown_lifted_at set), non-Rejected stages, and expired
     * windows. Returns the most recent blocking row with computed dates.
     *
     * @return array{applicant_code:string,applied_at:mixed,rejected_at:mixed,eligible_after:string,days_left:int,job_post_id:int}|null
     */
    public static function findCooldown(string $email): ?array
    {
        $email = mb_strtolower(trim($email));
        if ($email === '') {
            return null;
        }

        $days = static::cooldownDays();

        $row = DB::table('applicants')
            ->select('applicant_id', 'applicant_code', 'job_post_id', 'applied_at', 'rejected_at', 'offer_status', 'cooldown_lifted_at', 'updated_at')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->where('stage', 'Rejected')
            ->where(function ($q) {
                $q->whereNull('offer_status')->orWhere('offer_status', '!=', 'Declined');
            })
            ->whereNull('cooldown_lifted_at')
            ->whereNotNull('rejected_at')
            ->orderByDesc('rejected_at')
            ->first();

        if (! $row) {
            return null;
        }

        try {
            $rejectedAt = \Carbon\Carbon::parse($row->rejected_at);
        } catch (\Throwable) {
            return null;
        }

        $eligibleAfter = (clone $rejectedAt)->addDays($days)->startOfDay();
        $daysLeft = (int) ceil(now()->diffInSeconds($eligibleAfter, false) / 86400);

        if ($daysLeft <= 0) {
            return null;
        }

        return [
            'applicant_code' => $row->applicant_code,
            'applied_at' => $row->applied_at,
            'rejected_at' => $row->rejected_at,
            'eligible_after' => $eligibleAfter->toDateString(),
            'eligible_after_label' => $eligibleAfter->format('M j, Y'),
            'applied_label' => $rejectedAt->format('M j, Y'),
            'days_left' => $daysLeft,
            'cooldown_days' => $days,
            'is_eligible' => false,
            'job_post_id' => (int) $row->job_post_id,
        ];
    }

    /**
     * 409 payload for a blocked re-application — uses the exact
     * applicant-facing wording agreed with HR.
     */
    public static function cooldownResponse(array $cooldown): array
    {
        return [
            'code' => 'REAPPLY_COOLDOWN',
            'message' => "Please wait before re-applying — You applied on {$cooldown['applied_label']}. "
                . "You may re-apply for any open position after {$cooldown['eligible_after_label']} — {$cooldown['days_left']} day(s) left.",
            'existing_applicant_code' => $cooldown['applicant_code'] ?? null,
            'applied_at' => $cooldown['applied_at'] ?? null,
            'rejected_at' => $cooldown['rejected_at'] ?? null,
            'eligible_after' => $cooldown['eligible_after'] ?? null,
            'days_left' => $cooldown['days_left'] ?? null,
        ];
    }

    /**
     * 403 payload for an applicant restricted by HR from applying.
     */
    public static function blockResponse(array $blockInfo): array
    {
        return [
            'code' => 'APPLICANT_BLOCKED',
            'message' => "Application restricted: " . ($blockInfo['reason'] ?? 'Applicant is restricted from recruitment activities.'),
            'existing_applicant_code' => $blockInfo['applicant_code'] ?? null,
            'scope' => $blockInfo['scope'] ?? 'all_jobs',
        ];
    }
}

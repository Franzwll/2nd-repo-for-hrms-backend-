<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Modules\ApplicantManagement\Models\Applicant;

class ApplicantRecognitionService
{
    /**
     * Normalize string for comparison (trim, lowercase, normalize spaces).
     */
    public static function normalizeString(?string $str): string
    {
        if ($str === null) {
            return '';
        }

        $cleaned = mb_strtolower(trim($str));
        return preg_replace('/\s+/', ' ', $cleaned);
    }

    /**
     * Normalize phone digits only (e.g., "+63 912 345 6789" -> "639123456789" or last 10 digits).
     */
    public static function normalizePhone(?string $phone): string
    {
        if ($phone === null) {
            return '';
        }

        return preg_replace('/\D+/', '', $phone);
    }

    /**
     * Normalize name by stripping special characters and extra whitespace.
     */
    public static function normalizeName(?string $name): string
    {
        if ($name === null) {
            return '';
        }

        $cleaned = mb_strtolower(trim($name));
        $cleaned = preg_replace('/[^a-z0-9\s]/u', '', $cleaned);
        return preg_replace('/\s+/', ' ', $cleaned);
    }

    /**
     * Find matching applicants using cross-field combinations:
     * 1. Email == Email
     * 2. Email == Email AND Name == Name
     * 3. Email == Email AND Phone == Phone
     * 4. Phone == Phone AND Name == Name
     * 5. Phone == Phone AND Address == Address
     * 6. Address == Address AND Name == Name
     * 7. Address == Address AND Email == Email
     *
     * @return Collection<int, array{
     *     applicant_id: int,
     *     applicant_code: string,
     *     job_post_id: int,
     *     name: string,
     *     email: string,
     *     phone: ?string,
     *     address: ?string,
     *     stage: string,
     *     status: string,
     *     offer_status: ?string,
     *     applied_at: mixed,
     *     rejected_at: mixed,
     *     cooldown_lifted_at: mixed,
     *     is_blocked: bool,
     *     blocked_reason: ?string,
     *     block_scope: ?string,
     *     block_expires_at: mixed,
     *     matched_rules: string[],
     *     confidence: string
     * }>
     */
    public static function findMatches(
        string $email,
        string $name,
        ?string $phone = null,
        ?string $address = null,
        ?int $excludeApplicantId = null
    ): Collection {
        $normEmail = static::normalizeString($email);
        $normName = static::normalizeName($name);
        $normPhone = static::normalizePhone($phone);
        $normAddress = static::normalizeString($address);

        $emailLocal = explode('@', $normEmail)[0] ?? '';
        $emailLocalAlpha = preg_replace('/[^a-z0-9]/', '', $emailLocal);
        $nameNoSpace = preg_replace('/[^a-z0-9]/', '', $normName);

        // Build base query
        $query = DB::table('applicants')
            ->select([
                'applicant_id',
                'applicant_code',
                'job_post_id',
                'name',
                'email',
                'phone',
                'address',
                'stage',
                'status',
                'offer_status',
                'applied_at',
                'rejected_at',
                'cooldown_lifted_at',
                'is_blocked',
                'blocked_reason',
                'block_scope',
                'block_expires_at',
            ]);

        if ($excludeApplicantId) {
            $query->where('applicant_id', '!=', $excludeApplicantId);
        }

        // Search condition: find any candidate row matching email OR phone OR name OR cross-match criteria
        $query->where(function ($q) use ($normEmail, $normPhone, $normName, $emailLocalAlpha, $nameNoSpace, $normAddress) {
            if ($normEmail !== '') {
                $q->orWhereRaw('LOWER(TRIM(email)) = ?', [$normEmail]);
            }

            if (strlen($normPhone) >= 7) {
                $digits = substr($normPhone, -7);
                $q->orWhere('phone', 'like', "%{$digits}%");
            }

            if ($normName !== '') {
                $q->orWhereRaw('LOWER(TRIM(name)) = ?', [$normName]);
            }

            if (strlen($emailLocalAlpha) >= 4) {
                $q->orWhereRaw("REPLACE(REPLACE(LOWER(name), ' ', ''), '.', '') = ?", [$emailLocalAlpha]);
                if (ctype_digit($emailLocalAlpha) && strlen($emailLocalAlpha) >= 7) {
                    $digits = substr($emailLocalAlpha, -7);
                    $q->orWhere('phone', 'like', "%{$digits}%");
                }
                if (strlen($emailLocalAlpha) >= 6) {
                    $q->orWhereRaw("REPLACE(REPLACE(LOWER(address), ' ', ''), ',', '') LIKE ?", ["%{$emailLocalAlpha}%"]);
                }
            }

            if (strlen($nameNoSpace) >= 4) {
                $q->orWhereRaw("SUBSTRING_INDEX(LOWER(email), '@', 1) = ?", [$nameNoSpace]);
            }

            if (strlen($normAddress) >= 6) {
                $q->orWhereRaw('LOWER(TRIM(address)) = ?', [$normAddress]);
            }
        });

        $candidates = $query->limit(50)->get();

        $results = collect();

        foreach ($candidates as $row) {
            $candEmail = static::normalizeString($row->email);
            $candName = static::normalizeName($row->name);
            $candPhone = static::normalizePhone($row->phone);
            $candAddress = static::normalizeString($row->address);

            $candEmailLocal = explode('@', $candEmail)[0] ?? '';
            $candEmailLocalAlpha = preg_replace('/[^a-z0-9]/', '', $candEmailLocal);
            $candNameNoSpace = preg_replace('/[^a-z0-9]/', '', $candName);

            $matchedRules = [];

            $emailMatch = ($normEmail !== '' && $candEmail === $normEmail);
            $nameMatch = ($normName !== '' && $candName === $normName);
            $phoneMatch = (strlen($normPhone) >= 7 && strlen($candPhone) >= 7 && (substr($normPhone, -7) === substr($candPhone, -7)));
            $addressMatch = ($normAddress !== '' && strlen($normAddress) >= 5 && $candAddress === $normAddress);

            // 1. Exact Email
            if ($emailMatch) {
                $matchedRules[] = 'exact_email';
                $matchedRules[] = 'email == email';
            }

            // Exact Phone
            if ($phoneMatch) {
                $matchedRules[] = 'exact_contact_number';
                $matchedRules[] = 'contact number == contact number';
            }

            // Exact Address
            if ($addressMatch) {
                $matchedRules[] = 'address == address';
            }

            // Exact Name
            if ($nameMatch) {
                $matchedRules[] = 'name == name';
            }

            // 2. email == name
            if (($emailMatch && $nameMatch)
                || (strlen($emailLocalAlpha) >= 4 && $emailLocalAlpha === $candNameNoSpace)
                || (strlen($candEmailLocalAlpha) >= 4 && $candEmailLocalAlpha === $nameNoSpace)
            ) {
                $matchedRules[] = 'email == name';
            }

            // 3. email == contact number
            if (($emailMatch && $phoneMatch)
                || (strlen($normPhone) >= 7 && str_contains($candEmailLocal, $normPhone))
                || (strlen($candPhone) >= 7 && str_contains($emailLocal, $candPhone))
            ) {
                $matchedRules[] = 'email == contact number';
            }

            // 4. contact number == name
            if (($phoneMatch && $nameMatch)
                || ($normPhone !== '' && $candNameNoSpace !== '' && str_contains($candNameNoSpace, $normPhone))
                || ($candPhone !== '' && $nameNoSpace !== '' && str_contains($nameNoSpace, $candPhone))
            ) {
                $matchedRules[] = 'contact number == name';
            }

            // 5. contact number == address
            if (($phoneMatch && $addressMatch)
                || (strlen($normPhone) >= 7 && $candAddress !== '' && str_contains($candAddress, $normPhone))
                || (strlen($candPhone) >= 7 && $normAddress !== '' && str_contains($normAddress, $candPhone))
            ) {
                $matchedRules[] = 'contact number == address';
            }

            // 6. address == name
            if (($addressMatch && $nameMatch)
                || ($normAddress !== '' && $candName !== '' && (str_contains($normAddress, $candName) || str_contains($candAddress, $normName)))
            ) {
                $matchedRules[] = 'address == name';
            }

            // 7. address == email address
            if (($addressMatch && $emailMatch)
                || ($normAddress !== '' && $candEmail !== '' && (str_contains($normAddress, $candEmailLocal) || str_contains($candAddress, $emailLocal)))
            ) {
                $matchedRules[] = 'address == email address';
            }

            if (! empty($matchedRules)) {
                $confidence = ($emailMatch || ($phoneMatch && $nameMatch)) ? 'High' : 'Medium';

                $results->push([
                    'applicant_id' => (int) $row->applicant_id,
                    'applicant_code' => $row->applicant_code,
                    'job_post_id' => (int) $row->job_post_id,
                    'name' => $row->name,
                    'email' => $row->email,
                    'phone' => $row->phone,
                    'address' => $row->address,
                    'stage' => $row->stage,
                    'status' => $row->status,
                    'offer_status' => $row->offer_status,
                    'applied_at' => $row->applied_at,
                    'rejected_at' => $row->rejected_at,
                    'cooldown_lifted_at' => $row->cooldown_lifted_at,
                    'is_blocked' => (bool) $row->is_blocked,
                    'blocked_reason' => $row->blocked_reason,
                    'block_scope' => $row->block_scope,
                    'block_expires_at' => $row->block_expires_at,
                    'matched_rules' => array_values(array_unique($matchedRules)),
                    'confidence' => $confidence,
                ]);
            }
        }

        return $results;
    }

    /**
     * Check if any recognized applicant is currently blocked from applying.
     *
     * @return array{is_blocked: bool, reason: ?string, scope: ?string, applicant_code: ?string}|null
     */
    public static function findBlock(
        string $email,
        string $name,
        ?string $phone = null,
        ?string $address = null,
        ?int $jobPostId = null,
        ?int $excludeApplicantId = null
    ): ?array {
        $matches = static::findMatches($email, $name, $phone, $address, $excludeApplicantId);

        foreach ($matches as $match) {
            if ($match['is_blocked']) {
                // Check if block has expired
                if (! empty($match['block_expires_at'])) {
                    $expires = Carbon::parse($match['block_expires_at']);
                    if ($expires->isPast()) {
                        continue;
                    }
                }

                // Check scope: 'all_jobs' or matches 'specific_job:{id}'
                $scope = $match['block_scope'] ?? 'all_jobs';
                if ($scope === 'all_jobs' || empty($scope)) {
                    return [
                        'is_blocked' => true,
                        'reason' => $match['blocked_reason'] ?? 'Applicant is restricted from recruitment activities.',
                        'scope' => 'all_jobs',
                        'applicant_code' => $match['applicant_code'],
                        'matched_rules' => $match['matched_rules'],
                    ];
                }

                if ($jobPostId && $scope === 'specific_job:' . $jobPostId) {
                    return [
                        'is_blocked' => true,
                        'reason' => $match['blocked_reason'] ?? 'Applicant is restricted from applying to this specific position.',
                        'scope' => $scope,
                        'applicant_code' => $match['applicant_code'],
                        'matched_rules' => $match['matched_rules'],
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Find active cooldown for recognized matches across ANY job.
     */
    public static function findCooldown(
        string $email,
        ?string $name = null,
        ?string $phone = null,
        ?string $address = null,
        ?int $excludeApplicantId = null
    ): ?array {
        $days = DuplicateApplicationService::cooldownDays();

        // 1. Direct email check via existing logic (fast path)
        $direct = DuplicateApplicationService::findCooldown($email);
        if ($direct) {
            return $direct;
        }

        // 2. If name provided, check recognized matches
        if ($name) {
            $matches = static::findMatches($email, $name, $phone, $address, $excludeApplicantId);

            foreach ($matches as $match) {
                if ($match['stage'] === 'Rejected'
                    && empty($match['cooldown_lifted_at'])
                    && ! empty($match['rejected_at'])
                    && ($match['offer_status'] === null || $match['offer_status'] !== 'Declined')
                ) {
                    try {
                        $rejectedAt = Carbon::parse($match['rejected_at']);
                    } catch (\Throwable) {
                        continue;
                    }

                    $eligibleAfter = (clone $rejectedAt)->addDays($days)->startOfDay();
                    $daysLeft = (int) ceil(now()->diffInSeconds($eligibleAfter, false) / 86400);

                    if ($daysLeft > 0) {
                        return [
                            'applicant_code' => $match['applicant_code'],
                            'applied_at' => $match['applied_at'],
                            'rejected_at' => $match['rejected_at'],
                            'eligible_after' => $eligibleAfter->toDateString(),
                            'eligible_after_label' => $eligibleAfter->format('M j, Y'),
                            'applied_label' => $rejectedAt->format('M j, Y'),
                            'days_left' => $daysLeft,
                            'cooldown_days' => $days,
                            'is_eligible' => false,
                            'job_post_id' => (int) $match['job_post_id'],
                            'matched_rules' => $match['matched_rules'],
                        ];
                    }
                }
            }
        }

        return null;
    }

    /**
     * Find active duplicate for the SAME job_post_id among recognized matches.
     */
    public static function findDuplicate(
        string $email,
        int $jobPostId,
        ?string $name = null,
        ?string $phone = null,
        ?string $address = null,
        ?int $excludeApplicantId = null
    ): ?object {
        // Direct email check first
        $direct = DuplicateApplicationService::findDuplicate($email, $jobPostId);
        if ($direct) {
            return $direct;
        }

        if ($name) {
            $cutoff = now()->subDays(DuplicateApplicationService::REAPPLY_DAYS);
            $matches = static::findMatches($email, $name, $phone, $address, $excludeApplicantId);

            foreach ($matches as $match) {
                if ((int) $match['job_post_id'] === $jobPostId
                    && ! in_array($match['stage'], DuplicateApplicationService::TERMINAL_STAGES, true)
                ) {
                    $appliedAt = Carbon::parse($match['applied_at']);
                    if ($appliedAt->gte($cutoff)) {
                        return (object) [
                            'applicant_id' => $match['applicant_id'],
                            'applicant_code' => $match['applicant_code'],
                            'applied_at' => $match['applied_at'],
                            'stage' => $match['stage'],
                            'matched_rules' => $match['matched_rules'],
                        ];
                    }
                }
            }
        }

        return null;
    }
}


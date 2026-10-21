<?php

namespace Modules\ApplicantManagement\Services;

use App\Services\AuditLogger;
use Modules\ApplicantManagement\Models\Applicant;

/**
 * Offer response window rules.
 *
 * After a Final Evaluation recommends a candidate (Recommended for Hire /
 * For Another Position) staff send the offer email and the applicant has
 * 7 days to respond. HR records the applicant's reply (there is no applicant
 * portal), so the only automatic rule here is the deadline: a pending offer
 * that passes its window is treated as a declined applicant — the record
 * simply shows as Failed in the Pipeline Overview, like any other decline.
 */
class OfferService
{
    /** Days the applicant has to respond to the offer. */
    public const RESPONSE_WINDOW_DAYS = 7;

    /**
     * Materializes the 7-day rule: every pending offer past its deadline is
     * recorded as declined and the applicant moves to the Rejected stage
     * (Failed in the Pipeline Overview).
     *
     * Called lazily from the list endpoints (the UI polls them) so the rule
     * takes effect without a scheduler, and defensively from the response
     * endpoint before a reply is recorded.
     *
     * @return int number of offers expired by this call
     */
    public static function expireOverdue(): int
    {
        $overdue = Applicant::query()
            ->where('offer_status', 'Pending')
            ->whereNotNull('offer_expires_at')
            ->where('offer_expires_at', '<', now())
            ->get();

        foreach ($overdue as $applicant) {
            // Expired offer = declined applicant: welcome back anytime, so no
            // rejected_at (the cooldown guard skips Declined rows entirely).
            $applicant->update([
                'offer_status' => 'Declined',
                'stage'        => 'Rejected',
                'rejected_at'  => null,
            ]);

            AuditLogger::log(
                action: 'Offer Response Window Expired',
                module: 'Applicant Management',
                severity: 'Warning',
                targetType: 'Applicant',
                targetId: (string) $applicant->applicant_id,
                details: "{$applicant->name} did not respond to the offer within "
                    . self::RESPONSE_WINDOW_DAYS . ' days — treated as a declined applicant (Failed).'
            );
        }

        return $overdue->count();
    }
}

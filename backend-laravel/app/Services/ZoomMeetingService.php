<?php

namespace App\Services;

/**
 * Zoom virtual-interview link generator.
 *
 * Self-contained MOCK provider (no external API keys needed): generates a
 * deterministic Zoom-style meeting (meeting ID + join link + continue/rejoin
 * link + password) and stores it on the interview row. The applicant receives
 * both links + password + interviewer name by email.
 *
 * To swap in the real Zoom Server-to-Server OAuth API later, replace
 * ::createForInterview() internals with a POST to
 * https://api.zoom.us/v2/users/me/meetings (see ZOOM_* env vars below) and
 * keep the same return shape — callers and emails stay unchanged.
 *
 * Env (future real provider):
 *   ZOOM_PROVIDER=mock|api, ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID,
 *   ZOOM_CLIENT_SECRET
 */
class ZoomMeetingService
{
    /**
     * @return array{meeting_id:string,join_url:string,continue_url:string,password:string}
     */
    public static function createForInterview(
        string $interviewCode,
        string $applicantName,
        ?string $interviewerName = null,
        ?string $position = null,
    ): array {
        // Real-provider hook (not wired yet — falls through to mock).
        // if (config('services.zoom.provider') === 'api') { ... }

        // Mock Zoom-style meeting ID: 3-4-4 digit groups like real Zoom IDs.
        $digits = '';
        for ($i = 0; $i < 11; $i++) {
            $digits .= (string) random_int(0, 9);
        }
        // Ensure it starts non-zero like a real meeting ID.
        if ($digits[0] === '0') {
            $digits[0] = (string) random_int(1, 9);
        }
        $meetingId = substr($digits, 0, 3).' '.substr($digits, 3, 4).' '.substr($digits, 7, 4);
        $meetingIdCompact = str_replace(' ', '', $meetingId);

        // 6-char alphanumeric password (Zoom style).
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        $password = '';
        for ($i = 0; $i < 6; $i++) {
            $password .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }

        // Zoom join links carry an encrypted ?pwd= hash; emulate with url-safe base64.
        $pwdHash = rtrim(strtr(base64_encode($interviewCode.':'.$password), '+/', '-_'), '=');
        $joinUrl = "https://zoom.us/j/{$meetingIdCompact}?pwd={$pwdHash}";
        // 2nd link: same meeting, flagged as continue/rejoin (used if dropped).
        $continueUrl = "https://zoom.us/j/{$meetingIdCompact}?pwd={$pwdHash}&continue=1#rejoin";

        return [
            'meeting_id'   => $meetingIdCompact,
            'join_url'     => $joinUrl,
            'continue_url' => $continueUrl,
            'password'     => $password,
        ];
    }

    /**
     * Fill Zoom columns on an interview model when it is Virtual and has none.
     * Returns true when links were generated.
     */
    public static function ensureForModel(object $interview, ?string $position = null): bool
    {
        if (($interview->mode ?? null) !== 'Virtual') {
            return false;
        }
        if (! empty($interview->zoom_join_url)) {
            return false;
        }
        $applicantName = $interview->applicant?->name ?? 'Applicant';
        $zoom = static::createForInterview(
            (string) ($interview->interview_code ?? 'INT'),
            $applicantName,
            $interview->interviewer_name,
            $position ?? $interview->applicant?->jobPost?->title,
        );
        $interview->zoom_meeting_id = $zoom['meeting_id'];
        $interview->zoom_join_url = $zoom['join_url'];
        $interview->zoom_continue_url = $zoom['continue_url'];
        $interview->zoom_password = $zoom['password'];

        return true;
    }
}

<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Zoom virtual-interview link generator.
 *
 * Two providers behind the same return shape (callers and emails unchanged):
 *
 *  - mock (default, no keys): deterministic Zoom-style meeting (meeting ID +
 *    join link + continue/rejoin link + password) stored on the interview row.
 *  - api  (ZOOM_PROVIDER=api + Server-to-Server OAuth creds): creates a REAL
 *    Zoom meeting via POST https://api.zoom.us/v2/users/me/meetings so the
 *    frontend Meeting SDK Component View can embed it in the HRMS popup
 *    (no Zoom app needed). Falls back to mock when creds/API fail.
 *
 * Env:
 *   ZOOM_PROVIDER=mock|api, ZOOM_SDK_KEY, ZOOM_SDK_SECRET,
 *   ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET
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
        // Real provider: try the Zoom API, fall back to mock on any failure.
        if (config('services.zoom.provider') === 'api') {
            $real = static::createViaApi($interviewCode, $applicantName, $interviewerName, $position);
            if ($real !== null) {
                return $real;
            }
        }

        return static::createMock($interviewCode);
    }

    /** Mock Zoom-style meeting (no external calls). */
    protected static function createMock(string $interviewCode): array {
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
     * Create a REAL Zoom meeting via Server-to-Server OAuth.
     * Returns null when not configured / API fails (caller falls back to mock).
     *
     * @return array{meeting_id:string,join_url:string,continue_url:string,password:string}|null
     */
    protected static function createViaApi(
        string $interviewCode,
        string $applicantName,
        ?string $interviewerName = null,
        ?string $position = null,
    ): ?array {
        $accountId = (string) config('services.zoom.account_id');
        $clientId = (string) config('services.zoom.client_id');
        $clientSecret = (string) config('services.zoom.client_secret');
        if ($accountId === '' || $clientId === '' || $clientSecret === '') {
            return null;
        }

        try {
            $tokenRes = Http::withBasicAuth($clientId, $clientSecret)->asForm()->post(
                'https://zoom.us/oauth/token',
                ['grant_type' => 'account_credentials', 'account_id' => $accountId]
            );
            if (! $tokenRes->successful()) {
                Log::warning('Zoom OAuth failed: '.$tokenRes->body());
                return null;
            }
            $accessToken = (string) ($tokenRes->json('access_token') ?? '');
            if ($accessToken === '') {
                return null;
            }

            $topic = trim("Interview — {$applicantName}".($position ? " ({$position})" : ''));
            $agenda = trim("{$interviewCode}".($interviewerName ? " · Interviewer: {$interviewerName}" : ''));
            $createRes = Http::withToken($accessToken)->post('https://api.zoom.us/v2/users/me/meetings', [
                'topic'    => mb_substr($topic, 0, 200),
                'type'     => 2,
                'agenda'   => mb_substr($agenda, 0, 2000),
                'settings' => [
                    'waiting_room'     => true,
                    'join_before_host' => false,
                    'approval_type'    => 2,
                    'auto_recording'   => 'none',
                ],
            ]);
            if (! $createRes->successful()) {
                Log::warning('Zoom create meeting failed: '.$createRes->body());
                return null;
            }
            $meetingId = (string) ($createRes->json('id') ?? '');
            $joinUrl = (string) ($createRes->json('join_url') ?? '');
            $password = (string) ($createRes->json('password') ?? '');
            if ($meetingId === '' || $joinUrl === '') {
                return null;
            }

            return [
                'meeting_id'   => $meetingId,
                'join_url'     => $joinUrl,
                'continue_url' => $joinUrl.'#rejoin',
                'password'     => $password,
            ];
        } catch (\Throwable $e) {
            Log::warning('Zoom API error: '.$e->getMessage());
            return null;
        }
    }

    /** Whether the SDK embed is configured (Meeting SDK key pair present). */
    public static function sdkConfigured(): bool
    {
        return (string) config('services.zoom.sdk_key') !== ''
            && (string) config('services.zoom.sdk_secret') !== '';
    }

    /**
     * Mint a Meeting SDK JWT signature for Component View join.
     * Returns null when SDK keys are missing. The secret never leaves the server.
     */
    public static function sdkSignature(string $meetingNumber, int $role = 0): ?string
    {
        $sdkKey = (string) config('services.zoom.sdk_key');
        $sdkSecret = (string) config('services.zoom.sdk_secret');
        if ($sdkKey === '' || $sdkSecret === '') {
            return null;
        }

        $digits = (string) preg_replace('/\D/', '', $meetingNumber);
        if ($digits === '') {
            return null;
        }

        $enc = static fn (string $json): string => rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
        $header = $enc((string) json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = $enc((string) json_encode([
            'sdkKey'   => $sdkKey,
            'appKey'   => $sdkKey,
            'mn'       => $digits,
            'role'     => $role,
            'iat'      => time(),
            'exp'      => time() + 7200,
            'tokenExp' => time() + 7200,
        ]));
        $sig = hash_hmac('sha256', $header.'.'.$payload, $sdkSecret, true);

        return $header.'.'.$payload.'.'.rtrim(strtr(base64_encode($sig), '+/', '-_'), '=');
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

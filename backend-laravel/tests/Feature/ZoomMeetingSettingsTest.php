<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class ZoomMeetingSettingsTest extends TestCase
{
    use RefreshesSeededDatabase;

    private const MEETING_ID = '11122233344';

    private function enableRealZoomProvider(): void
    {
        config([
            'services.zoom.provider'       => 'api',
            'services.zoom.account_id'     => 'test-account',
            'services.zoom.client_id'      => 'test-client',
            'services.zoom.client_secret'  => 'test-secret',
            'services.zoom.sdk_key'        => 'test-sdk-key',
            'services.zoom.sdk_secret'     => 'test-sdk-secret',
        ]);
    }

    private function fakeZoom(bool $waitingRoom = true): void
    {
        Http::fake(function ($request) use ($waitingRoom) {
            if (str_contains($request->url(), 'oauth/token')) {
                return Http::response(['access_token' => 'test-token']);
            }
            if (str_contains($request->url(), '/users/me/meetings')) {
                return Http::response([
                    'id'       => self::MEETING_ID,
                    'join_url' => 'https://us05web.zoom.us/j/'.self::MEETING_ID.'?pwd=abc',
                    'password' => 'abc123',
                ]);
            }
            if (str_contains($request->url(), '/meetings/'.self::MEETING_ID) && $request->method() === 'GET') {
                return Http::response([
                    'id'       => self::MEETING_ID,
                    'settings' => ['waiting_room' => $waitingRoom, 'join_before_host' => ! $waitingRoom],
                ]);
            }
            if (str_contains($request->url(), '/meetings/'.self::MEETING_ID) && $request->method() === 'PATCH') {
                return Http::response([], 204);
            }

            return Http::response([], 404);
        });
    }

    private function createApplicant(): Applicant
    {
        $jobPost = JobPost::query()->firstOrFail();

        return Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Zoom Settings',
            'email'          => 'zoom.settings@example.com',
            'status'         => 'fit',
            'stage'          => 'Screened',
        ]);
    }

    private function bookVirtualInterview(string $token, Applicant $applicant): array
    {
        return $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-02',
            'scheduled_time'   => '09:00',
            'mode'             => 'Virtual',
            'interviewer_name' => 'First Interviewer',
        ], $this->authHeaders($token))->assertCreated()->json();
    }

    public function test_new_zoom_meetings_disable_the_waiting_room_and_allow_join_before_host(): void
    {
        Mail::fake();
        $this->enableRealZoomProvider();
        $this->fakeZoom();

        $token = $this->loginViaOtp();
        $this->bookVirtualInterview($token, $this->createApplicant());

        // Applicants join from the emailed link and must land inside the
        // meeting: a waiting room (or a blocked join before host) strands
        // them outside because the embedded host view cannot admit guests.
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/users/me/meetings')
                && $request->method() === 'POST'
                && data_get($request->data(), 'settings.waiting_room') === false
                && data_get($request->data(), 'settings.join_before_host') === true;
        });
    }

    public function test_opening_a_legacy_meeting_with_a_waiting_room_patches_it_joinable(): void
    {
        Mail::fake();
        $this->enableRealZoomProvider();
        $this->fakeZoom(waitingRoom: true);

        $token = $this->loginViaOtp();
        $created = $this->bookVirtualInterview($token, $this->createApplicant());

        $this->postJson(
            "/api/v1/interviews/{$created['interview_id']}/zoom-signature",
            ['role' => 1],
            $this->authHeaders($token)
        )->assertOk();

        Http::assertSent(function ($request) {
            return $request->method() === 'PATCH'
                && str_contains($request->url(), '/meetings/'.self::MEETING_ID)
                && data_get($request->data(), 'settings.waiting_room') === false
                && data_get($request->data(), 'settings.join_before_host') === true;
        });
    }

    public function test_already_joinable_meetings_are_left_alone(): void
    {
        Mail::fake();
        $this->enableRealZoomProvider();
        $this->fakeZoom(waitingRoom: false);

        $token = $this->loginViaOtp();
        $created = $this->bookVirtualInterview($token, $this->createApplicant());

        $this->postJson(
            "/api/v1/interviews/{$created['interview_id']}/zoom-signature",
            ['role' => 1],
            $this->authHeaders($token)
        )->assertOk();

        Http::assertNotSent(function ($request) {
            return $request->method() === 'PATCH'
                && str_contains($request->url(), '/meetings/'.self::MEETING_ID);
        });
    }
}

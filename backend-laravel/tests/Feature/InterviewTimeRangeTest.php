<?php

namespace Tests\Feature;

use App\Mail\ApplicantAcceptedMail;
use App\Mail\InterviewRescheduledMail;
use Illuminate\Support\Facades\Mail;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Custom interview time ranges — "10:00 – 11:00" bookings: the explicit end
 * time is stored, returned by the API, counts as a schedule change when the
 * range is stretched, and can be cleared back to the slot-interval default.
 */
class InterviewTimeRangeTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function createApplicant(string $name): Applicant
    {
        $jobPost = JobPost::query()->firstOrFail();

        return Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => $name,
            'email'          => 'time.range@example.com',
            'status'         => 'fit',
            'stage'          => 'Screened',
        ]);
    }

    public function test_create_with_a_custom_time_range_persists_the_end_time(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Range Create');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'       => $applicant->applicant_id,
            'scheduled_date'     => '2026-11-03',
            'scheduled_time'     => '10:00',
            'scheduled_end_time' => '11:00',
            'mode'               => 'Virtual',
            'interviewer_name'   => 'Range Interviewer',
        ], $this->authHeaders($token))->assertCreated()->json();

        $this->assertStringContainsString('11:00', (string) $created['scheduled_end_time']);
        $this->assertDatabaseHas('interviews', [
            'interview_id'       => $created['interview_id'],
            'scheduled_time'     => '10:00:00',
            'scheduled_end_time' => '11:00:00',
        ]);

        // The invitation email shows the range in 12-hour form.
        Mail::assertSent(ApplicantAcceptedMail::class, function (ApplicantAcceptedMail $mail) {
            return str_contains($mail->render(), "10:00 AM \u{2013} 11:00 AM");
        });
    }

    public function test_changing_only_the_end_time_counts_as_a_reschedule(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Range Reschedule');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-03',
            'scheduled_time'   => '10:00',
            'mode'             => 'Virtual',
            'interviewer_name' => 'Range Interviewer',
        ], $this->authHeaders($token))->assertCreated()->json();

        $this->assertNull($created['scheduled_end_time']);

        $updated = $this->putJson("/api/v1/interviews/{$created['interview_id']}", [
            'scheduled_end_time' => '11:00',
        ], $this->authHeaders($token))->assertOk()->json();

        $this->assertStringContainsString('11:00', (string) $updated['scheduled_end_time']);

        // Stretching the range re-issues the applicant's Zoom links + email.
        $this->assertNotSame($created['zoom_meeting_id'], $updated['zoom_meeting_id']);
        Mail::assertSent(InterviewRescheduledMail::class);
        Mail::assertSent(InterviewRescheduledMail::class, function (InterviewRescheduledMail $mail) {
            return str_contains($mail->render(), "10:00 AM \u{2013} 11:00 AM");
        });
    }

    public function test_end_time_can_be_cleared_and_bad_formats_are_rejected(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Range Clear');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'       => $applicant->applicant_id,
            'scheduled_date'     => '2026-11-03',
            'scheduled_time'     => '10:00',
            'scheduled_end_time' => '11:00',
            'mode'               => 'On-site',
            'interviewer_name'   => 'Range Interviewer',
        ], $this->authHeaders($token))->assertCreated()->json();

        $cleared = $this->putJson("/api/v1/interviews/{$created['interview_id']}", [
            'scheduled_end_time' => null,
        ], $this->authHeaders($token))->assertOk()->json();

        $this->assertNull($cleared['scheduled_end_time']);
        $this->assertDatabaseHas('interviews', [
            'interview_id'       => $created['interview_id'],
            'scheduled_end_time' => null,
        ]);

        // Malformed ranges are rejected before touching the row.
        $this->putJson("/api/v1/interviews/{$created['interview_id']}", [
            'scheduled_end_time' => '25:99',
        ], $this->authHeaders($token))->assertStatus(422);
    }
}

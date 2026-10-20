<?php

namespace Tests\Feature;

use App\Mail\InterviewRescheduledMail;
use Illuminate\Support\Facades\Mail;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class InterviewRescheduleZoomTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function createApplicant(string $name): Applicant
    {
        $jobPost = JobPost::query()->firstOrFail();

        return Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => $name,
            'email'          => 'zoom.reschedule@example.com',
            'status'         => 'fit',
            'stage'          => 'Screened',
        ]);
    }

    public function test_rescheduling_a_virtual_interview_issues_a_brand_new_zoom_link(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Zoom Reschedule');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-02',
            'scheduled_time'   => '09:00',
            'mode'             => 'Virtual',
            'interviewer_name' => 'First Interviewer',
        ], $this->authHeaders($token))->assertCreated()->json();

        $this->assertNotEmpty($created['zoom_meeting_id']);
        $this->assertNotEmpty($created['zoom_join_url']);
        $this->assertNotEmpty($created['zoom_password']);

        $updated = $this->putJson("/api/v1/interviews/{$created['interview_id']}", [
            'scheduled_date'   => '2026-11-05',
            'scheduled_time'   => '14:30',
            'mode'             => 'Virtual',
            'interviewer_name' => 'First Interviewer',
            'status'           => 'Scheduled',
        ], $this->authHeaders($token))->assertOk()->json();

        // A reschedule must hand the applicant a fresh meeting (new ID,
        // new join/continue links and a new password).
        $this->assertNotSame($created['zoom_meeting_id'], $updated['zoom_meeting_id']);
        $this->assertNotSame($created['zoom_join_url'], $updated['zoom_join_url']);
        $this->assertNotSame($created['zoom_continue_url'], $updated['zoom_continue_url']);
        $this->assertNotSame($created['zoom_password'], $updated['zoom_password']);

        // The stored row agrees with the response.
        $this->assertDatabaseHas('interviews', [
            'interview_id'    => $created['interview_id'],
            'zoom_meeting_id' => $updated['zoom_meeting_id'],
            'zoom_join_url'   => $updated['zoom_join_url'],
        ]);

        // The reschedule email carries the NEW join link.
        Mail::assertSent(InterviewRescheduledMail::class, function (InterviewRescheduledMail $mail) use ($updated) {
            return $mail->zoomJoinUrl === $updated['zoom_join_url']
                && $mail->zoomContinueUrl === $updated['zoom_continue_url'];
        });

        // Its subject names the new schedule, so each reschedule arrives as
        // a separate email instead of collapsing into one Gmail thread.
        Mail::assertSent(InterviewRescheduledMail::class, function (InterviewRescheduledMail $mail) use ($updated) {
            return str_contains($mail->envelope()->subject, (string) $updated['scheduled_date']);
        });
    }

    public function test_updating_details_without_a_schedule_change_keeps_the_existing_zoom_link(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Zoom Keep');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-02',
            'scheduled_time'   => '09:00',
            'mode'             => 'Virtual',
            'interviewer_name' => 'First Interviewer',
        ], $this->authHeaders($token))->assertCreated()->json();

        $updated = $this->putJson("/api/v1/interviews/{$created['interview_id']}", [
            'interviewer_name' => 'Another Interviewer',
        ], $this->authHeaders($token))->assertOk()->json();

        $this->assertSame($created['zoom_meeting_id'], $updated['zoom_meeting_id']);
        $this->assertSame($created['zoom_join_url'], $updated['zoom_join_url']);

        // A non-schedule edit must not trigger a reschedule email either.
        Mail::assertNotSent(InterviewRescheduledMail::class);
    }

    public function test_switching_an_onsite_interview_to_virtual_creates_a_zoom_link(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Zoom Switch');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-02',
            'scheduled_time'   => '09:00',
            'mode'             => 'On-site',
            'interviewer_name' => 'First Interviewer',
        ], $this->authHeaders($token))->assertCreated()->json();

        $this->assertNull($created['zoom_join_url']);

        $updated = $this->putJson("/api/v1/interviews/{$created['interview_id']}", [
            'mode' => 'Virtual',
        ], $this->authHeaders($token))->assertOk()->json();

        $this->assertNotEmpty($updated['zoom_meeting_id']);
        $this->assertNotEmpty($updated['zoom_join_url']);
        $this->assertNotEmpty($updated['zoom_password']);
    }
}

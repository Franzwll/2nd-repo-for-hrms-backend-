<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Mail;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\Facility;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class InterviewVirtualFacilityTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function createApplicant(string $name): Applicant
    {
        $jobPost = JobPost::query()->firstOrFail();

        return Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => $name,
            'email'          => 'virtual.facility@example.com',
            'status'         => 'fit',
            'stage'          => 'Screened',
        ]);
    }

    private function facilityId(): int
    {
        return (int) Facility::query()->value('facility_id');
    }

    public function test_virtual_interviews_never_reserve_a_facility(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Virtual No Facility');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-10',
            'scheduled_time'   => '09:00',
            'mode'             => 'Virtual',
            'interviewer_name' => 'First Interviewer',
            'facility_id'      => $this->facilityId(),
        ], $this->authHeaders($token))->assertCreated()->json();

        // Even when a client sends one, a Virtual booking never reserves a
        // room — no facility request / approval state is created for it.
        $this->assertNull($created['facility_id']);
        $this->assertSame('Not Required', $created['facility_status']);
    }

    public function test_onsite_interviews_still_wait_for_facility_approval(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Onsite Facility');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-10',
            'scheduled_time'   => '10:00',
            'mode'             => 'On-site',
            'interviewer_name' => 'First Interviewer',
            'facility_id'      => $this->facilityId(),
        ], $this->authHeaders($token))->assertCreated()->json();

        // On-site bookings keep the room request flow untouched.
        $this->assertSame($this->facilityId(), (int) $created['facility_id']);
        $this->assertSame('Waiting for Facility Approval', $created['facility_status']);
    }

    public function test_switching_an_interview_to_virtual_clears_its_facility(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->createApplicant('Switch To Virtual');

        $created = $this->postJson('/api/v1/interviews', [
            'applicant_id'     => $applicant->applicant_id,
            'scheduled_date'   => '2026-11-10',
            'scheduled_time'   => '11:00',
            'mode'             => 'On-site',
            'interviewer_name' => 'First Interviewer',
            'facility_id'      => $this->facilityId(),
        ], $this->authHeaders($token))->assertCreated()->json();

        $updated = $this->putJson("/api/v1/interviews/{$created['interview_id']}", [
            'mode' => 'Virtual',
        ], $this->authHeaders($token))->assertOk()->json();

        // Moving an interview to Virtual drops its room reservation and the
        // approval state with it.
        $this->assertNull($updated['facility_id']);
        $this->assertSame('Not Required', $updated['facility_status']);

        $this->assertDatabaseHas('interviews', [
            'interview_id'    => $created['interview_id'],
            'facility_id'     => null,
            'facility_status' => 'Not Required',
        ]);
    }
}

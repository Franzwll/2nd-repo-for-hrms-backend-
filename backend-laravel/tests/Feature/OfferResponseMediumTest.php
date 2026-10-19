<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Mail;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\FinalEvaluation;
use Modules\NewHireOnboarding\Models\NewHire;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

/**
 * Offer response medium — there is no applicant portal / inbound email or SMS
 * integration, so HR records the reply (Email / SMS / Call / In person) together
 * with the accept / decline decision. These tests lock in that the medium,
 * note, timestamp and recorder are captured.
 */
class OfferResponseMediumTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function applicantWithOffer(string $stage = 'Offer'): Applicant
    {
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code'   => Applicant::generateCode(),
            'job_post_id'      => $jobPost->job_post_id,
            'name'             => 'Offer Medium',
            'email'            => 'offer.medium@example.com',
            'status'           => 'fit',
            'stage'            => $stage,
            'offer_status'     => 'Pending',
            'offer_sent_at'    => now(),
            'offer_expires_at' => now()->addDays(7),
        ]);

        FinalEvaluation::create([
            'applicant_id'       => $applicant->applicant_id,
            'evaluation_date'    => now()->toDateString(),
            'recommendation'     => 'Recommended for Hire',
            'overall_score'      => 80,
            'score_breakdown_json' => ['weights' => ['screening' => 20, 'interview' => 30, 'assessment' => 25, 'practical' => 25], 'breakdown' => []],
        ]);

        return $applicant;
    }

    public function test_accepting_records_the_reply_medium_and_start_date(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->applicantWithOffer();

        $response = $this->postJson(
            "/api/v1/applicants/{$applicant->applicant_id}/offer/response",
            [
                'response'   => 'accepted',
                'start_date' => '2026-11-03',
                'channel'    => 'Call',
                'note'       => 'Called the front desk, 3:12 PM',
            ],
            $this->authHeaders($token),
        )->assertOk()->json();

        $this->assertSame('Call', $response['offer_response_channel']);
        $this->assertSame('Called the front desk, 3:12 PM', $response['offer_response_note']);
        $this->assertNotNull($response['offer_response_recorded_by']);

        $this->assertDatabaseHas('applicants', [
            'applicant_id'           => $applicant->applicant_id,
            'stage'                  => 'Hired',
            'offer_status'           => 'Accepted',
            'offer_start_date'       => '2026-11-03',
            'offer_response_channel' => 'Call',
        ]);
        $this->assertNotNull($applicant->fresh()->offer_responded_at);

        // Accepting also files the applicant into New Hire Onboarding on the
        // server, as Pre-onboarding, exactly once (idempotent per applicant).
        $newHire = NewHire::where('applicant_id', $applicant->applicant_id)->first();
        $this->assertNotNull($newHire, 'Accepting an offer must create a new-hire record.');
        $this->assertSame('Pre-onboarding', $newHire->stage);
        $this->assertSame('2026-11-03', $newHire->start_date->toDateString());
        $this->assertSame(1, NewHire::where('applicant_id', $applicant->applicant_id)->count());

        // Pre-onboarding hires are not Core HCM employees yet.
        $this->assertNull($newHire->fresh()->employee_id);
        $this->assertNull(\App\Models\Employee::where('email', 'offer.medium@example.com')->first());
    }

    public function test_promoting_to_probationary_provisions_core_hcm_employee(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->applicantWithOffer();

        $this->postJson(
            "/api/v1/applicants/{$applicant->applicant_id}/offer/response",
            ['response' => 'accepted', 'start_date' => '2026-11-03', 'channel' => 'Email'],
            $this->authHeaders($token),
        )->assertOk();

        $newHire = NewHire::where('applicant_id', $applicant->applicant_id)->firstOrFail();

        $this->postJson(
            "/api/v1/new-hires/{$newHire->new_hire_id}/promote-stage",
            [],
            $this->authHeaders($token),
        )->assertOk();

        $employee = \App\Models\Employee::where('email', 'offer.medium@example.com')->first();
        $this->assertNotNull($employee, 'A Probationary hire must appear in Core HCM.');
        $this->assertSame('Probationary', $employee->employment_type);
        $this->assertSame($employee->employee_id, $newHire->fresh()->employee_id);
    }

    public function test_declining_records_the_reply_medium(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->applicantWithOffer();

        $response = $this->postJson(
            "/api/v1/applicants/{$applicant->applicant_id}/offer/response",
            [
                'response' => 'declined',
                'channel'  => 'SMS',
                'note'     => 'Texted that they accepted another offer',
            ],
            $this->authHeaders($token),
        )->assertOk()->json();

        $this->assertSame('SMS', $response['offer_response_channel']);

        $this->assertDatabaseHas('applicants', [
            'applicant_id'           => $applicant->applicant_id,
            'stage'                  => 'Rejected',
            'offer_status'           => 'Declined',
            'offer_response_channel' => 'SMS',
        ]);
    }

    public function test_reply_medium_is_required_and_validated(): void
    {
        Mail::fake();
        $token = $this->loginViaOtp();
        $applicant = $this->applicantWithOffer();

        // Missing medium → rejected.
        $this->postJson(
            "/api/v1/applicants/{$applicant->applicant_id}/offer/response",
            ['response' => 'declined'],
            $this->authHeaders($token),
        )->assertStatus(422)->assertJsonValidationErrors('channel');

        // Unknown medium → rejected.
        $this->postJson(
            "/api/v1/applicants/{$applicant->applicant_id}/offer/response",
            ['response' => 'declined', 'channel' => 'Carrier Pigeon'],
            $this->authHeaders($token),
        )->assertStatus(422)->assertJsonValidationErrors('channel');

        $this->assertDatabaseHas('applicants', [
            'applicant_id' => $applicant->applicant_id,
            'offer_status' => 'Pending',
        ]);
    }
}

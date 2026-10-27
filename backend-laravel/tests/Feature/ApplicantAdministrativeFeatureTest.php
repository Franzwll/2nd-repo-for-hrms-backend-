<?php

namespace Tests\Feature;

use App\Models\SystemUser;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantBlockHistory;
use Modules\ApplicantManagement\Models\FinalEvaluation;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class ApplicantAdministrativeFeatureTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function superAdmin(): SystemUser
    {
        return SystemUser::whereHas('role', fn ($q) => $q->where('is_super_admin', true))->firstOrFail();
    }

    public function test_spam_protection_prevents_duplicate_offer_acceptance(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code'   => Applicant::generateCode(),
            'job_post_id'      => $jobPost->job_post_id,
            'name'             => 'Spam Tester',
            'email'            => 'spam.tester@example.com',
            'stage'            => 'Offer',
            'status'           => 'fit',
            'offer_status'     => 'Pending',
            'offer_sent_at'    => now(),
            'offer_expires_at' => now()->addDays(7),
        ]);

        FinalEvaluation::create([
            'applicant_id'         => $applicant->applicant_id,
            'evaluation_date'      => now()->toDateString(),
            'recommendation'       => 'Recommended for Hire',
            'overall_score'        => 85,
            'score_breakdown_json' => ['weights' => ['screening' => 25, 'interview' => 25, 'assessment' => 25, 'practical' => 25], 'breakdown' => []],
        ]);

        // First call: succeeds
        $response1 = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/offer/response", [
            'response'   => 'accepted',
            'start_date' => now()->addDays(14)->toDateString(),
            'channel'    => 'Email',
            'note'       => 'Accepted offer',
        ]);
        $response1->assertOk();

        $applicant->refresh();
        $this->assertEquals('Hired', $applicant->stage);
        $this->assertEquals('Accepted', $applicant->offer_status);

        // Second call (simulating fast click / spam): rejected with 422
        $response2 = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/offer/response", [
            'response'   => 'accepted',
            'start_date' => now()->addDays(14)->toDateString(),
            'channel'    => 'Email',
            'note'       => 'Spam clicked',
        ]);
        $response2->assertStatus(422);
        $response2->assertJsonFragment([
            'message' => 'This applicant is not awaiting an offer response.',
        ]);
    }

    public function test_rejection_auto_records_30_day_cooldown_timestamp(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Cooldown Test Applicant',
            'email'          => 'cooldown.applicant@example.com',
            'stage'          => 'Screened',
            'status'         => 'fit',
        ]);

        $this->assertNull($applicant->rejected_at);

        // Reject via stage transition
        $response = $this->actingAs($superAdmin, 'sanctum')->patchJson("/api/v1/applicants/{$applicant->applicant_id}", [
            'stage'  => 'Rejected',
            'status' => 'not-fit',
        ]);
        $response->assertOk();

        $applicant->refresh();
        $this->assertNotNull($applicant->rejected_at, 'rejected_at must be stamped when rejected');
        $this->assertFalse($applicant->is_blocked, 'Rejection alone must NOT block applicant');
    }

    public function test_move_to_stage_administrative_action(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Stage Mover',
            'email'          => 'stage.mover@example.com',
            'stage'          => 'Assessed',
            'status'         => 'fit',
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/move-to-stage", [
            'target_stage' => 'Screened',
            'reason'       => 'Administrative stage correction due to incomplete resume',
        ]);
        $response->assertOk();

        $applicant->refresh();
        $this->assertEquals('Screened', $applicant->stage);
    }

    public function test_reopen_application_clears_rejection_and_cooldown(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Reopen Candidate',
            'email'          => 'reopen.candidate@example.com',
            'stage'          => 'Rejected',
            'status'         => 'not-fit',
            'rejected_at'    => now()->subDays(5),
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/reopen", [
            'target_stage' => 'Screened',
            'reason'       => 'New position requirements opened up for this candidate',
        ]);
        $response->assertOk();

        $applicant->refresh();
        $this->assertEquals('Screened', $applicant->stage);
        $this->assertEquals('fit', $applicant->status);
        $this->assertNull($applicant->rejected_at, 'Reopening must clear rejected_at cooldown anchor');
    }

    public function test_correct_hiring_decision_releases_opening(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();
        $initialFilled = (int) ($jobPost->filled_positions ?? 0);

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'No Show Candidate',
            'email'          => 'no.show@example.com',
            'stage'          => 'Hired',
            'status'         => 'fit',
            'offer_status'   => 'Accepted',
        ]);

        $response = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/correct-hiring", [
            'correction_type' => 'no_show',
            'reason'          => 'Candidate failed to report on designated start date',
            'apply_cooldown'  => true,
            'release_slot'    => true,
        ]);
        $response->assertOk();

        $applicant->refresh();
        $this->assertEquals('Rejected', $applicant->stage);
        $this->assertNotNull($applicant->rejected_at);
    }

    public function test_archive_and_restore_applicant(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Archive Target',
            'email'          => 'archive.target@example.com',
            'stage'          => 'Rejected',
            'status'         => 'not-fit',
            'rejected_at'    => now(),
        ]);

        // Archive
        $archiveRes = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/archive", [
            'reason' => 'Archiving old rejected record',
        ]);
        $archiveRes->assertOk();

        $applicant->refresh();
        $this->assertTrue($applicant->isArchived());

        // Index default excludes archived
        $indexRes = $this->actingAs($superAdmin, 'sanctum')->getJson('/api/v1/applicants');
        $indexRes->assertOk();
        $ids = collect($indexRes->json('data'))->pluck('applicant_id')->all();
        $this->assertNotContains($applicant->applicant_id, $ids);

        // Index with include_archived includes it
        $includeRes = $this->actingAs($superAdmin, 'sanctum')->getJson('/api/v1/applicants?include_archived=1');
        $includeRes->assertOk();
        $includedIds = collect($includeRes->json('data'))->pluck('applicant_id')->all();
        $this->assertContains($applicant->applicant_id, $includedIds);

        // Restore
        $restoreRes = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/restore", [
            'reason' => 'Restoring back to active list',
        ]);
        $restoreRes->assertOk();

        $applicant->refresh();
        $this->assertFalse($applicant->isArchived());
    }

    public function test_block_and_unblock_applicant_with_audit_history(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Disruptive Applicant',
            'email'          => 'disruptive@example.com',
            'stage'          => 'Screened',
            'status'         => 'fit',
        ]);

        // Block
        $blockRes = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/block", [
            'reason'     => 'Fabricated credentials and abusive conduct',
            'scope'      => 'all_jobs',
            'expires_at' => null,
        ]);
        $blockRes->assertOk();

        $applicant->refresh();
        $this->assertTrue($applicant->is_blocked);
        $this->assertEquals('Fabricated credentials and abusive conduct', $applicant->blocked_reason);

        // Check audit history
        $this->assertDatabaseHas('applicant_block_history', [
            'applicant_id' => $applicant->applicant_id,
            'action'       => 'blocked',
            'reason'       => 'Fabricated credentials and abusive conduct',
        ]);

        // Attempting to apply again via landing or store is blocked
        $storeRes = $this->actingAs($superAdmin, 'sanctum')->postJson('/api/v1/applicants', [
            'job_post_id' => $jobPost->job_post_id,
            'name'        => 'Disruptive Applicant',
            'email'       => 'disruptive@example.com',
            'phone'       => '09170001111',
            'address'     => '123 Fake St',
            'stage'       => 'Screened',
            'status'      => 'fit',
        ]);
        $storeRes->assertStatus(403);
        $storeRes->assertJsonFragment([
            'code' => 'APPLICANT_BLOCKED',
        ]);

        // Unblock
        $unblockRes = $this->actingAs($superAdmin, 'sanctum')->postJson("/api/v1/applicants/{$applicant->applicant_id}/unblock", [
            'reason' => 'Formal appeal reviewed and restriction lifted',
        ]);
        $unblockRes->assertOk();

        $applicant->refresh();
        $this->assertFalse($applicant->is_blocked);

        // Audit history has unblock event preserved
        $this->assertDatabaseHas('applicant_block_history', [
            'applicant_id' => $applicant->applicant_id,
            'action'       => 'unblocked',
            'reason'       => 'Formal appeal reviewed and restriction lifted',
        ]);
    }
}


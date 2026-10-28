<?php

namespace Tests\Unit;

use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantBlockHistory;
use App\Services\ApplicantRecognitionService;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class ApplicantRecognitionServiceTest extends TestCase
{
    use RefreshesSeededDatabase;

    private ApplicantRecognitionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ApplicantRecognitionService::class);
    }

    public function test_recognizes_returning_applicant_by_cross_matching_rules(): void
    {
        $jobPost = JobPost::query()->firstOrFail();

        // Seed an existing candidate in the database
        $prior = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'UniqueJuan DelaCruzTest',
            'email'          => 'uniquejuan.delacruz@example.com',
            'phone'          => '09991234567',
            'address'        => '999 Unique Avenue, Makati City',
            'stage'          => 'Rejected',
            'status'         => 'not-fit',
            'rejected_at'    => now()->subDays(5),
        ]);

        // 1. Exact Email Match
        $res1 = $this->service->findMatches('uniquejuan.delacruz@example.com', 'Someone Else');
        $this->assertCount(1, $res1);
        $this->assertContains('exact_email', $res1[0]['matched_rules']);

        // 2. Cross-match: email == name
        // (Applicant applies with email that matches prior applicant's name: uniquejuandelacruztest@...)
        $res2 = $this->service->findMatches('uniquejuandelacruztest@otherdomain.com', 'Random Name');
        $this->assertCount(1, $res2);
        $this->assertContains('email == name', $res2[0]['matched_rules']);

        // 3. Cross-match: email == contact number
        // (Email local part contains the contact digits: 09991234567@gmail.com)
        $res3 = $this->service->findMatches('09991234567@gmail.com', 'New Applicant');
        $this->assertCount(1, $res3);
        $this->assertContains('email == contact number', $res3[0]['matched_rules']);

        // 4. Cross-match: contact number == name
        // (Candidate gives phone number identical, name matches)
        $res4 = $this->service->findMatches('completelynew@example.com', 'UniqueJuan DelaCruzTest', '09991234567');
        $this->assertCount(1, $res4);
        $this->assertContains('contact number == name', $res4[0]['matched_rules']);

        // 5. Cross-match: contact number to address / address == contact
        // Prior candidate has phone '09991234567'.
        $res5 = $this->service->findMatches('different@example.com', 'Another Name', '09991234567', 'Different Address');
        $this->assertCount(1, $res5);

        // 6. Cross-match: address == name
        $res6 = $this->service->findMatches('unrelated@test.com', 'UniqueJuan DelaCruzTest', null, '999 Unique Avenue, Makati City');
        $this->assertCount(1, $res6);
        $this->assertContains('address == name', $res6[0]['matched_rules']);

        // 7. Cross-match: address == email address
        // Prior candidate has email 'uniquejuan.delacruz@example.com' and address '999 Unique Avenue, Makati City'
        $res7 = $this->service->findMatches('uniquejuan.delacruz@example.com', 'Unrelated', null, '999 Unique Avenue, Makati City');
        $this->assertCount(1, $res7);
        $this->assertContains('address == email address', $res7[0]['matched_rules']);
    }

    public function test_cooldown_detection_and_rules(): void
    {
        $jobPost = JobPost::query()->firstOrFail();

        // 1. Rejected candidate stamped within 30 days -> in active cooldown
        $rejected = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Maria Santos',
            'email'          => 'maria.santos@example.com',
            'stage'          => 'Rejected',
            'status'         => 'not-fit',
            'rejected_at'    => now()->subDays(10), // 20 days left
        ]);

        $cooldown = $this->service->findCooldown('maria.santos@example.com', 'Maria Santos');
        $this->assertNotNull($cooldown);
        $this->assertEquals(30, $cooldown['cooldown_days']);
        $this->assertGreaterThan(0, $cooldown['days_left']);
        $this->assertFalse($cooldown['is_eligible']);

        // 2. Candidate who declined offer -> cooldown is 0 days (eligible immediately)
        $declined = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Pedro Penduko',
            'email'          => 'pedro.declined@example.com',
            'stage'          => 'Offer',
            'status'         => 'fit',
            'offer_status'   => 'Declined',
            'offer_responded_at' => now()->subDay(),
        ]);

        $declinedCooldown = $this->service->findCooldown('pedro.declined@example.com', 'Pedro Penduko');
        $this->assertNull($declinedCooldown, 'Declined offer candidate should have no active cooldown');

        // 3. Rejected candidate with HR early override -> cooldown is bypassed
        $rejected->update(['cooldown_lifted_at' => now()]);
        $overriddenCooldown = $this->service->findCooldown('maria.santos@example.com', 'Maria Santos');
        $this->assertNull($overriddenCooldown, 'Overridden candidate should be eligible immediately');
    }

    public function test_active_recruitment_block_detection(): void
    {
        $jobPost = JobPost::query()->firstOrFail();

        $blocked = Applicant::create([
            'applicant_code'    => Applicant::generateCode(),
            'job_post_id'       => $jobPost->job_post_id,
            'name'              => 'Blocked Candidate',
            'email'             => 'blocked@example.com',
            'phone'             => '09998887777',
            'address'           => '777 Banned Rd, Taguig',
            'status'            => 'fit',
            'stage'             => 'Screened',
            'is_blocked'        => true,
            'blocked_at'        => now(),
            'blocked_reason'    => 'Misconduct during interview',
            'block_scope'       => 'all_jobs',
        ]);

        // Find block by email
        $blockInfo = $this->service->findBlock('blocked@example.com', 'Blocked Candidate');
        $this->assertNotNull($blockInfo);
        $this->assertEquals('Misconduct during interview', $blockInfo['reason']);

        // Find block by phone cross-match
        $blockInfoByPhone = $this->service->findBlock('different@example.com', 'Different Name', '09998887777');
        $this->assertNotNull($blockInfoByPhone);

        // Expired block should not restrict
        $blocked->update([
            'block_expires_at' => now()->subDay(),
        ]);
        $expiredBlockInfo = $this->service->findBlock('blocked@example.com', 'Blocked Candidate');
        $this->assertNull($expiredBlockInfo, 'Expired block should not restrict candidate');
    }
}

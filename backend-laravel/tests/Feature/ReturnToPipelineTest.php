<?php

namespace Tests\Feature;

use App\Models\SystemUser;
use Modules\ApplicantManagement\Models\Applicant;
use Modules\ApplicantManagement\Models\ApplicantAssessment;
use Modules\ApplicantManagement\Models\AssessmentTest;
use Modules\ApplicantManagement\Models\FinalEvaluation;
use Modules\ApplicantManagement\Models\Interview;
use Modules\ApplicantManagement\Models\PracticalTest;
use Modules\RecruitmentManagement\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class ReturnToPipelineTest extends TestCase
{
    use RefreshesSeededDatabase;

    private function superAdmin(): SystemUser
    {
        return SystemUser::whereHas('role', fn ($q) => $q->where('is_super_admin', true))->firstOrFail();
    }

    private function regularAdmin(): SystemUser
    {
        return SystemUser::whereHas('role', fn ($q) => $q->where('is_super_admin', false))->firstOrFail();
    }

    public function test_returning_applicant_with_practical_test_to_screened_cleans_up_all_subsequent_pipeline_records(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Practical Candidate',
            'email'          => 'practical.candidate@example.com',
            'status'         => 'fit',
            'stage'          => 'Practical Test',
            'fit_score'      => 85.00,
        ]);

        $interview = Interview::create([
            'interview_code' => Interview::generateCode(),
            'applicant_id'   => $applicant->applicant_id,
            'scheduled_date' => now()->toDateString(),
            'scheduled_time' => '10:00:00',
            'mode'           => 'On-site',
            'status'         => 'Completed',
        ]);

        $assessment = ApplicantAssessment::create([
            'applicant_id'    => $applicant->applicant_id,
            'assessment_date' => now()->toDateString(),
            'total_score'     => 88.00,
            'outcome'         => 'Recommended',
            'result'          => 'Passed',
        ]);

        $assessmentTest = AssessmentTest::create([
            'applicant_id' => $applicant->applicant_id,
            'test_title'   => 'General Aptitude',
            'test_date'    => now()->toDateString(),
            'total_score'  => 90.00,
            'result'       => 'Passed',
        ]);

        $practicalTest = PracticalTest::create([
            'applicant_id'    => $applicant->applicant_id,
            'task_title'      => 'Front Desk Demonstration',
            'test_date'       => now()->toDateString(),
            'total_score'     => 85.00,
            'result'          => 'Passed',
        ]);

        $this->actingAs($superAdmin);

        $response = $this->postJson("/api/v1/applicants/{$applicant->applicant_id}/return-to-pipeline", [
            'target_stage' => 'Screened',
            'reason'       => 'Resetting candidate back to initial screening stage.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('stage', 'Screened');

        $this->assertDatabaseHas('applicants', [
            'applicant_id' => $applicant->applicant_id,
            'stage'        => 'Screened',
        ]);

        // Verify that all pipeline records after Screened were deleted
        $this->assertDatabaseMissing('practical_tests', [
            'applicant_id' => $applicant->applicant_id,
        ]);
        $this->assertDatabaseMissing('assessment_tests', [
            'applicant_id' => $applicant->applicant_id,
        ]);
        $this->assertDatabaseMissing('applicant_assessments', [
            'applicant_id' => $applicant->applicant_id,
        ]);
        $this->assertDatabaseMissing('interviews', [
            'applicant_id' => $applicant->applicant_id,
        ]);
    }

    public function test_returning_applicant_to_assessment_test_cleans_up_practical_and_final_only(): void
    {
        $superAdmin = $this->superAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Multi Stage Candidate',
            'email'          => 'multistage.candidate@example.com',
            'status'         => 'fit',
            'stage'          => 'Final Evaluation',
            'fit_score'      => 85.00,
        ]);

        $interview = Interview::create([
            'interview_code' => Interview::generateCode(),
            'applicant_id'   => $applicant->applicant_id,
            'scheduled_date' => now()->toDateString(),
            'scheduled_time' => '10:00:00',
            'mode'           => 'On-site',
            'status'         => 'Completed',
        ]);

        $assessment = ApplicantAssessment::create([
            'applicant_id'    => $applicant->applicant_id,
            'assessment_date' => now()->toDateString(),
            'total_score'     => 88.00,
            'outcome'         => 'Recommended',
            'result'          => 'Passed',
        ]);

        $assessmentTest = AssessmentTest::create([
            'applicant_id' => $applicant->applicant_id,
            'test_title'   => 'General Aptitude',
            'test_date'    => now()->toDateString(),
            'total_score'  => 90.00,
            'result'       => 'Passed',
        ]);

        $practicalTest = PracticalTest::create([
            'applicant_id'    => $applicant->applicant_id,
            'task_title'      => 'Practical Demonstration',
            'test_date'       => now()->toDateString(),
            'total_score'     => 85.00,
            'result'          => 'Passed',
        ]);

        $finalEvaluation = FinalEvaluation::create([
            'applicant_id'       => $applicant->applicant_id,
            'evaluation_date'    => now()->toDateString(),
            'recommendation'     => 'Recommended for Hire',
            'overall_score'      => 86.00,
            'score_breakdown_json' => ['weights' => ['screening' => 20, 'interview' => 30, 'assessment' => 25, 'practical' => 25], 'breakdown' => []],
        ]);

        $this->actingAs($superAdmin);

        $response = $this->postJson("/api/v1/applicants/{$applicant->applicant_id}/return-to-pipeline", [
            'target_stage' => 'Assessment Test',
            'reason'       => 'Redoing practical demonstration and final evaluation.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('stage', 'Assessment Test');

        // Subsequent stages (Final Evaluation and Practical Test) must be deleted
        $this->assertDatabaseMissing('final_evaluations', [
            'applicant_id' => $applicant->applicant_id,
        ]);
        $this->assertDatabaseMissing('practical_tests', [
            'applicant_id' => $applicant->applicant_id,
        ]);

        // Prior stages (Assessment Test, Assessment, Interview) must remain intact
        $this->assertDatabaseHas('assessment_tests', [
            'applicant_id' => $applicant->applicant_id,
        ]);
        $this->assertDatabaseHas('applicant_assessments', [
            'applicant_id' => $applicant->applicant_id,
        ]);
        $this->assertDatabaseHas('interviews', [
            'applicant_id' => $applicant->applicant_id,
        ]);
    }

    public function test_non_super_admin_cannot_return_applicant_to_pipeline(): void
    {
        $regularAdmin = $this->regularAdmin();
        $jobPost = JobPost::query()->firstOrFail();

        $applicant = Applicant::create([
            'applicant_code' => Applicant::generateCode(),
            'job_post_id'    => $jobPost->job_post_id,
            'name'           => 'Unauthorized Test',
            'email'          => 'unauth@example.com',
            'status'         => 'fit',
            'stage'          => 'Practical Test',
        ]);

        $this->actingAs($regularAdmin);

        $response = $this->postJson("/api/v1/applicants/{$applicant->applicant_id}/return-to-pipeline", [
            'target_stage' => 'Screened',
            'reason'       => 'Unauthorized attempt.',
        ]);

        $response->assertForbidden();
    }
}

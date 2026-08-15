<?php

namespace Tests\Feature;

use App\Models\JobPost;
use Tests\Concerns\RefreshesSeededDatabase;
use Tests\TestCase;

class LandingTest extends TestCase
{
    use RefreshesSeededDatabase;

    public function test_company_returns_info(): void
    {
        $this->getJson('/api/v1/landing/company')
            ->assertOk()
            ->assertJsonPath('data.name', 'Oxford Suites Makati');
    }

    public function test_jobs_are_public(): void
    {
        $this->getJson('/api/v1/landing/jobs?per_page=10')
            ->assertOk()
            ->assertJsonStructure(['data' => [['job_post_id', 'title', 'department_name']], 'meta' => ['total']]);
    }

    public function test_announcements_are_public(): void
    {
        $this->getJson('/api/v1/landing/announcements')
            ->assertOk()
            ->assertJsonStructure(['data' => [['title', 'published_date']]]);
    }

    public function test_apply_creates_applicant(): void
    {
        $job = JobPost::where('active', 1)->firstOrFail();

        $this->postJson('/api/v1/landing/apply', [
            'job_post_id' => $job->job_post_id,
            'name' => 'Maria Santos',
            'email' => 'maria.santos@example.com',
            'phone' => '0917-555-6789',
        ])->assertCreated()
            ->assertJsonPath('data.job_title', $job->title);

        $this->assertDatabaseHas('applicants', [
            'email' => 'maria.santos@example.com',
            'job_post_id' => $job->job_post_id,
        ]);
    }

    public function test_apply_rejects_inactive_job(): void
    {
        $job = JobPost::where('active', 0)->firstOrFail();

        $this->postJson('/api/v1/landing/apply', [
            'job_post_id' => $job->job_post_id,
            'name' => 'Maria Santos',
            'email' => 'maria.santos@example.com',
        ])->assertStatus(422);
    }
}
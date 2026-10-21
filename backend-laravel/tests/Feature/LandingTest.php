<?php

namespace Tests\Feature;

use App\Models\JobPost;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
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
        Storage::fake('public');
        // NLP screening is external; stub it out so the applicant still saves.
        Http::fake(['*' => Http::response(['detail' => 'unavailable'], 503)]);

        $job = JobPost::where('active', 1)->firstOrFail();

        $this->post('/api/v1/landing/apply', [
            'job_post_id' => $job->job_post_id,
            'name' => 'Maria Santos',
            'email' => 'maria.santos@example.com',
            'phone' => '0917-555-6789',
            'resume' => UploadedFile::fake()->create('maria-santos.pdf', 100, 'application/pdf'),
        ])->assertCreated()
            ->assertJsonPath('data.job_title', $job->title);

        $this->assertDatabaseHas('applicants', [
            'email' => 'maria.santos@example.com',
            'job_post_id' => $job->job_post_id,
        ]);
    }

    public function test_apply_requires_a_resume(): void
    {
        $job = JobPost::where('active', 1)->firstOrFail();

        $this->postJson('/api/v1/landing/apply', [
            'job_post_id' => $job->job_post_id,
            'name' => 'No Resume',
            'email' => 'no.resume@example.com',
            'phone' => '0917-555-0000',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('resume');
    }

    public function test_apply_rejects_inactive_job(): void
    {
        Storage::fake('public');
        Http::fake(['*' => Http::response(['detail' => 'unavailable'], 503)]);

        $job = JobPost::where('active', 0)->firstOrFail();

        $this->post('/api/v1/landing/apply', [
            'job_post_id' => $job->job_post_id,
            'name' => 'Maria Santos',
            'email' => 'maria.santos@example.com',
            'resume' => UploadedFile::fake()->create('maria-santos.pdf', 100, 'application/pdf'),
        ])->assertStatus(422);
    }
}
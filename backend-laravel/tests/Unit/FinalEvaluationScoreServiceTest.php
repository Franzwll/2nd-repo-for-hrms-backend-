<?php

namespace Tests\Unit;

use Modules\ApplicantManagement\Services\FinalEvaluationScoreService;
use Tests\TestCase;

/**
 * Locks in the Final Evaluation Overall Score contract — specifically that a
 * never-screened applicant (walk-in / phone, no resume) is excluded from the
 * calculation and the remaining weights are normalized, while a genuinely
 * missing score on an applicable stage still blocks the overall.
 */
class FinalEvaluationScoreServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'applicantmanagement.final_evaluation.weights' => [
                'screening' => 20,
                'interview' => 30,
                'assessment' => 25,
                'practical' => 25,
            ],
        ]);
    }

    public function test_missing_screening_blocks_overall_when_screening_is_applicable(): void
    {
        $calc = FinalEvaluationScoreService::calculate(
            screening: null,
            interview: 80.0,
            assessment: null,
            practical: null,
            practicalRequired: false,
            assessmentRequired: false,
            screeningApplicable: true,
        );

        $this->assertFalse($calc['complete']);
        $this->assertNull($calc['overall_score']);

        $screening = collect($calc['breakdown'])->firstWhere('key', 'screening');
        $this->assertTrue($screening['applied']);
        $this->assertNull($screening['score']);
    }

    public function test_screening_excluded_when_not_applicable_normalizes_remaining_weights(): void
    {
        $calc = FinalEvaluationScoreService::calculate(
            screening: null,
            interview: 80.0,
            assessment: null,
            practical: null,
            practicalRequired: false,
            assessmentRequired: false,
            screeningApplicable: false,
        );

        $this->assertTrue($calc['complete']);
        $this->assertSame(80.0, $calc['overall_score']);
        $this->assertSame(30.0, $calc['applicable_weight']);

        $screening = collect($calc['breakdown'])->firstWhere('key', 'screening');
        $this->assertFalse($screening['applied']);
    }

    public function test_screening_not_applicable_with_practical_still_normalizes(): void
    {
        // Interview (30) + Practical (25) applicable → 80*30 + 60*25 = 3900 / 55.
        $calc = FinalEvaluationScoreService::calculate(
            screening: null,
            interview: 80.0,
            assessment: null,
            practical: 60.0,
            practicalRequired: true,
            assessmentRequired: false,
            screeningApplicable: false,
        );

        $this->assertTrue($calc['complete']);
        $this->assertSame(70.91, $calc['overall_score']);
        $this->assertSame(55.0, $calc['applicable_weight']);
    }

    public function test_full_weighting_when_every_stage_is_applicable(): void
    {
        $calc = FinalEvaluationScoreService::calculate(
            screening: 70.0,
            interview: 80.0,
            assessment: 90.0,
            practical: 60.0,
            practicalRequired: true,
            assessmentRequired: true,
            screeningApplicable: true,
        );

        $this->assertTrue($calc['complete']);
        $this->assertSame(75.5, $calc['overall_score']);

        $screening = collect($calc['breakdown'])->firstWhere('key', 'screening');
        $this->assertTrue($screening['applied']);
    }
}

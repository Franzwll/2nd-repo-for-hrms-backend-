<?php

namespace Modules\ApplicantManagement\Services;

/**
 * System-calculated Overall Score for the Final Evaluation stage.
 *
 * Single source of truth for weighting — weights come from
 * `Modules/ApplicantManagement/config/config.php` (`final_evaluation.weights`)
 * so the formula is never duplicated across controllers or the frontend.
 *
 * Positions requiring a practical test:
 *   Overall = screening*0.20 + interview*0.30 + assessment*0.25 + practical*0.25
 *
 * Positions WITHOUT a practical test normalize the applicable weights to 100%:
 *   Overall = (screening*wS + interview*wI + assessment*wA) / (wS+wI+wA)
 * Missing practical is never counted as zero.
 */
class FinalEvaluationScoreService
{
    /** @return array{screening: float, interview: float, assessment: float, practical: float} */
    public static function weights(): array
    {
        $weights = config('applicantmanagement.final_evaluation.weights', [
            'screening' => 20,
            'interview' => 30,
            'assessment' => 25,
            'practical' => 25,
        ]);

        return [
            'screening' => (float) ($weights['screening'] ?? 20),
            'interview' => (float) ($weights['interview'] ?? 30),
            'assessment' => (float) ($weights['assessment'] ?? 25),
            'practical' => (float) ($weights['practical'] ?? 25),
        ];
    }

    /**
     * Calculate the overall score + transparent breakdown.
     *
     * Disabled stages (Core HCM global switches) are excluded and the
     * remaining weights are normalized — a disabled stage is never zero.
     *
     * @param float|null $screening  0-100 or null when unavailable
     * @param float|null $interview  0-100
     * @param float|null $assessment 0-100
     * @param float|null $practical  0-100 or null when not required
     */
    public static function calculate(
        ?float $screening,
        ?float $interview,
        ?float $assessment,
        ?float $practical,
        bool $practicalRequired,
        ?bool $assessmentRequired = null
    ): array {
        $weights = self::weights();
        $assessmentRequired ??= AssessmentConfig::assessmentTestEnabled();
        $practicalRequired = $practicalRequired && AssessmentConfig::practicalTestEnabled();

        $components = [];
        $weightedSum = 0.0;
        $applicableWeight = 0.0;

        $add = function (string $key, string $label, ?float $score, float $weight, bool $applicable) use (&$components, &$weightedSum, &$applicableWeight) {
            $score = $score !== null ? (float) $score : null;
            if (! $applicable) {
                $components[] = [
                    'key' => $key,
                    'label' => $label,
                    'score' => $score,
                    'weight' => (float) $weight,
                    'applied' => false,
                    'contribution' => null,
                ];

                return;
            }
            // Applicable but missing score → overall cannot be computed.
            if ($score === null) {
                $components[] = [
                    'key' => $key,
                    'label' => $label,
                    'score' => null,
                    'weight' => (float) $weight,
                    'applied' => true,
                    'contribution' => null,
                ];

                return;
            }
            $contribution = round(($score * $weight) / 100, 2);
            $components[] = [
                'key' => $key,
                'label' => $label,
                'score' => round($score, 2),
                'weight' => (float) $weight,
                'applied' => true,
                'contribution' => $contribution,
            ];
            $weightedSum += $score * $weight;
            $applicableWeight += $weight;
        };

        $add('screening', 'Screening / Role Fit', $screening, $weights['screening'], true);
        $add('interview', 'Interview', $interview, $weights['interview'], true);
        $add('assessment', 'Assessment Test', $assessment, $weights['assessment'], $assessmentRequired);
        $add('practical', 'Practical Test', $practical, $weights['practical'], $practicalRequired);

        // Any applicable component missing → incomplete, no overall.
        foreach ($components as $c) {
            if ($c['applied'] && $c['score'] === null) {
                return [
                    'overall_score' => null,
                    'overall_score_rounded' => null,
                    'complete' => false,
                    'practical_required' => $practicalRequired,
                    'weights' => $weights,
                    'applicable_weight' => round($applicableWeight, 2),
                    'breakdown' => $components,
                ];
            }
        }

        if ($applicableWeight <= 0) {
            return [
                'overall_score' => null,
                'overall_score_rounded' => null,
                'complete' => false,
                'practical_required' => $practicalRequired,
                'weights' => $weights,
                'applicable_weight' => 0,
                'breakdown' => $components,
            ];
        }

        // Overall on a 0-100 scale. When practical is required the
        // applicable weight totals 100, otherwise the remaining weights
        // are normalized (e.g. /75) so a missing practical is never zero.
        $overall = round($weightedSum / $applicableWeight, 2);

        return [
            'overall_score' => $overall,
            'overall_score_rounded' => round($overall, 1),
            'complete' => true,
            'practical_required' => $practicalRequired,
            'weights' => $weights,
            'applicable_weight' => round($applicableWeight, 2),
            'breakdown' => $components,
        ];
    }
}

<?php

namespace Modules\ApplicantManagement\Services;

use Illuminate\Support\Collection;
use Modules\ApplicantManagement\Models\ApplicantScreening;
use Modules\ApplicantManagement\Models\ScreeningGroundTruth;

/**
 * Research evaluation support (SOP 1, 2, 3 and 5).
 *
 * Methodology notes that MUST accompany any reported result:
 *
 * SOP 3 - The four system statuses are compared against expert ground truth on
 *         the SAME four-class scale. Reported: raw confusion matrix (4x4),
 *         per-class precision/recall/F1, macro averages, overall accuracy, plus
 *         an explicitly documented binary view where only PERFECT_FOR_THE_JOB
 *         ("fit") counts as the positive "qualified" class. No other mapping is
 *         applied.
 *
 * SOP 5 - Alignment is measured between applicants.match_score computed by the
 *         system and true_qualification_score assigned independently by an HR
 *         evaluator on a 0-100 scale for the same applicant/job pair. Reported:
 *         Pearson correlation r, mean absolute error, and the paired samples.
 *
 * SOP 2 - For each screened applicant with ground truth, missing-information
 *         flags and unrecognized-skill flags are compared as sets against the
 *         expert's lists; micro-averaged precision/recall/F1 are reported over
 *         all flagged items.
 */
class EvaluationService
{
    /* ------------------------------------------------------------------ */
    /* SOP 1                                                               */
    /* ------------------------------------------------------------------ */

    public function sop1ParsingStats(): array
    {
        $byStatus = ApplicantScreening::query()
            ->selectRaw('processing_status, COUNT(*) as total')
            ->groupBy('processing_status')
            ->pluck('total', 'processing_status');

        $total = (int) $byStatus->sum();
        $processed = (int) ($byStatus['PROCESSED'] ?? 0);
        $partial = (int) ($byStatus['PARTIALLY_PROCESSED'] ?? 0);
        $failed = (int) ($byStatus['FAILED'] ?? 0);

        return [
            'definition' => 'A resume counts as successfully parsed and standardized when its '
                . 'latest screening finished with text extracted, no system failure, and a '
                . 'standardized profile generated (processing_status PROCESSED or '
                . 'PARTIALLY_PROCESSED).',
            'total_resumes_screened' => $total,
            'processed' => $processed,
            'partially_processed' => $partial,
            'failed' => $failed,
            'success_rate_percent' => $total > 0 ? round((($processed + $partial) / $total) * 100, 2) : null,
            'strict_success_rate_percent' => $total > 0 ? round(($processed / $total) * 100, 2) : null,
        ];
    }

    /* ------------------------------------------------------------------ */
    /* SOP 2                                                               */
    /* ------------------------------------------------------------------ */

    public function sop2DetectionAgreement(): array
    {
        $pairs = $this->pairedRecords();

        $tp = $fp = $fn = 0;
        $skillTp = $skillFp = $skillFn = 0;
        $compared = 0;

        foreach ($pairs as [$screening, $truth]) {
            /** @var ApplicantScreening $screening */
            /** @var ScreeningGroundTruth $truth */
            $compared++;

            $systemMissing = collect($screening->missing_information_json ?? [])->map(fn ($v) => mb_strtolower(trim($v)));
            $trueMissing = collect($truth->true_missing_information_json ?? [])->map(fn ($v) => mb_strtolower(trim($v)));

            $tp += $systemMissing->intersect($trueMissing)->count();
            $fp += $systemMissing->diff($trueMissing)->count();
            $fn += $trueMissing->diff($systemMissing)->count();

            $systemUnrecognized = collect(data_get($screening->validation_json, 'skill_analysis.unrecognized', []))
                ->map(fn ($v) => mb_strtolower(trim((string) $v)));
            $trueUnrecognized = collect($truth->true_unrecognized_skills_json ?? [])
                ->map(fn ($v) => mb_strtolower(trim((string) $v)));

            $skillTp += $systemUnrecognized->intersect($trueUnrecognized)->count();
            $skillFp += $systemUnrecognized->diff($trueUnrecognized)->count();
            $skillFn += $trueUnrecognized->diff($systemUnrecognized)->count();
        }

        return [
            'applicants_compared' => $compared,
            'missing_information_detection' => $this->prf($tp, $fp, $fn),
            'unrecognized_skill_detection' => $this->prf($skillTp, $skillFp, $skillFn),
        ];
    }

    /* ------------------------------------------------------------------ */
    /* SOP 3                                                               */
    /* ------------------------------------------------------------------ */

    public function sop3ScreeningMetrics(): array
    {
        $labels = ['fit', 'other-role', 'credential', 'not-fit'];
        $labelNames = [
            'fit' => 'Perfect for the Job',
            'other-role' => 'Fit for Other Job',
            'credential' => 'Invalid Credential',
            'not-fit' => 'Not Fitted to Job',
        ];

        // rows[true][predicted]
        $matrix = [];
        foreach ($labels as $true_) {
            foreach ($labels as $pred) {
                $matrix[$true_][$pred] = 0;
            }
        }

        $paired = 0;
        foreach ($this->pairedRecords() as [$screening, $truth]) {
            /** @var ScreeningGroundTruth $truth */
            $predicted = $screening->screening_result;
            $actual = $truth->true_screening_result;
            if (! in_array($predicted, $labels) || ! in_array($actual, $labels)) {
                continue;
            }
            $matrix[$actual][$predicted]++;
            $paired++;
        }

        if ($paired === 0) {
            return ['message' => 'No ground-truth labels recorded yet.', 'paired_applicants' => 0];
        }

        $perClass = [];
        $macroP = $macroR = $macroF = 0.0;
        foreach ($labels as $label) {
            $tp = $matrix[$label][$label];
            $fp = 0;
            $fn = 0;
            foreach ($labels as $other) {
                if ($other === $label) {
                    continue;
                }
                $fp += $matrix[$other][$label];
                $fn += $matrix[$label][$other];
            }
            $metrics = $this->prf($tp, $fp, $fn);
            $metrics['support'] = $tp + $fn;
            $perClass[$labelNames[$label]] = $metrics;
            $macroP += $metrics['precision'] ?? 0;
            $macroR += $metrics['recall'] ?? 0;
            $macroF += $metrics['f1'] ?? 0;
        }

        $correct = 0;
        $binaryTp = $binaryFp = $binaryFn = $binaryTn = 0;
        foreach ($labels as $true_) {
            $correct += $matrix[$true_][$true_];
            foreach ($labels as $pred) {
                $isTrueFit = $true_ === 'fit';
                $isPredFit = $pred === 'fit';
                if ($isTrueFit && $isPredFit) {
                    $binaryTp++;
                } elseif (! $isTrueFit && $isPredFit) {
                    $binaryFp++;
                } elseif ($isTrueFit && ! $isPredFit) {
                    $binaryFn++;
                } else {
                    $binaryTn++;
                }
            }
        }

        return [
            'methodology' => 'System screening_result vs expert true_screening_result on the same '
                . 'four official classes. Binary qualified-view treats ONLY Perfect for the Job '
                . '(fit) as positive.',
            'paired_applicants' => $paired,
            'confusion_matrix' => ['rows_actual_columns_predicted' => $matrix],
            'accuracy' => $paired > 0 ? round(($correct / $paired) * 100, 2) : null,
            'per_class_metrics' => $perClass,
            'macro_average' => [
                'precision' => round(($macroP / count($labels)) * 100, 2),
                'recall' => round(($macroR / count($labels)) * 100, 2),
                'f1' => round(($macroF / count($labels)) * 100, 2),
            ],
            'binary_qualified_view' => $this->prfBinary($binaryTp, $binaryFp, $binaryFn, $binaryTn),
        ];
    }

    /* ------------------------------------------------------------------ */
    /* SOP 5                                                               */
    /* ------------------------------------------------------------------ */

    public function sop5ScoreAlignment(): array
    {
        $pairs = ApplicantScreening::query()
            ->join('screening_ground_truths', function ($join) {
                $join->on('applicant_screenings.applicant_id', '=', 'screening_ground_truths.applicant_id')
                     ->on('applicant_screenings.job_post_id', '=', 'screening_ground_truths.job_post_id');
            })
            ->whereNotNull('applicant_screenings.match_score')
            ->whereNotNull('screening_ground_truths.true_qualification_score')
            ->get([
                'applicant_screenings.applicant_id',
                'applicant_screenings.match_score',
                'screening_ground_truths.true_qualification_score',
            ]);

        $n = $pairs->count();
        if ($n < 2) {
            return [
                'message' => 'At least two paired samples with both computed and expert scores are required.',
                'paired_samples' => $n,
            ];
        }

        $xs = $pairs->pluck('match_score')->map(fn ($v) => (float) $v);
        $ys = $pairs->pluck('true_qualification_score')->map(fn ($v) => (float) $v);
        $meanX = $xs->avg();
        $meanY = $ys->avg();

        $cov = 0.0;
        $varX = 0.0;
        $varY = 0.0;
        $absErrorSum = 0.0;
        foreach ($xs->zip($ys) as [$x, $y]) {
            $cov += (($x - $meanX) * ($y - $meanY));
            $varX += pow($x - $meanX, 2);
            $varY += pow($y - $meanY, 2);
            $absErrorSum += abs($x - $y);
        }

        $pearson = ($varX > 0 && $varY > 0) ? $cov / sqrt($varX * $varY) : null;

        return [
            'methodology' => 'Pearson correlation between the computed role-specific match score '
                . 'and the independent HR-assigned qualification score (0-100) for the same '
                . 'applicant/job pair, plus mean absolute error.',
            'paired_samples' => $n,
            'pearson_r' => $pearson !== null ? round($pearson, 4) : null,
            'r_squared' => $pearson !== null ? round($pearson * $pearson, 4) : null,
            'mean_absolute_error' => round($absErrorSum / $n, 2),
            'samples' => $pairs->toArray(),
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    /** @return Collection<int, array{0: ApplicantScreening, 1: ScreeningGroundTruth}> */
    protected function pairedRecords(): Collection
    {
        $truths = ScreeningGroundTruth::all()->keyBy('applicant_id');
        $screenings = ApplicantScreening::whereIn('applicant_id', $truths->keys())
            ->orderByDesc('screening_id')
            ->get()
            ->unique('applicant_id');

        return $screenings
            ->map(fn ($screening) => [$screening, $truths->get($screening->applicant_id)])
            ->filter(fn ($pair) => $pair[1] !== null)
            ->values();
    }

    protected function prf(int $tp, int $fp, int $fn): array
    {
        return [
            'precision' => ($tp + $fp) > 0 ? round($tp / ($tp + $fp), 4) : null,
            'recall' => ($tp + $fn) > 0 ? round($tp / ($tp + $fn), 4) : null,
            'f1' => ($tp + $fp) > 0 && ($tp + $fn) > 0 && ($tp > 0 || $fp > 0)
                ? round(2 * $tp / (2 * $tp + $fp + $fn), 4)
                : null,
            'true_positives' => $tp,
            'false_positives' => $fp,
            'false_negatives' => $fn,
        ];
    }

    protected function prfBinary(int $tp, int $fp, int $fn, int $tn): array
    {
        $out = $this->prf($tp, $fp, $fn);
        $out['true_negatives'] = $tn;
        $out['accuracy'] = ($tp + $tn + $fp + $fn) > 0
            ? round((($tp + $tn) / ($tp + $tn + $fp + $fn)) * 100, 2)
            : null;

        return $out;
    }
}

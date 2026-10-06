<?php

/**
 * Re-insert / reset Adrian Luis Navarro (Chief Concierge) from the reference folder.
 *
 * Source: <repo>/reference/resume + supporting document/Adrian Luis Navarro - Chief Concierge and Head of Guest Experience/
 * Live row: applicants.applicant_id = 84 (email adrian.navarro.concierge@outlook.ph, job_post_id 19)
 *
 * What it does:
 *  1. Verifies the 7 key source files exist (resume PDF + 6 supporting PDFs).
 *  2. Verifies each stored file (resumes/* + applicant-documents/*) exists on disk;
 *     restores any missing stored file by copying from the source folder (same stored path).
 *  3. Deletes downstream stage-progression rows for applicant 84
 *     (practical_tests, assessment_tests, applicant_assessments, interviews,
 *      final_evaluations, new_hires, screening_ground_truths) — preserves
 *      applicant_screenings/entities/scores + applicant_documents.
 *  4. Resets applicants.stage = 'Screened' (keeps status/fit_score/screening).
 *  5. Best-effort: re-verifies each supporting document via DocumentVerificationService
 *     (skipped gracefully when NLP unreachable — rows keep prior status).
 *
 * Run: php _reinsert_adrian_concierge.php [--skip-verify]
 */

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Modules\ApplicantManagement\Models\Applicant;

$skipVerify = in_array('--skip-verify', $argv ?? [], true);

$repoRoot = dirname(__DIR__);
$srcDir = $repoRoot . DIRECTORY_SEPARATOR . 'reference' . DIRECTORY_SEPARATOR . 'resume + supporting document'
    . DIRECTORY_SEPARATOR . 'Adrian Luis Navarro - Chief Concierge and Head of Guest Experience';

$expectedSource = [
    'Adrian_Luis_Navarro_Resume.pdf',
    'Adrian_Luis_Navarro_COE_Current_Employer.pdf',
    'Adrian_Luis_Navarro_COE_Previous_Employer.pdf',
    'Adrian_Luis_Navarro_Diploma.pdf',
    'Adrian_Luis_Navarro_Training_Certificate_FoodSafety.pdf',
    'Adrian_Luis_Navarro_Training_Certificate_Service.pdf',
    'Adrian_Luis_Navarro_Incomplete_Certificate.pdf',
];

echo "============================================================\n";
echo " Re-insert Adrian Luis Navarro (Chief Concierge)\n";
echo "============================================================\n\n";

// 1. Source check
foreach ($expectedSource as $f) {
    $abs = $srcDir . DIRECTORY_SEPARATOR . $f;
    if (!is_file($abs)) {
        echo "ERROR — source file missing: {$abs}\n";
        exit(1);
    }
    echo '  source OK: ' . $f . ' (' . filesize($abs) . " bytes)\n";
}
echo "\n";

// 2. Live row lookup
$applicant = Applicant::with('documents')->where('email', 'adrian.navarro.concierge@outlook.ph')->first();
if (!$applicant) {
    echo "ERROR — no applicants row with email adrian.navarro.concierge@outlook.ph\n";
    exit(1);
}
echo '  applicant #' . $applicant->applicant_id . ' ' . $applicant->name
    . " stage={$applicant->stage} status={$applicant->status} fit={$applicant->fit_score}"
    . " job_post_id={$applicant->job_post_id}\n";
echo '  resume: ' . $applicant->resume_file_path . ' (' . $applicant->resume_original_name . ")\n";
echo '  docs: ' . $applicant->documents->count() . "\n\n";

$sourceByOriginal = [];
foreach ($expectedSource as $f) {
    $sourceByOriginal[$f] = $srcDir . DIRECTORY_SEPARATOR . $f;
}

// 3. Stored-file check + restore-if-missing (outside tx so copies persist)
$restored = 0;
$checkPaths = [['label' => 'resume', 'rel' => $applicant->resume_file_path, 'orig' => $applicant->resume_original_name]];
foreach ($applicant->documents as $d) {
    $checkPaths[] = ['label' => 'doc#' . $d->applicant_document_id, 'rel' => $d->file_path, 'orig' => $d->original_name];
}
foreach ($checkPaths as $c) {
    $abs = storage_path('app/public/' . $c['rel']);
    if (is_file($abs)) {
        echo '  stored OK [' . $c['label'] . ']: ' . $c['rel'] . ' (' . filesize($abs) . " bytes)\n";
        continue;
    }
    $src = $sourceByOriginal[$c['orig']] ?? null;
    if (!$src || !is_file($src)) {
        echo '  ERROR — stored file missing and no source to restore from [' . $c['label'] . ']: ' . $c['rel'] . " (orig {$c['orig']})\n";
        exit(1);
    }
    if (!is_dir(dirname($abs))) {
        mkdir(dirname($abs), 0777, true);
    }
    copy($src, $abs);
    $restored++;
    echo '  restored [' . $c['label'] . ']: ' . $c['rel'] . ' <- ' . basename($src) . "\n";
}
echo $restored === 0 ? "  No restores needed — all stored files present.\n\n" : "  Restored {$restored} file(s).\n\n";

// 4. Delete downstream progression + reset stage (transaction)
$progressionTables = [
    'practical_tests',
    'assessment_tests',
    'applicant_assessments',
    'interviews',
    'final_evaluations',
    'new_hires',
    'screening_ground_truths',
];

DB::beginTransaction();
try {
    $aid = $applicant->applicant_id;
    foreach ($progressionTables as $t) {
        try {
            $n = DB::table($t)->where('applicant_id', $aid)->delete();
        } catch (Throwable $e) {
            echo "  note: {$t} skipped ({$e->getMessage()})\n";
            $n = 0;
        }
        if ($n > 0) {
            echo "  deleted {$n} row(s) from {$t}\n";
        }
    }
    DB::table('applicants')->where('applicant_id', $aid)->update([
        'stage' => 'Screened',
        'updated_at' => now(),
    ]);
    echo "  stage reset to 'Screened' for applicant #{$aid}\n";
    DB::commit();
    echo "Transaction committed.\n\n";
} catch (Throwable $e) {
    DB::rollBack();
    echo 'ERROR — transaction rolled back: ' . $e->getMessage() . "\n";
    exit(1);
}

// 5. Best-effort document re-verification
if ($skipVerify) {
    echo "Skipped document re-verification (--skip-verify).\n";
} else {
    echo "--- Re-verifying supporting documents (best-effort) ---\n";
    $model = Applicant::with('documents')->find($applicant->applicant_id);
    foreach ($model->documents as $doc) {
        try {
            app(\Modules\ApplicantManagement\Services\DocumentVerificationService::class)->verifyDocument($doc);
            echo '  doc #' . $doc->applicant_document_id . ' [' . $doc->doc_type . '] '
                . $doc->original_name . ' => ' . $doc->refresh()->verification_status . "\n";
        } catch (Throwable $e) {
            echo '  doc #' . $doc->applicant_document_id . ': verification skipped (' . mb_substr($e->getMessage(), 0, 160) . ")\n";
        }
    }
    echo "\n";
}

echo "===== FINAL STATE =====\n";
$final = DB::table('applicants')->where('applicant_id', $applicant->applicant_id)->first();
echo json_encode([
    'applicant_id' => $final->applicant_id,
    'applicant_code' => $final->applicant_code,
    'name' => $final->name,
    'email' => $final->email,
    'job_post_id' => $final->job_post_id,
    'stage' => $final->stage,
    'status' => $final->status,
    'fit_score' => $final->fit_score,
    'resume_file_path' => $final->resume_file_path,
    'docs' => DB::table('applicant_documents')->where('applicant_id', $final->applicant_id)->count(),
]) . "\n";
foreach (DB::table('applicant_documents')->where('applicant_id', $final->applicant_id)->orderBy('applicant_document_id')->get() as $d) {
    echo json_encode([
        'id' => $d->applicant_document_id, 'type' => $d->doc_type,
        'orig' => $d->original_name, 'verification' => $d->verification_status,
    ]) . "\n";
}
foreach (['interviews', 'applicant_assessments', 'assessment_tests', 'practical_tests', 'final_evaluations'] as $t) {
    echo $t . ' for84=' . DB::table($t)->where('applicant_id', $final->applicant_id)->count() . "\n";
}
echo "Done.\n";

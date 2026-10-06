<?php

/**
 * Reset & re-insert the 6 "new2" applicants with ONLY the "Screened" stage.
 *
 * 1. Finds every existing applicant row whose name matches one of the 6
 *    new2 applicants (case-insensitive) — no duplicate names allowed.
 * 2. Captures the screening artifacts (applicant_screenings, entities, scores)
 *    so the NLP screening results are preserved.
 * 3. Deletes ALL stage-progression data (interviews, assessments, tests,
 *    final evaluations, notifications) for those applicants.
 * 4. Deletes the applicant rows.
 * 5. Re-inserts each applicant FRESH with stage = 'Screened', a new
 *    applicant_code, a newly stored resume file (copied from the
 *    reference/RESUME/new2 folders), and the preserved screening artifacts.
 *
 * Run: php _reset_new2_applicants.php
 */

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$repoRoot = dirname(__DIR__);
$new2Root = $repoRoot . DIRECTORY_SEPARATOR . 'reference' . DIRECTORY_SEPARATOR . 'RESUME' . DIRECTORY_SEPARATOR . 'new2';

/**
 * The 6 new2 applicants. job_post_id / email / phone come from the resume
 * screening that was previously performed for each (kept identical so the
 * data stays consistent with the screening service output).
 */
$applicantDefs = [
    [
        'name'        => 'Adrian Miguel Villanueva',
        'folder'      => 'Adrian Miguel Villanueva - Hospitality Resume Variations',
        'resume_pdf'  => 'Adrian_Miguel_Villanueva_Hotel_Sales_Supervisor.pdf',
        'job_post_id' => 15, // Guest Relations Officer (closest open post to Hotel Sales Supervisor)
        'email'       => 'adrian.villanueva.sales@gmail.com',
        'phone'       => '09173456712',
        'source'      => 'Online Portal',
    ],
    [
        'name'        => 'Bianca Nicole Castillo',
        'folder'      => 'Bianca Nicole Castillo - Hospitality Resume Variations',
        'resume_pdf'  => 'Bianca_Nicole_Castillo_Hotel_Reservations_Supervisor.pdf',
        'job_post_id' => 16, // Front Desk Receptionist (closest open post to Hotel Reservations Supervisor)
        'email'       => 'bianca.castillo.hospitality@gmail.com',
        'phone'       => '09175423186',
        'source'      => 'Online Portal',
    ],
    [
        'name'        => 'Camille Rose Evangelista',
        'folder'      => 'Camille Rose Evangelista - Hospitality Resume Variations',
        'resume_pdf'  => 'Camille_Rose_Evangelista_Resort_Spa_Operations_Supervisor.pdf',
        'job_post_id' => 15, // Guest Relations Officer (closest open post to Resort Spa Operations Supervisor)
        'email'       => 'camille.evangelista.spa@gmail.com',
        'phone'       => '09953182647',
        'source'      => 'Online Portal',
    ],
    [
        'name'        => 'Gabriel Thomas Reyes',
        'folder'      => 'Gabriel Thomas Reyes - Hospitality Resume Variations',
        'resume_pdf'  => 'Gabriel_Thomas_Reyes_Hotel_Engineering_Supervisor.pdf',
        'job_post_id' => 3, // Housekeeping Attendant (closest open post to Hotel Engineering Supervisor)
        'email'       => 'gabriel.reyes.engineering@gmail.com',
        'phone'       => '09395288871',
        'source'      => 'Online Portal',
    ],
    [
        'name'        => 'Nathaniel James Mercado',
        'folder'      => 'Nathaniel James Mercado - Hospitality Resume Variations',
        'resume_pdf'  => 'Nathaniel_James_Mercado_Hotel_Kitchen_Operations_Supervisor.pdf',
        'job_post_id' => 2, // Line Cook (closest open post to Hotel Kitchen Operations Supervisor)
        'email'       => 'nathaniel.mercado.culinary@gmail.com',
        'phone'       => '09286714459',
        'source'      => 'Online Portal',
    ],
    [
        'name'        => 'Sofia Beatriz Mendoza',
        'folder'      => 'Sofia Beatriz Mendoza - Hospitality Resume Variations',
        'resume_pdf'  => 'Sofia_Beatriz_Mendoza_Hotel_Human_Resources_Supervisor.pdf',
        'job_post_id' => 6, // HR Assistant (closest open post to Hotel Human Resources Supervisor)
        'email'       => 'sofia.mendoza.hrhospitality@gmail.com',
        'phone'       => '09286714423',
        'source'      => 'Online Portal',
    ],
];

$screeningArtifactTables = [
    'applicant_screenings'         => 'screening_id',
    'applicant_screening_entities' => 'entity_id',
    'applicant_screening_scores'   => 'score_id',
];

$stageProgressionTables = [
    'interviews',
    'applicant_assessments',
    'assessment_tests',
    'practical_tests',
    'final_evaluations',
    'applicant_documents',
    'screening_ground_truths',
    'new_hires',
];

echo "============================================================\n";
echo " Reset & re-insert new2 applicants (stage = 'Screened' only)\n";
echo "============================================================\n\n";

$deletedOldResumePaths = [];
$summary = [];

DB::beginTransaction();

try {
    foreach ($applicantDefs as $i => $def) {
        $name = $def['name'];
        echo "--- {$name} ---\n";

        // 1. Find ALL existing rows with this name (no duplicates allowed)
        $existing = DB::table('applicants')
            ->whereRaw('LOWER(TRIM(name)) = ?', [strtolower($name)])
            ->orderBy('applicant_id')
            ->get();

        if ($existing->isNotEmpty()) {
            echo "  Found " . $existing->count() . " existing row(s): "
                . $existing->pluck('applicant_id')->implode(', ') . "\n";
        } else {
            echo "  No existing row found — will insert fresh.\n";
        }

        $oldIds = $existing->pluck('applicant_id')->all();

        // Screening-derived fields to carry over (defaults if no prior row)
        $carried = [
            'job_post_id' => $def['job_post_id'],
            'email'       => $def['email'],
            'phone'       => $def['phone'],
            'source'      => $def['source'],
            'fit_score'   => null,
            'status'      => 'fit',
            'summary'     => null,
            'flags_json'  => json_encode([]),
        ];
        $oldResumePath = null;
        $oldResumeOriginalName = $def['resume_pdf'];

        // 2. Capture screening artifacts before deleting
        $artifacts = [];
        if ($oldIds) {
            foreach ($screeningArtifactTables as $table => $pk) {
                $rows = DB::table($table)->whereIn('applicant_id', $oldIds)->get();
                $artifacts[$table] = $rows->map(function ($r) {
                    $arr = (array) $r;
                    unset($arr['screening_id'], $arr['entity_id'], $arr['score_id'], $arr['applicant_id']);
                    return $arr;
                })->all();
                echo "  Captured " . count($artifacts[$table]) . " row(s) from {$table}\n";
            }

            $latest = $existing->last();
            $carried['job_post_id']  = $latest->job_post_id;
            $carried['email']        = $latest->email;
            $carried['phone']        = $latest->phone;
            $carried['source']       = $latest->source;
            $carried['fit_score']    = $latest->fit_score;
            $carried['status']       = $latest->status;
            $carried['summary']      = $latest->summary;
            $carried['flags_json']   = $latest->flags_json;
            $oldResumePath           = $latest->resume_file_path;
            $oldResumeOriginalName = $latest->resume_original_name ?? $def['resume_pdf'];
        } else {
            // nothing captured
        }

        // 3. Delete stage-progression rows, stale notifications, then applicants
        if ($oldIds) {
            foreach ($stageProgressionTables as $table) {
                $deleted = DB::table($table)->whereIn('applicant_id', $oldIds)->delete();
                if ($deleted > 0) {
                    echo "  Deleted {$deleted} row(s) from {$table}\n";
                }
            }

            $deletedNotifs = DB::table('notifications')
                ->where(function ($q) use ($oldIds, $name) {
                    $q->where(function ($q2) use ($oldIds) {
                        $q2->where('target_type', 'Applicant')
                           ->whereIn('target_id', array_map('strval', $oldIds));
                    });
                    $q->orWhere('title', 'like', '%' . $name . '%')
                      ->orWhere('body', 'like', '%' . $name . '%');
                })
                ->delete();
            if ($deletedNotifs > 0) {
                echo "  Deleted {$deletedNotifs} stale notification(s)\n";
            }

            DB::table('applicants')->whereIn('applicant_id', $oldIds)->delete();
            echo "  Deleted " . count($oldIds) . " applicant row(s)\n";
        }

        // 4. Store a fresh copy of the resume PDF
        $srcPdf = $new2Root . DIRECTORY_SEPARATOR . $def['folder'] . DIRECTORY_SEPARATOR . $def['resume_pdf'];
        if (!is_file($srcPdf)) {
            throw new RuntimeException("Resume PDF not found: {$srcPdf}");
        }
        $newFileName = Str::random(40) . '.pdf';
        $destPath    = storage_path('app/public/resumes/' . $newFileName);
        if (!is_dir(dirname($destPath))) {
            mkdir(dirname($destPath), 0777, true);
        }
        copy($srcPdf, $destPath);
        if (!is_file($destPath)) {
            throw new RuntimeException("Failed to copy resume to {$destPath}");
        }
        echo "  Stored fresh resume: resumes/{$newFileName}\n";

        // 5. Insert the fresh applicant row — stage = 'Screened' ONLY
        $appliedAt = Carbon::now()->addMinutes($i);

        $newId = DB::table('applicants')->insertGetId([
            'applicant_code'       => \Modules\ApplicantManagement\Models\Applicant::generateCode(),
            'job_post_id'          => $carried['job_post_id'],
            'name'                 => $name,
            'email'                => $carried['email'],
            'phone'                => $carried['phone'],
            'applied_at'           => $appliedAt,
            'fit_score'            => $carried['fit_score'],
            'status'               => $carried['status'],
            'stage'                => 'Screened',
            'source'               => $carried['source'],
            'resume_file_path'     => 'resumes/' . $newFileName,
            'resume_original_name' => $oldResumeOriginalName,
            'summary'              => $carried['summary'],
            'flags_json'           => $carried['flags_json'],
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);
        echo "  Inserted new applicant #{$newId} with stage='Screened'\n";

        // 6. Re-attach the preserved screening artifacts to the new row
        foreach ($artifacts as $table => $rows) {
            foreach ($rows as $row) {
                $row['applicant_id'] = $newId;
                $row['created_at']   = $row['created_at'] ?? now();
                if ($table === 'applicant_screenings') {
                    $row['updated_at'] = now();
                }
                DB::table($table)->insert($row);
            }
            echo "  Re-attached " . count($rows) . " row(s) into {$table}\n";
        }

        // Track the old resume file for cleanup (only if no other row uses it)
        if ($oldResumePath && !DB::table('applicants')->where('resume_file_path', $oldResumePath)->exists()) {
            $deletedOldResumePaths[] = $oldResumePath;
        }

        $summary[] = [
            'id'        => $newId,
            'name'      => $name,
            'stage'     => 'Screened',
            'fit_score' => $carried['fit_score'],
            'status'    => $carried['status'],
        ];

        echo "\n";
    }

    DB::commit();
    echo "Transaction committed.\n\n";

    // Clean up orphaned old resume files (best effort, outside transaction)
    foreach ($deletedOldResumePaths as $rel) {
        $abs = storage_path('app/public/' . $rel);
        if (is_file($abs)) {
            @unlink($abs);
            echo "Removed orphaned resume file: {$rel}\n";
        }
    }

    // 7. Final verification — no duplicates, everyone at Screened
    echo "\n===== FINAL STATE =====\n";
    $names = array_column($applicantDefs, 'name');
    $final = DB::table('applicants')
        ->where(function ($q) use ($names) {
            foreach ($names as $n) {
                $q->orWhereRaw('LOWER(TRIM(name)) = ?', [strtolower($n)]);
            }
        })
        ->orderBy('applicant_id')
        ->get(['applicant_id', 'applicant_code', 'name', 'stage', 'status', 'fit_score', 'resume_file_path', 'resume_original_name']);

    foreach ($final as $row) {
        echo json_encode((array) $row) . "\n";
    }

    $dupes = $final->groupBy(function ($r) {
        return strtolower(trim($r->name));
    })->filter(function ($g) {
        return $g->count() > 1;
    });
    echo "\nDuplicate names: " . ($dupes->isEmpty() ? 'NONE (OK)' : implode(', ', $dupes->keys()->all())) . "\n";

    $nonScreened = $final->filter(function ($r) {
        return $r->stage !== 'Screened';
    });
    echo "Non-Screened stages: " . ($nonScreened->isEmpty() ? 'NONE (OK)' : $nonScreened->pluck('name')->implode(', ')) . "\n";

    foreach ($summary as $s) {
        echo "Inserted: #{$s['id']} {$s['name']} — stage={$s['stage']}, status={$s['status']}, fit={$s['fit_score']}\n";
    }
} catch (Throwable $e) {
    DB::rollBack();
    echo "ERROR — transaction rolled back: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

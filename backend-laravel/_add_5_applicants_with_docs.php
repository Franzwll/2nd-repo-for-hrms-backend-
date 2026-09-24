<?php

/**
 * Add 5 applicants, each with a resume file + supporting documents.
 *
 * For every applicant the script:
 *  1. Skips the row when the e-mail already exists (no duplicates).
 *  2. Copies the resume PDF into storage/app/public/resumes/.
 *  3. Inserts the applicant row with stage = 'Screened', status = 'fit'.
 *  4. Copies each supporting file into storage/app/public/applicant-documents/
 *     and inserts an applicant_documents row (verification_status = PENDING).
 *  5. Best-effort: runs the spaCy NLP screening for the new applicant and
 *     then verifies each supporting document (both are skipped gracefully
 *     when the NLP service is unreachable — rows stay PENDING).
 *
 * Source files live under <repo>/reference/RESUME/:
 *  - Jerome / Marcus / Patricia: Hotel_Restaurant_Hospitality_Verification_Dataset_4
 *    (resume + COEs + diploma + certifications).
 *  - Danielle / Angelica: new/<... Hospitality Resume Variations>
 *    (resume PDF + alternate resume renders as supporting evidence).
 *
 * Run: php _add_5_applicants_with_docs.php
 */

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\ApplicantManagement\Models\Applicant;

$refRoot = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'reference' . DIRECTORY_SEPARATOR . 'RESUME';
$verRoot = $refRoot . DIRECTORY_SEPARATOR . 'Hotel_Restaurant_Hospitality_Verification_Dataset_4';
$newRoot = $refRoot . DIRECTORY_SEPARATOR . 'new';

$applicantDefs = [
    [
        'name'          => 'Jerome Vincent Alonzo',
        'email'         => 'jerome.alonzo@resortmobility.ph',
        'phone'         => '+63 908 772 1655',
        'job_post_id'   => 15, // Guest Relations Officer (guest mobility / transport background)
        'source'        => 'Online Portal',
        'summary'       => 'Guest mobility and hotel transportation supervisor with shuttle operations, airport transfer and arrival-services experience.',
        'resume_src'    => $verRoot . DIRECTORY_SEPARATOR . 'Jerome Vincent Alonzo - Hospitality Resume and Documents'
            . DIRECTORY_SEPARATOR . 'Jerome_Vincent_Alonzo_Hotel_Transportation_Services_Supervisor.pdf',
        'docs'          => [
            ['file' => 'Jerome_Vincent_Alonzo_COE_01.pdf', 'doc_type' => 'COE', 'title' => 'Certificate of Employment — current employer', 'original_copy' => true],
            ['file' => 'Jerome_Vincent_Alonzo_COE_02.pdf', 'doc_type' => 'COE', 'title' => 'Certificate of Employment — previous employer', 'original_copy' => false],
            ['file' => 'Jerome_Vincent_Alonzo_Diploma.pdf', 'doc_type' => 'Credential', 'title' => 'Academic Diploma', 'original_copy' => true],
            ['file' => 'Jerome_Vincent_Alonzo_Professional_Certification.pdf', 'doc_type' => 'Certificate', 'title' => 'Professional Certification', 'original_copy' => true],
            ['file' => 'Jerome_Vincent_Alonzo_Training_Certificate_01.pdf', 'doc_type' => 'Certificate', 'title' => 'Training Certificate', 'original_copy' => false],
        ],
        'docs_folder'   => $verRoot . DIRECTORY_SEPARATOR . 'Jerome Vincent Alonzo - Hospitality Resume and Documents',
    ],
    [
        'name'          => 'Marcus Elijah Navarro',
        'email'         => 'marcus.navarro@hospitalitymail.ph',
        'phone'         => '+63 917 554 2891',
        'job_post_id'   => 18, // Floor Supervisor (banquet operations supervision)
        'source'        => 'Online Portal',
        'summary'       => 'Banquet Operations Supervisor with 7+ years across large-scale corporate conferences, state banquets and wedding receptions.',
        'resume_src'    => $verRoot . DIRECTORY_SEPARATOR . 'Marcus Elijah Navarro - Hospitality Resume and Documents'
            . DIRECTORY_SEPARATOR . 'Marcus_Elijah_Navarro_Banquet_Operations_Supervisor.pdf',
        'docs'          => [
            ['file' => 'Marcus_Elijah_Navarro_COE_01.pdf', 'doc_type' => 'COE', 'title' => 'Certificate of Employment — Grand Crest Hotel & Suites', 'original_copy' => true],
            ['file' => 'Marcus_Elijah_Navarro_COE_02.pdf', 'doc_type' => 'COE', 'title' => 'Certificate of Employment — Harborview Hotel & Convention Center', 'original_copy' => false],
            ['file' => 'Marcus_Elijah_Navarro_Diploma.pdf', 'doc_type' => 'Credential', 'title' => 'BS Hospitality Management Diploma', 'original_copy' => true],
            ['file' => 'Marcus_Elijah_Navarro_Professional_Certification.pdf', 'doc_type' => 'Certificate', 'title' => 'Certified Hospitality Banquet Professional (CHBP)', 'original_copy' => false],
            ['file' => 'Marcus_Elijah_Navarro_Training_Certificate_01.pdf', 'doc_type' => 'Certificate', 'title' => 'Advanced Food Safety and HACCP Principles Workshop', 'original_copy' => false],
        ],
        'docs_folder'   => $verRoot . DIRECTORY_SEPARATOR . 'Marcus Elijah Navarro - Hospitality Resume and Documents',
    ],
    [
        'name'          => 'Patricia Elaine Ramos',
        'email'         => 'patricia.ramos@procuremail.ph',
        'phone'         => '+63 928 412 9034',
        'job_post_id'   => 19, // Floor Supervisor (purchasing / inventory supervision)
        'source'        => 'Online Portal',
        'summary'       => 'Hotel Purchasing Supervisor managing multimillion-peso procurement budgets, vendor negotiations and inventory replenishment.',
        'resume_src'    => $verRoot . DIRECTORY_SEPARATOR . 'Patricia Elaine Ramos - Hospitality Resume and Documents'
            . DIRECTORY_SEPARATOR . 'Patricia_Elaine_Ramos_Hotel_Purchasing_Supervisor.pdf',
        'docs'          => [
            ['file' => 'Patricia_Elaine_Ramos_COE_01.pdf', 'doc_type' => 'COE', 'title' => 'Certificate of Employment — Bayfront Grand Hotel Manila', 'original_copy' => true],
            ['file' => 'Patricia_Elaine_Ramos_COE_02.pdf', 'doc_type' => 'COE', 'title' => 'Certificate of Employment — Sapphire Bay Resort & Casino', 'original_copy' => false],
            ['file' => 'Patricia_Elaine_Ramos_Diploma.pdf', 'doc_type' => 'Credential', 'title' => 'Academic Diploma', 'original_copy' => true],
            ['file' => 'Patricia_Elaine_Ramos_Professional_Certification.pdf', 'doc_type' => 'Certificate', 'title' => 'Certified Hospitality Procurement Specialist (CHPS)', 'original_copy' => true],
            ['file' => 'Patricia_Elaine_Ramos_Training_Certificate_01.pdf', 'doc_type' => 'Certificate', 'title' => 'Strategic Vendor Sourcing & Contract Negotiation Masterclass', 'original_copy' => false],
        ],
        'docs_folder'   => $verRoot . DIRECTORY_SEPARATOR . 'Patricia Elaine Ramos - Hospitality Resume and Documents',
    ],
    [
        'name'          => 'Danielle Faith Mercado',
        'email'         => 'danielle.mercado.sales@mailhaven.ph',
        'phone'         => '+63 919 285 7731',
        'job_post_id'   => 15, // Guest Relations Officer (hotel sales & events background)
        'source'        => 'Online Portal',
        'summary'       => 'Hotel Sales and Events Supervisor growing corporate accounts and coordinating event bookings for a full-service city hotel.',
        'resume_src'    => $newRoot . DIRECTORY_SEPARATOR . 'Danielle Faith Mercado - Hospitality Resume Variations'
            . DIRECTORY_SEPARATOR . 'Danielle_Faith_Mercado_Hotel_Sales_Events_Supervisor.pdf',
        'docs'          => [
            ['file' => 'Danielle_Faith_Mercado_Hospitality_Corporate_Sales_Coordinator.docx', 'doc_type' => 'Others', 'title' => 'Corporate Sales Coordinator resume — supporting copy', 'original_copy' => false],
            ['file' => 'Danielle_Faith_Mercado_Catering_Banquet_Sales_Coordinator.jpg', 'doc_type' => 'Others', 'title' => 'Catering & Banquet Sales resume — supporting copy', 'original_copy' => false],
            ['file' => 'Danielle_Faith_Mercado_Hotel_Events_Sales_Officer.png', 'doc_type' => 'Others', 'title' => 'Events Sales Officer resume — supporting copy', 'original_copy' => false],
        ],
        'docs_folder'   => $newRoot . DIRECTORY_SEPARATOR . 'Danielle Faith Mercado - Hospitality Resume Variations',
    ],
    [
        'name'          => 'Angelica Therese Navarro',
        'email'         => 'angelica.navarro.guestrelations@gmail.com',
        'phone'         => '0928-511-7742',
        'job_post_id'   => 16, // Front Desk Receptionist (guest relations background)
        'source'        => 'Online Portal',
        'summary'       => 'Guest-focused Restaurant Guest Relations Supervisor with 6+ years in service recovery, guest feedback programs and front-of-house coaching.',
        'resume_src'    => $newRoot . DIRECTORY_SEPARATOR . 'Angelica Therese Navarro - Hospitality Resume Variations'
            . DIRECTORY_SEPARATOR . 'Angelica_Therese_Navarro_Restaurant_Guest_Relations_Supervisor.pdf',
        'docs'          => [
            ['file' => 'Angelica_Therese_Navarro_Customer_Experience_Coordinator.docx', 'doc_type' => 'Others', 'title' => 'Customer Experience Coordinator resume — supporting copy', 'original_copy' => false],
            ['file' => 'Angelica_Therese_Navarro_Dining_Service_Supervisor.png', 'doc_type' => 'Others', 'title' => 'Dining Service Supervisor resume — supporting copy', 'original_copy' => false],
            ['file' => 'Angelica_Therese_Navarro_Guest_Experience_Officer.jpg', 'doc_type' => 'Others', 'title' => 'Guest Experience Officer resume — supporting copy', 'original_copy' => false],
        ],
        'docs_folder'   => $newRoot . DIRECTORY_SEPARATOR . 'Angelica Therese Navarro - Hospitality Resume Variations',
    ],
];

echo "============================================================\n";
echo " Add 5 applicants with resumes + supporting documents\n";
echo "============================================================\n\n";

$insertedIds = [];

DB::beginTransaction();

try {
    foreach ($applicantDefs as $i => $def) {
        echo "--- {$def['name']} ---\n";

        $duplicate = DB::table('applicants')->where('email', $def['email'])->first();
        if ($duplicate) {
            echo "  SKIP — e-mail {$def['email']} already used by applicant #{$duplicate->applicant_id} ({$duplicate->name}).\n\n";
            continue;
        }

        $job = DB::table('job_posts')->where('job_post_id', $def['job_post_id'])->first();
        if (! $job) {
            throw new RuntimeException("Job post {$def['job_post_id']} not found for {$def['name']}.");
        }
        echo "  Job post: #{$job->job_post_id} {$job->title} ({$job->status})\n";

        if (! is_file($def['resume_src'])) {
            throw new RuntimeException("Resume file not found: {$def['resume_src']}");
        }
        foreach ($def['docs'] as $doc) {
            $abs = $def['docs_folder'] . DIRECTORY_SEPARATOR . $doc['file'];
            if (! is_file($abs)) {
                throw new RuntimeException("Supporting document not found: {$abs}");
            }
        }

        // Store a copy of the resume.
        $resumeExt  = strtolower(pathinfo($def['resume_src'], PATHINFO_EXTENSION));
        $resumeName = Str::random(40) . '.' . $resumeExt;
        $resumeDest = storage_path('app/public/resumes/' . $resumeName);
        if (! is_dir(dirname($resumeDest))) {
            mkdir(dirname($resumeDest), 0777, true);
        }
        copy($def['resume_src'], $resumeDest);
        echo "  Stored resume: resumes/{$resumeName}\n";

        // NOTE: the live DB does not have the `resume_hash` column yet
        // (migration 2026_09_04 not applied), so it is intentionally omitted.
        $newId = DB::table('applicants')->insertGetId([
            'applicant_code'       => Applicant::generateCode(),
            'job_post_id'          => $def['job_post_id'],
            'name'                 => $def['name'],
            'email'                => $def['email'],
            'phone'                => $def['phone'],
            'applied_at'           => Carbon::now()->addMinutes($i),
            'fit_score'            => null,
            'status'               => 'fit',
            'stage'                => 'Screened',
            'source'               => $def['source'],
            'resume_file_path'     => 'resumes/' . $resumeName,
            'resume_original_name' => basename($def['resume_src']),
            'summary'              => $def['summary'],
            'flags_json'           => json_encode([]),
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);
        echo "  Inserted applicant #{$newId} (stage=Screened, status=fit)\n";

        // Store + insert each supporting document.
        foreach ($def['docs'] as $doc) {
            $src = $def['docs_folder'] . DIRECTORY_SEPARATOR . $doc['file'];
            $ext = strtolower(pathinfo($src, PATHINFO_EXTENSION));
            $stored = Str::random(40) . '.' . $ext;
            $dest = storage_path('app/public/applicant-documents/' . $stored);
            if (! is_dir(dirname($dest))) {
                mkdir(dirname($dest), 0777, true);
            }
            copy($src, $dest);

            $docId = DB::table('applicant_documents')->insertGetId([
                'applicant_id'        => $newId,
                'doc_type'            => $doc['doc_type'],
                'title'               => $doc['title'],
                'original_copy'       => $doc['original_copy'] ? 1 : 0,
                'file_path'           => 'applicant-documents/' . $stored,
                'original_name'       => $doc['file'],
                'verification_status' => 'PENDING',
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);
            echo "  + document #{$docId} [{$doc['doc_type']}] {$doc['file']}\n";
        }

        $insertedIds[] = $newId;
        echo "\n";
    }

    DB::commit();
    echo "Transaction committed.\n\n";
} catch (Throwable $e) {
    DB::rollBack();
    echo 'ERROR — transaction rolled back: ' . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

// Best-effort NLP screening + document verification (outside the transaction;
// skipped gracefully when the NLP service is unreachable).
foreach ($insertedIds as $id) {
    $model = Applicant::with('documents')->find($id);
    if (! $model) {
        continue;
    }
    echo "--- Screening {$model->name} (#{$id}) ---\n";
    try {
        app(\Modules\ApplicantManagement\Services\ScreeningService::class)->screenAndPersist($model);
        $model->refresh();
        echo "  Screening done: status={$model->status}, fit_score={$model->fit_score}\n";

        foreach ($model->documents as $doc) {
            try {
                app(\Modules\ApplicantManagement\Services\DocumentVerificationService::class)->verifyDocument($doc);
                echo "  Document #{$doc->applicant_document_id}: verification={$doc->refresh()->verification_status}\n";
            } catch (Throwable $e) {
                echo "  Document #{$doc->applicant_document_id}: verification skipped ({$e->getMessage()})\n";
            }
        }
    } catch (Throwable $e) {
        echo '  Screening skipped (NLP service unavailable?): ' . mb_substr($e->getMessage(), 0, 200) . "\n";
        echo "  Resume + documents are stored; screening stays pending and can be re-run from the UI.\n";
    }
    echo "\n";
}

echo "===== FINAL STATE =====\n";
$finalIds = count($insertedIds) ? $insertedIds : [0];
$final = DB::table('applicants')
    ->leftJoin('job_posts', 'job_posts.job_post_id', '=', 'applicants.job_post_id')
    ->whereIn('applicants.applicant_id', $finalIds)
    ->orderBy('applicants.applicant_id')
    ->select('applicants.applicant_id', 'applicants.applicant_code', 'applicants.name', 'applicants.email', 'applicants.stage', 'applicants.status', 'applicants.fit_score', 'applicants.resume_file_path', 'job_posts.title AS job_title')
    ->get();

foreach ($final as $row) {
    $arr = (array) $row;
    $arr['docs'] = DB::table('applicant_documents')->where('applicant_id', $row->applicant_id)->count();
    echo json_encode($arr) . "\n";
}
echo 'Total inserted this run: ' . count($insertedIds) . "\n";

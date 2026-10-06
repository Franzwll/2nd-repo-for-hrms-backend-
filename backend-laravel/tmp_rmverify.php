<?php

/**
 * Scratch end-to-end check: job posts really persist through the live API.
 * Mints its own Sanctum token, then POST / feed / poster / PUT / upload / DELETE.
 * Results land in %TEMP%\rm_verify.json
 */

use Illuminate\Support\Facades\Http;

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$log = [];
$base = 'http://127.0.0.1:8000/api/v1';
$tmp = getenv('TEMP') ?: sys_get_temp_dir();
$logFile = $tmp . DIRECTORY_SEPARATOR . 'rm_verify.json';

$pdo = new PDO('mysql:host=127.0.0.1;dbname=hotel_hr;charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

/* ---- pick a target position that has no active post yet ------------------ */
$cols = array_map('strtolower', $pdo->query('SHOW COLUMNS FROM positions')->fetchAll(PDO::FETCH_COLUMN));
$nameCol = in_array('position_name', $cols, true) ? 'position_name' : (in_array('title', $cols, true) ? 'title' : 'name');
$log['positions_columns'] = $cols;

$openIds = array_map('intval', $pdo->query("SELECT position_id FROM job_posts WHERE active = 1 AND status IN ('published','Open')")->fetchAll(PDO::FETCH_COLUMN));
$usedIds = array_map('intval', $pdo->query('SELECT DISTINCT position_id FROM job_posts')->fetchAll(PDO::FETCH_COLUMN));
$positions = $pdo->query("SELECT p.*, CHAR_LENGTH(p.$nameCol) AS title_len FROM positions p ORDER BY title_len DESC")->fetchAll();

$titleCounts = [];
foreach ($positions as $p) {
    $titleCounts[$p[$nameCol]] = ($titleCounts[$p[$nameCol]] ?? 0) + 1;
}

$target = null;
$free = [];
foreach ($positions as $p) {
    $posId = (int) $p['position_id'];
    $posTitle = (string) $p[$nameCol];
    if (in_array($posId, $usedIds, true) || ($titleCounts[$posTitle] ?? 0) > 1) {
        continue;
    }
    $free[] = $posId . ':' . $posTitle;
    if ($target === null) {
        $target = $p;   // longest title with no job post yet
    }
}
$target = $target ?: ($positions[0] ?? null);
$openPost = $pdo->query("SELECT * FROM job_posts WHERE active = 1 AND status IN ('published','Open') AND DATE(created_at) < CURDATE() ORDER BY job_post_id DESC LIMIT 1")->fetch();   // a real seeded post, never one this script created

$log['open_positions_taken'] = $openIds;
$log['free_positions'] = array_slice($free, 0, 12);
$log['target_position'] = $target ? ['position_id' => (int) $target['position_id'], 'title' => $target[$nameCol], 'department_id' => (int) $target['department_id']] : null;
$log['duplicate_probe'] = $openPost === false ? null : ['position_id' => (int) $openPost['position_id'], 'department_id' => (int) $openPost['department_id'], 'existing_job_post_id' => (int) $openPost['job_post_id']];

/* ---- token for a super admin --------------------------------------------- */
$user = null;
foreach (App\Models\SystemUser::all() as $u) {
    if ($u->isSuperAdmin()) {
        $user = $u;
        break;
    }
}
$token = $user->createToken('rm-verify-' . time())->plainTextToken;
$log['token'] = ['system_user_id' => $user->getKey(), 'email' => $user->email, 'token_id' => (int) explode('|', $token)[0]];

$api = fn () => Http::withToken($token)->acceptJson()->timeout(60);

/* ---- 0. remove leftovers from any earlier (failed) run ------------------- */
$leftovers = $pdo->query("SELECT job_post_id FROM job_posts WHERE summary = 'Automated verification post - safe to delete.'")->fetchAll(PDO::FETCH_COLUMN);
$log['step0_leftovers_found'] = $leftovers;
$log['step0_cleanup'] = [];
foreach ($leftovers as $leftoverId) {
    $res = $api()->delete($base . '/job-posts/' . (int) $leftoverId);
    $log['step0_cleanup'][] = ['id' => (int) $leftoverId, 'status' => $res->status()];
}

/* ---- 1. duplicate guard -------------------------------------------------- */
$duplicate = $openPost === false ? null : $api()->post($base . '/job-posts', [
    'department_id' => (int) $openPost['department_id'],
    'position_id' => (int) $openPost['position_id'],
    'employment_type' => 'Full-time',
    'vacancies' => 1,
    'status' => 'Open',
    'active' => true,
]);
$log['step1_duplicate_guard'] = $duplicate
    ? ['status' => $duplicate->status(), 'body' => $duplicate->json()]
    : ['status' => 0, 'body' => 'no seeded open post available to probe'];

/* ---- 2. real create ------------------------------------------------------ */
$payload = [
    'department_id' => (int) $target['department_id'],
    'position_id' => (int) $target['position_id'],
    'employment_type' => 'Full-time',
    'vacancies' => 4,
    'status' => 'Open',
    'active' => true,
    'experience_level' => '1-2 Years',
    'education_level' => 'College Level',
    'summary' => 'Automated verification post - safe to delete.',
    'description' => 'End-to-end persistence check.',
    'responsibilities' => ['Follow the posted service standards'],
    'qualifications' => ['Detail oriented'],
    'skills' => ['Communication'],
    'platforms' => ['Website', 'Indeed'],
    'requires_practical' => false,
    'force_create' => true,   // step 1 already proved the duplicate guard
];

$created = $api()->post($base . '/job-posts', $payload);
$newId = (int) ($created->json('job_post_id') ?? 0);
$log['step2_create'] = ['status' => $created->status(), 'body' => $created->json()];
$log['step2_db_row'] = $newId ? $pdo->query("SELECT * FROM job_posts WHERE job_post_id = $newId")->fetch() : null;
$log['step2_platform_rows'] = $newId ? $pdo->query("SELECT * FROM job_post_platforms WHERE job_post_id = $newId")->fetchAll() : null;

/* ---- 3. public landing feed must show the new post ----------------------- */
$feed = Http::acceptJson()->get($base . '/landing/jobs', ['per_page' => 100]);
$feedJson = $feed->json();
$feedRow = null;
foreach (($feedJson['data'] ?? []) as $row) {
    if ((int) ($row['job_post_id'] ?? 0) === $newId) {
        $feedRow = $row;
        break;
    }
}
$log['step3_landing_feed'] = [
    'status' => $feed->status(),
    'total' => $feedJson['meta']['total'] ?? null,
    'found_new_post' => $feedRow !== null,
    'row' => $feedRow,
];

/* ---- 4. poster for the stored title ------------------------------------- */
$title = (string) ($feedRow['title'] ?? $log['step2_db_row']['title'] ?? '');
$poster = Http::get($base . '/job-posts/template-picture', ['title' => $title]);
$svg = (string) $poster->body();
preg_match('/font-size="(\d+)"/', $svg, $fs);
$log['step4_poster'] = [
    'status' => $poster->status(),
    'title_used' => $title,
    'content_type' => $poster->header('Content-Type'),
    'bytes' => strlen($svg),
    'covers_guide_box' => str_contains($svg, '<rect x="70" y="525" width="460" height="175" fill="white"/>'),
    'embeds_design_template' => str_contains($svg, '<image href="data:image/png;base64,'),
    'font_size' => $fs[1] ?? null,
    'title_drawn' => str_contains($svg, htmlspecialchars($title, ENT_XML1, 'UTF-8')),
    'tspan_count' => substr_count($svg, '<tspan'),
    'vector_line_nodes' => preg_match('/<line|<path/', $svg),
];
file_put_contents($tmp . DIRECTORY_SEPARATOR . 'poster_' . $newId . '.svg', $svg);

/* ---- 5. update ----------------------------------------------------------- */
$updated = $api()->put($base . "/job-posts/$newId", [
    'vacancies' => 1,
    'status' => 'Draft',
    'active' => false,
    'platforms' => ['Indeed'],
    'summary' => 'Updated by the verification script.',
]);
$log['step5_update'] = ['status' => $updated->status(), 'body' => $updated->json()];
$log['step5_db_row'] = $pdo->query("SELECT job_post_id, title, status, active, vacancies, summary FROM job_posts WHERE job_post_id = $newId")->fetch();
$log['step5_platform_rows'] = $pdo->query("SELECT * FROM job_post_platforms WHERE job_post_id = $newId")->fetchAll();

/* ---- 6. poster upload (multipart POST) served, then cleaned on delete ---- */
$probe = $tmp . DIRECTORY_SEPARATOR . 'rm_probe.png';
file_put_contents($probe, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII='));
/* Same shape the Recruitment Management builder sends (see the FormData branch
   in RecruitmentManagement.tsx): a browser posts repeated parts named
   "platforms[]", so every field is attached as its own multipart part. */
$req = $api();
foreach ([
    'position_id' => (string) $target['position_id'],
    'department_id' => (string) $target['department_id'],
    'title' => (string) $target[$nameCol],
    'employment_type' => 'Full-time',
    'salary_min' => '0',
    'salary_max' => '0',
    'vacancies' => '3',
    'status' => 'Open',
    'active' => '1',
    'summary' => 'Poster upload probe - safe to delete.',
    'description' => 'Poster upload probe.',
    'force_create' => '1',
    'responsibilities[]' => 'Follow the posted standards',
    'qualifications[]' => 'Detail oriented',
    'skills[]' => 'Communication',
    'platforms[]' => 'Website',
] as $field => $value) {
    $req = $req->attach($field, $value);
}
$uploaded = $req->attach('picture', file_get_contents($probe), 'rm_probe.png')->post($base . '/job-posts');
$picId = (int) ($uploaded->json('job_post_id') ?? 0);
$stored = $picId ? (string) $pdo->query("SELECT picture FROM job_posts WHERE job_post_id = $picId")->fetchColumn() : '';
$abs = $stored !== '' ? storage_path('app/public/' . $stored) : '';
$served = $picId ? Http::get($base . "/job-posts/$picId/picture") : null;
$log['step6_upload_create'] = [
    'status' => $uploaded->status(),
    'picture_column' => $stored,
    'picture_url' => $uploaded->json('picture_url'),
    'file_exists_on_disk' => $abs !== '' ? is_file($abs) : null,
    'bytes_on_disk' => $abs !== '' && is_file($abs) ? filesize($abs) : null,
    'served_status' => $served?->status(),
    'served_type' => $served?->header('Content-Type'),
    'served_bytes' => $served ? strlen($served->body()) : null,
    'body' => $uploaded->json(),
];
$delPic = $picId ? $api()->delete($base . "/job-posts/$picId") : null;
$log['step6_delete'] = [
    'status' => $delPic?->status(),
    'row_gone' => $picId ? (int) $pdo->query("SELECT COUNT(*) FROM job_posts WHERE job_post_id = $picId")->fetchColumn() === 0 : null,
    'file_removed' => $abs !== '' ? ! is_file($abs) : null,
];

/* ---- 7. delete + feed no longer shows it -------------------------------- */
$deleted = $api()->delete($base . "/job-posts/$newId");
$log['step7_delete'] = ['status' => $deleted->status(), 'body' => $deleted->json()];
$log['step7_row_gone'] = (int) $pdo->query("SELECT COUNT(*) FROM job_posts WHERE job_post_id = $newId")->fetchColumn() === 0;
$log['step7_platform_rows_left'] = (int) $pdo->query("SELECT COUNT(*) FROM job_post_platforms WHERE job_post_id = $newId")->fetchColumn();
$feed2 = Http::acceptJson()->get($base . '/landing/jobs', ['per_page' => 100]);
$stillThere = false;
foreach (($feed2->json()['data'] ?? []) as $row) {
    if ((int) ($row['job_post_id'] ?? 0) === $newId) {
        $stillThere = true;
    }
}
$log['step7_feed_still_shows'] = $stillThere;
$log['step7_feed_total_after'] = $feed2->json('meta.total');
$log['job_posts_total_after'] = (int) $pdo->query('SELECT COUNT(*) FROM job_posts')->fetchColumn();

/* ---- 8. admin endpoints the Recruitment Management module calls ---------- */
$list = $api()->get($base . '/job-posts', ['per_page' => 5]);
$liveId = (int) ($list->json('data.0.job_post_id') ?? 0);
$show = $liveId ? $api()->get($base . '/job-posts/' . $liveId) : null;
$stats = $api()->get($base . '/job-posts/stats');
$log['step8_admin_list'] = [
    'status' => $list->status(),
    'total' => $list->json('meta.total'),
    'first_title' => $list->json('data.0.title'),
    'first_requires_practical' => $list->json('data.0.requires_practical'),
];
$log['step8_admin_show'] = $show ? ['status' => $show->status(), 'title' => $show->json('title'), 'requires_practical' => $show->json('requires_practical')] : null;
$log['step8_admin_stats'] = ['status' => $stats->status(), 'body' => $stats->json()];

/* ---- verdict ------------------------------------------------------------- */
$log['PASS'] = [
    'duplicate_guard_409' => $log['step1_duplicate_guard']['status'] === 409,
    'create_201' => $log['step2_create']['status'] === 201,
    'db_row_created' => ! empty($log['step2_db_row']),
    'platform_rows_written' => count($log['step2_platform_rows'] ?? []) === 2,
    'feed_shows_new_post' => $log['step3_landing_feed']['found_new_post'] === true,
    'poster_covers_guides' => $log['step4_poster']['covers_guide_box'] === true,
    'poster_draws_title' => $log['step4_poster']['title_drawn'] === true,
    'update_200' => $log['step5_update']['status'] === 200,
    'update_persisted' => ($log['step5_db_row']['status'] ?? null) === 'Draft',
    'platforms_replaced' => array_values(array_column(array_filter(
        $log['step5_platform_rows'] ?? [],
        fn ($row) => ($row['status'] ?? '') === 'published',
    ), 'platform')) === ['Indeed'],
    'upload_persisted' => str_starts_with($log['step6_upload_create']['picture_column'] ?? '', 'job-post-pictures/'),
    'upload_file_on_disk' => $log['step6_upload_create']['file_exists_on_disk'] === true,
    'uploaded_picture_served' => $log['step6_upload_create']['served_status'] === 200,
    'delete_200' => $log['step7_delete']['status'] === 200,
    'row_deleted' => $log['step7_row_gone'] === true,
    'platforms_cascaded' => $log['step7_platform_rows_left'] === 0,
    'feed_hides_deleted' => $log['step7_feed_still_shows'] === false,
    'admin_list_200' => ($log['step8_admin_list']['status'] ?? 0) === 200,
    'admin_show_200' => ($log['step8_admin_show']['status'] ?? 0) === 200,
    'admin_stats_200' => ($log['step8_admin_stats']['status'] ?? 0) === 200,
];



file_put_contents($logFile, json_encode($log, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
echo "log written: $logFile\n";

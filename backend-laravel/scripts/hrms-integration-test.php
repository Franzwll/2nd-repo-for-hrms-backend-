<?php

/**
 * HRMS end-to-end integration test.
 *
 * Verifies that the admin-portal buttons (Applicant Management, Recruitment
 * Management, New Hire Onboarding, Settings) are wired to the Laravel API and
 * that every action really persists to the MySQL database (hotel_hr).
 *
 * Usage (run from backend-laravel/):
 *   php scripts/hrms-integration-test.php --section=auth
 *   php scripts/hrms-integration-test.php --section=lists
 *   php scripts/hrms-integration-test.php --section=recruitment
 *   php scripts/hrms-integration-test.php --section=applicant
 *   php scripts/hrms-integration-test.php --section=onboarding
 *   php scripts/hrms-integration-test.php --section=settings
 *   php scripts/hrms-integration-test.php --section=all --keep
 *   php scripts/hrms-integration-test.php --section=destructive --destructive
 *
 * Options:
 *   --base=http://127.0.0.1:8000/api/v1   API base URL (default)
 *   --email=... --password=...            portal account used for the run
 *   --keep                                keep TEST- records after the run
 *   --destructive                         include restore + reset-default-password
 *   --verbose                             print extra detail
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Modules\Settings\Services\BackupService;

/* ------------------------------------------------------------------ */
/* CLI options                                                          */
/* ------------------------------------------------------------------ */

$opts = [];
foreach (array_slice($argv, 1) as $arg) {
    if (preg_match('/^--([a-z0-9-]+)(?:=(.*))?$/i', $arg, $m)) {
        $opts[$m[1]] = $m[2] ?? '1';
    }
}

$SECTION     = $opts['section'] ?? 'all';
$BASE        = rtrim($opts['base'] ?? 'http://127.0.0.1:8000/api/v1', '/');
$EMAIL       = $opts['email'] ?? 'bullseur@oxfordsuites.com.ph';
$PASSWORD    = $opts['password'] ?? 'Oxford@2026';
$DESTRUCTIVE = !empty($opts['destructive']);
$KEEP        = !empty($opts['keep']);
$VERBOSE     = !empty($opts['verbose']);
$SUFFIX      = date('His');
$TAG         = 'TEST-' . $SUFFIX;

$TOKEN   = null;
$ME      = null;
$CTX     = [];
$RESULTS = [];
$FAILS   = 0;

/* ------------------------------------------------------------------ */
/* Output + assertion helpers                                           */
/* ------------------------------------------------------------------ */

function out(string $msg): void
{
    echo $msg . PHP_EOL;
}

function record(string $section, string $name, bool $pass, string $evidence = ''): void
{
    global $RESULTS, $FAILS;
    $RESULTS[] = ['section' => $section, 'name' => $name, 'pass' => $pass, 'evidence' => $evidence];
    if (! $pass) {
        $FAILS++;
    }
    out(sprintf('%s [%s] %s%s', $pass ? 'PASS' : 'FAIL', $section, $name, $evidence !== '' ? ' — ' . $evidence : ''));
}

function note(string $msg, bool $verboseOnly = false): void
{
    global $VERBOSE;
    if (! $verboseOnly || $VERBOSE) {
        out('      · ' . $msg);
    }
}

function jdump($value): string
{
    return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: 'null';
}

/* ------------------------------------------------------------------ */
/* HTTP helper                                                          */
/* ------------------------------------------------------------------ */

function api(string $method, string $path, $json = null, ?array $multipart = null, bool $noAuth = false): array
{
    global $BASE, $TOKEN;

    $request = Http::acceptJson()->timeout(300);
    if ($TOKEN !== null && ! $noAuth) {
        $request = $request->withToken($TOKEN);
    }

    $options = [];
    if ($json !== null) {
        $options['json'] = $json;
    }
    if ($multipart !== null) {
        $options['multipart'] = $multipart;
    }

    try {
        $response = $request->send($method, $BASE . $path, $options);
    } catch (\Throwable $e) {
        return ['status' => 0, 'json' => null, 'body' => '', 'error' => $e->getMessage()];
    }

    $decoded = null;
    try {
        $decoded = $response->json();
    } catch (\Throwable) {
        $decoded = null;
    }

    return [
        'status'  => $response->status(),
        'json'    => $decoded,
        'body'    => $response->body(),
        'headers' => $response->headers(),
    ];
}

function login(): bool
{
    global $TOKEN, $ME, $EMAIL, $PASSWORD;

    $r = api('POST', '/auth/login', ['email' => $EMAIL, 'password' => $PASSWORD], null, true);
    if ($r['status'] !== 200) {
        record('auth', 'login', false, "HTTP {$r['status']} " . ($r['json']['message'] ?? ($r['error'] ?? '')));
        return false;
    }

    $j = $r['json'];

    if (! empty($j['otp_required'])) {
        if (empty($j['debug_otp'])) {
            record('auth', 'login', false, 'OTP required but debug_otp missing (APP_ENV not local?)');
            return false;
        }
        $v = api('POST', '/auth/otp/verify', ['login_token' => $j['login_token'], 'otp' => $j['debug_otp']], null, true);
        if ($v['status'] !== 200) {
            record('auth', 'login', false, "OTP verify HTTP {$v['status']} " . ($v['json']['message'] ?? ''));
            return false;
        }
        $TOKEN = $v['json']['token'] ?? null;
        $ME    = $v['json']['user'] ?? null;
        record('auth', 'login + OTP verify', (bool) $TOKEN, 'two-step sign-in');
    } else {
        $TOKEN = $j['token'] ?? null;
        $ME    = $j['user'] ?? null;
        record('auth', 'login (OTP disabled for account)', (bool) $TOKEN, 'direct sign-in');
    }

    return (bool) $TOKEN;
}

/** Reuses the existing session token; logs in only when none is held yet. */
function ensureLoggedIn(): bool
{
    global $TOKEN;
    return $TOKEN !== null || login();
}

/* ------------------------------------------------------------------ */
/* Database helpers                                                     */
/* ------------------------------------------------------------------ */

function scalar(string $sql, array $bindings = []): mixed
{
    $row = DB::selectOne($sql, $bindings);
    if (! $row) {
        return null;
    }
    $arr = (array) $row;
    return array_values($arr)[0] ?? null;
}

function firstId(string $table, string $column, string $where = '1=1', array $bindings = []): ?int
{
    $value = scalar("SELECT {$column} FROM {$table} WHERE {$where} ORDER BY {$column} LIMIT 1", $bindings);
    return $value === null ? null : (int) $value;
}

function testResumeText(): string
{
    return implode("\n", [
        'JUAN TEST CANDIDATE',
        'Front Desk Receptionist with 5 years of hotel front office experience.',
        'Skills: Guest Relations, Opera PMS, Check-in / Check-out, Cash Handling, Reservations',
        'Certifications: TESDA Front Office NC II',
        'Education: Bachelor of Science in Hospitality Management',
        'Email: test.candidate@example.com',
        'Phone: 0917 000 0000',
    ]);
}

/** Minimal but valid one-page PDF so the NLP extractor can read embedded text. */
function makeResumePdf(string $text): string
{
    $content = "BT /F1 11 Tf 40 780 Td 14 TL\n";
    foreach (explode("\n", $text) as $line) {
        $esc = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $line);
        $content .= "({$esc}) Tj T*\n";
    }
    $content .= 'ET';

    $objects = [
        1 => '<< /Type /Catalog /Pages 2 0 R >>',
        2 => '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        3 => '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
        4 => "<< /Length " . strlen($content) . " >>\nstream\n" . $content . "\nendstream",
        5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];

    $pdf = "%PDF-1.4\n";
    $offsets = [];
    foreach ($objects as $number => $body) {
        $offsets[$number] = strlen($pdf);
        $pdf .= "{$number} 0 obj\n{$body}\nendobj\n";
    }

    $xrefPos = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
    for ($i = 1; $i <= count($objects); $i++) {
        $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
    }
    $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xrefPos}\n%%EOF";

    return $pdf;
}

/** Multipart part for an uploaded file. */
function filePart(string $name, string $contents, string $filename, string $mime = 'application/pdf'): array
{
    return [
        'name'     => $name,
        'contents' => $contents,
        'filename' => $filename,
        'headers'  => ['Content-Type' => $mime],
    ];
}

/** Multipart part for a regular field. */
function fieldPart(string $name, $value): array
{
    return ['name' => $name, 'contents' => is_bool($value) ? ($value ? '1' : '0') : (string) $value];
}

/** Compares an API key=>count map with a SQL group-by map (int-cast, order-insensitive). */
function countsMatch(?array $api, ?array $db): bool
{
    $api = $api ?? [];
    $db = $db ?? [];
    if (count($api) !== count($db)) {
        return false;
    }
    foreach ($db as $key => $value) {
        if ((int) ($api[$key] ?? -1) !== (int) $value) {
            return false;
        }
    }
    return true;
}

function sqlCounts(string $table, string $column): array
{
    return DB::table($table)->selectRaw("{$column}, COUNT(*) as c")->groupBy($column)->pluck('c', $column)->toArray();
}

/* ------------------------------------------------------------------ */
/* Section: auth                                                        */
/* ------------------------------------------------------------------ */

function section_auth(): void
{
    global $TOKEN, $ME, $EMAIL;

    if (! login()) {
        return;
    }

    $me = api('GET', '/auth/me');
    record(
        'auth',
        '/auth/me returns the signed-in account',
        $me['status'] === 200 && ($me['json']['user']['email'] ?? null) === $EMAIL,
        'email=' . ($me['json']['user']['email'] ?? 'n/a')
    );
    note('session user: ' . jdump($ME));

    $tokens = (int) scalar("SELECT COUNT(*) FROM personal_access_tokens WHERE tokenable_type LIKE '%SystemUser%'");
    record('auth', 'Sanctum token persisted in DB', $tokens > 0, "personal_access_tokens rows={$tokens}");
}

/* ------------------------------------------------------------------ */
/* Section: lists — every list screen + metric card vs the database     */
/* ------------------------------------------------------------------ */

function section_lists_tables(): void
{
    $tableChecks = [
        ['Applicant list (Ranking & Applicants tab)', '/applicants?per_page=1', 'applicants'],
        ['Interview Scheduling list', '/interviews?per_page=1', 'interviews'],
        ['Interview assessments list', '/assessments?per_page=1', 'applicant_assessments'],
        ['Assessment tests list', '/assessment-tests?per_page=1', 'assessment_tests'],
        ['Practical tests list', '/practical-tests?per_page=1', 'practical_tests'],
        ['Final evaluations list', '/final-evaluations?per_page=1', 'final_evaluations'],
        ['Recruitment job posts list', '/job-posts?per_page=1', 'job_posts'],
        ['Requisition list', '/requisitions?per_page=1', 'requisitions'],
        ['Onboarding pipeline (new hires) list', '/new-hires?per_page=1', 'new_hires'],
        ['Checklist templates list', '/checklist-templates?per_page=1', 'onboarding_checklist_templates'],
        ['Checklist requests list', '/checklist-requests?per_page=1', 'checklist_requests'],
        ['System announcements list', '/announcements', 'announcements'],
        ['Screening Reference Data & Aliases list', '/screening/reference-data/list', 'screening_reference_data'],
    ];

    foreach ($tableChecks as [$label, $path, $table]) {
        $r = api('GET', $path);
        $apiTotal = $r['json']['meta']['total'] ?? (is_array($r['json']['data'] ?? null) ? count($r['json']['data']) : null);
        $dbTotal = (int) scalar("SELECT COUNT(*) FROM {$table}");
        record('lists', $label, $r['status'] === 200 && $apiTotal === $dbTotal, "api rows={$apiTotal} db rows={$dbTotal} http={$r['status']}");
    }
}

/** Metric cards, part A — Applicant Management, Recruitment, Onboarding. */
function section_lists_cards_a(): void
{
    $dbTotal = (int) scalar('SELECT COUNT(*) FROM applicants');

    $s = api('GET', '/applicants/stats');
    record('lists', 'Applicant Mgmt card — Total Applicants', $s['status'] === 200 && (int) ($s['json']['total'] ?? -1) === $dbTotal, 'api=' . ($s['json']['total'] ?? 'n/a') . " db={$dbTotal}");
    record(
        'lists',
        'Applicant Mgmt card — stage/status breakdown',
        countsMatch((array) ($s['json']['by_stage'] ?? []), sqlCounts('applicants', 'stage'))
            && countsMatch((array) ($s['json']['by_status'] ?? []), sqlCounts('applicants', 'status')),
        'by_stage api=' . jdump($s['json']['by_stage'] ?? null) . ' db=' . jdump(sqlCounts('applicants', 'stage'))
    );
    $dbAvg = (float) scalar('SELECT ROUND(AVG(fit_score), 3) FROM applicants WHERE fit_score IS NOT NULL');
    record('lists', 'Applicant Mgmt card — average screening score', abs((float) ($s['json']['avg_fit_score'] ?? -1) - $dbAvg) < 0.01, 'api=' . ($s['json']['avg_fit_score'] ?? 'n/a') . " db={$dbAvg}");

    $sc = api('GET', '/applicants/screening-stats');
    $dbScreenings = (int) scalar('SELECT COUNT(*) FROM applicant_screenings');
    $scTotal = $sc['json']['total'] ?? $sc['json']['data']['total'] ?? null;
    record(
        'lists',
        'Applicant Mgmt card — screening stats endpoint (SOP panels)',
        $sc['status'] === 200 && ($scTotal === null || (int) $scTotal === $dbScreenings),
        'screenings db=' . $dbScreenings . ' api total=' . ($scTotal ?? 'n/a') . ' keys=' . jdump(array_keys((array) ($sc['json'] ?? [])))
    );

    $js = api('GET', '/job-posts/stats');
    $jTotal = (int) scalar('SELECT COUNT(*) FROM job_posts');
    $jOpen = (int) scalar("SELECT COUNT(*) FROM job_posts WHERE status = 'Open'");
    $jDraft = (int) scalar("SELECT COUNT(*) FROM job_posts WHERE status = 'Draft'");
    $jClosed = (int) scalar("SELECT COUNT(*) FROM job_posts WHERE status = 'Closed'");
    record(
        'lists',
        'Recruitment cards — job post stats (total/open/draft/closed)',
        $js['status'] === 200
            && (int) ($js['json']['total'] ?? -1) === $jTotal
            && (int) ($js['json']['open'] ?? -1) === $jOpen
            && (int) ($js['json']['draft'] ?? -1) === $jDraft
            && (int) ($js['json']['closed'] ?? -1) === $jClosed,
        "api t={$js['json']['total']} o={$js['json']['open']} d={$js['json']['draft']} c={$js['json']['closed']} | db t={$jTotal} o={$jOpen} d={$jDraft} c={$jClosed}"
    );

    $nh = api('GET', '/new-hires/stats');
    $nhTotal = (int) scalar('SELECT COUNT(*) FROM new_hires');
    record('lists', 'Onboarding card — Onboarding in progress (total)', $nh['status'] === 200 && (int) ($nh['json']['total'] ?? -1) === $nhTotal, 'api=' . ($nh['json']['total'] ?? 'n/a') . " db={$nhTotal}");
    record('lists', 'Onboarding card — stage split (pre-onboarding/probationary)', countsMatch((array) ($nh['json']['by_stage'] ?? []), sqlCounts('new_hires', 'stage')), 'api=' . jdump($nh['json']['by_stage'] ?? null) . ' db=' . jdump(sqlCounts('new_hires', 'stage')));
}

/** Metric cards, part B — dashboard, audit, settings reads, screening status. */
function section_lists_cards_b(): void
{
    $dbTotal = (int) scalar('SELECT COUNT(*) FROM applicants');
    $jOpen = (int) scalar("SELECT COUNT(*) FROM job_posts WHERE status = 'Open'");
    $nhTotal = (int) scalar('SELECT COUNT(*) FROM new_hires');

    $d = api('GET', '/dashboard/stats');
    if ($d['status'] === 200) {
        $data = $d['json']['data'] ?? $d['json'];
        $dbSched = (int) scalar("SELECT COUNT(*) FROM interviews WHERE status = 'Scheduled'");
        record('lists', 'Dashboard — Total Applicants card', (int) ($data['applicants']['total'] ?? -1) === $dbTotal, 'api=' . ($data['applicants']['total'] ?? 'n/a') . " db={$dbTotal}");
        record('lists', 'Dashboard — Open Vacancies card', (int) ($data['job_posts']['open'] ?? -1) === $jOpen, 'api=' . ($data['job_posts']['open'] ?? 'n/a') . " db={$jOpen}");
        record('lists', 'Dashboard — Onboarding in progress card', (int) ($data['new_hires']['total'] ?? -1) === $nhTotal, 'api=' . ($data['new_hires']['total'] ?? 'n/a') . " db={$nhTotal}");
        record('lists', 'Dashboard — interviews scheduled card', (int) ($data['interviews']['scheduled'] ?? -1) === $dbSched, 'api=' . ($data['interviews']['scheduled'] ?? 'n/a') . " db={$dbSched}");
    } else {
        record('lists', 'Dashboard stats endpoint', false, "HTTP {$d['status']}");
    }

    $al = api('GET', '/audit-logs/stats');
    $dbAudit = (int) scalar('SELECT COUNT(*) FROM audit_logs');
    $alTotal = $al['json']['data']['total'] ?? null;
    record('lists', 'Audit Log page — total events card', $al['status'] === 200 && ($alTotal === null || (int) $alTotal === $dbAudit), 'api=' . ($alTotal ?? 'n/a') . " db={$dbAudit}");

    $settings = api('GET', '/settings');
    $map = $settings['json']['map'] ?? [];
    $dbSettings = (int) scalar('SELECT COUNT(*) FROM system_settings');
    record('lists', 'Settings page — system_settings map loads', $settings['status'] === 200 && is_array($map) && count($map) > 0, 'keys=' . count($map) . " db rows={$dbSettings}");
    foreach (['company', 'security', 'notifications', 'preferences', 'backup', 'backups'] as $key) {
        note("system_settings '{$key}' present=" . (array_key_exists($key, $map) ? 'yes' : 'no'), true);
    }

    $mine = api('GET', '/my/settings?user=' . urlencode($GLOBALS['EMAIL']));
    $otpDb = (int) scalar('SELECT otp_enabled FROM system_users WHERE email = ? OR username = ?', [$GLOBALS['EMAIL'], $GLOBALS['EMAIL']]);
    record(
        'lists',
        'Settings — Security card: OTP flag matches DB',
        $mine['status'] === 200 && (int) (bool) ($mine['json']['otp_enabled'] ?? true) === $otpDb,
        'api=' . jdump($mine['json']['otp_enabled'] ?? null) . " db otp_enabled={$otpDb}"
    );

    $bk = api('GET', '/settings/backups');
    $dbEntries = json_decode((string) scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'backups'"), true) ?: [];
    $apiEntries = $bk['json']['data'] ?? [];
    $missingFiles = 0;
    foreach ($apiEntries as $entry) {
        if (! is_file(storage_path('app/backups') . DIRECTORY_SEPARATOR . ($entry['filename'] ?? ''))) {
            $missingFiles++;
        }
    }
    record(
        'lists',
        'Settings — Backup & Restore list matches DB + files exist',
        $bk['status'] === 200 && count($apiEntries) === count($dbEntries) && $missingFiles === 0,
        'api=' . count($apiEntries) . ' db=' . count($dbEntries) . " missing_files={$missingFiles}"
    );

    $st = api('GET', '/screening/status');
    $online = (bool) ($st['json']['data']['nlp_service']['online'] ?? false);
    $weights = (array) ($st['json']['data']['effective']['criteria'] ?? []);
    $sum = 0.0;
    foreach ($weights as $cfg) {
        if (! empty($cfg['enabled'])) {
            $sum += (float) ($cfg['weight'] ?? 0);
        }
    }
    record('lists', 'Screening Setup — NLP service online', $st['status'] === 200 && $online, 'online=' . jdump($online) . ' model=' . ($st['json']['data']['nlp_service']['base_model'] ?? 'n/a'));
    record('lists', 'Screening Setup — effective criteria weights total 100%', abs($sum - 100.0) < 0.01, 'sum=' . $sum);

    $notif = api('GET', '/notifications');
    record('lists', 'Notifications list loads', in_array($notif['status'], [200, 204], true), "http={$notif['status']}");

    $la = api('GET', '/landing/announcements');
    record('lists', 'Landing/announcements endpoint (public career page)', $la['status'] === 200 && is_array($la['json']['data'] ?? null), "http={$la['status']}");

    $lc = api('GET', '/landing/company');
    record('lists', 'Landing/company endpoint (public career page)', $lc['status'] === 200 && is_array($lc['json']['data'] ?? null), 'name=' . ($lc['json']['data']['name'] ?? 'n/a'));
}

function section_lists(): void
{
    if (! ensureLoggedIn()) {
        return;
    }
    section_lists_tables();
    section_lists_cards_a();
    section_lists_cards_b();
}

/* ------------------------------------------------------------------ */
/* Section: recruitment — write path                                    */
/* ------------------------------------------------------------------ */

function section_recruitment(): void
{
    global $TAG, $SUFFIX, $CTX, $KEEP;

    if (! ensureLoggedIn()) {
        return;
    }

    $deptId = firstId('departments', 'department_id');
    $posId  = firstId('positions', 'position_id');
    if (! $deptId || ! $posId) {
        record('recruitment', 'seed lookups (department/position)', false, 'no departments or positions in DB');
        return;
    }

    /* 1. New job post — Save draft --------------------------------------- */
    $create = api('POST', '/job-posts', [
        'department_id'       => $deptId,
        'position_id'         => $posId,
        'employment_type'     => 'Full-time',
        'vacancies'           => 2,
        'status'              => 'Draft',
        'active'              => false,
        'requires_practical'  => true,
        'force_create'        => true,
        'experience_level'    => '1-2 Years',
        'education_level'     => 'College Level',
        'summary'             => $TAG . ' draft summary',
        'description'         => $TAG . ' job post created by the integration test.',
        'responsibilities'    => ['Handle guest check-in/check-out', $TAG . ' duty'],
        'qualifications'      => ['At least 1 year front office experience'],
        'skills'              => ['Guest Relations', 'Opera PMS'],
        'platforms'           => ['Website'],
    ]);

    $jobId = $create['json']['job_post_id'] ?? null;
    if (! $jobId) {
        record('recruitment', 'New job post — Save draft (POST /job-posts)', false, "HTTP {$create['status']} " . substr(jdump($create['json']), 0, 200));
        return;
    }
    $CTX['job_post_id'] = $jobId;

    $dbStatus = scalar('SELECT status FROM job_posts WHERE job_post_id = ?', [$jobId]);
    $dbActive = (int) scalar('SELECT active FROM job_posts WHERE job_post_id = ?', [$jobId]);
    record('recruitment', 'New job post — Save draft persists to DB', in_array($create['status'], [200, 201], true) && $dbStatus === 'Draft' && $dbActive === 0, "http={$create['status']} id={$jobId} db status={$dbStatus} active={$dbActive}");
    record('recruitment', 'New job post — practical flag + platform rows persisted', (int) scalar('SELECT requires_practical FROM job_posts WHERE job_post_id = ?', [$jobId]) === 1 && (int) scalar('SELECT COUNT(*) FROM job_post_platforms WHERE job_post_id = ?', [$jobId]) >= 1, 'platforms=' . jdump(DB::table('job_post_platforms')->where('job_post_id', $jobId)->pluck('platform')->toArray()));

    /* 2. Edit template (update job post) ---------------------------------- */
    $upd = api('PUT', "/job-posts/{$jobId}", [
        'summary'          => $TAG . ' UPDATED summary',
        'vacancies'        => 3,
        'responsibilities' => ['Updated responsibility', $TAG . ' duty 2'],
    ]);
    record(
        'recruitment',
        'Edit template — Update template (PUT /job-posts/{id})',
        $upd['status'] === 200 && scalar('SELECT summary FROM job_posts WHERE job_post_id = ?', [$jobId]) === $TAG . ' UPDATED summary' && (int) scalar('SELECT vacancies FROM job_posts WHERE job_post_id = ?', [$jobId]) === 3,
        "http={$upd['status']} db summary='" . scalar('SELECT summary FROM job_posts WHERE job_post_id = ?', [$jobId]) . "'"
    );

    /* 3. Publish job post -------------------------------------------------- */
    $pub = api('POST', "/job-posts/{$jobId}/publish", ['platforms' => ['Website', 'Indeed']]);
    $pubStatus = scalar('SELECT status FROM job_posts WHERE job_post_id = ?', [$jobId]);
    $pubActive = (int) scalar('SELECT active FROM job_posts WHERE job_post_id = ?', [$jobId]);
    $pubDate   = scalar('SELECT posted_date FROM job_posts WHERE job_post_id = ?', [$jobId]);
    $pubPlatforms = DB::table('job_post_platforms')->where('job_post_id', $jobId)->where('status', 'published')->pluck('platform')->toArray();
    record(
        'recruitment',
        'Publish job post (POST /job-posts/{id}/publish)',
        $pub['status'] === 200 && $pubStatus === 'Open' && $pubActive === 1 && $pubDate !== null && count($pubPlatforms) === 2,
        "http={$pub['status']} db status={$pubStatus} active={$pubActive} posted={$pubDate} published_on=" . jdump($pubPlatforms)
    );

    /* 4. Activate / close via toggle --------------------------------------- */
    $t1 = api('PATCH', "/job-posts/{$jobId}/toggle");
    $closed = scalar('SELECT status FROM job_posts WHERE job_post_id = ?', [$jobId]);
    $t2 = api('PATCH', "/job-posts/{$jobId}/toggle");
    $reopened = scalar('SELECT status FROM job_posts WHERE job_post_id = ?', [$jobId]);
    record(
        'recruitment',
        'Open/Close toggle (PATCH /job-posts/{id}/toggle)',
        $t1['status'] === 200 && $closed === 'Closed' && $t2['status'] === 200 && $reopened === 'Open',
        "after 1st={$closed} after 2nd={$reopened}"
    );

    // __RECRUITMENT_PART2__
}

/* Copy & Use Template, Cancel draft, Run resume screening, Convert requisition */
function section_recruitment_part2(int $jobId, int $deptId, int $posId): void
{
    global $TAG, $SUFFIX, $CTX;

    /* 5. Copy & Use Template — duplicates the post into a new draft ------- */
    $copy = api('POST', '/job-posts', [
        'department_id'      => $deptId,
        'position_id'        => $posId,
        'employment_type'    => 'Full-time',
        'vacancies'          => 2,
        'status'             => 'Draft',
        'active'             => false,
        'requires_practical' => true,
        'force_create'       => true,
        'summary'            => $TAG . ' copied template draft',
        'platforms'          => ['Website'],
    ]);
    $copyId = $copy['json']['job_post_id'] ?? null;
    $CTX['copy_job_post_id'] = $copyId;
    record('recruitment', 'Copy & Use Template — new draft row created', in_array($copy['status'], [200, 201], true) && $copyId && $copyId !== $jobId && scalar('SELECT status FROM job_posts WHERE job_post_id = ?', [$copyId]) === 'Draft', "http={$copy['status']} copy_id={$copyId}");

    /* 6. Cancel draft — discard the unpublished draft --------------------- */
    $del = api('DELETE', "/job-posts/{$copyId}");
    $gone = (int) scalar('SELECT COUNT(*) FROM job_posts WHERE job_post_id = ?', [$copyId]);
    record('recruitment', 'Cancel draft — DELETE /job-posts/{id} removes the draft', $del['status'] === 200 && $gone === 0, "http={$del['status']} remaining_rows={$gone}");

    // __REC_P2_MID__

    /* 7. Run resume screening → save applicant ----------------------------- */
    $pdf = makeResumePdf(testResumeText());
    $preview = api('POST', '/applicants/screen-resume', null, [
        filePart('resume', $pdf, 'test-resume.pdf'),
        fieldPart('job_post_id', $jobId),
    ]);
    $previewOk = $preview['status'] === 200 && (($preview['json']['success'] ?? false) === true || is_numeric($preview['json']['match_score'] ?? null));
    record('recruitment', 'Run resume screening — NLP preview scores the resume', $previewOk, "http={$preview['status']} payload=" . substr(jdump($preview['json']), 0, 220));

    $appEmail = 'test.recruit.' . $SUFFIX . '@example.com';
    $saved = api('POST', '/applicants', null, [
        fieldPart('job_post_id', $jobId),
        fieldPart('name', $TAG . ' Recruit Candidate'),
        fieldPart('email', $appEmail),
        fieldPart('phone', '0917 000 1111'),
        fieldPart('source', 'Integration Test'),
        fieldPart('status', 'fit'),
        fieldPart('stage', 'Screened'),
        fieldPart('summary', 'Created by hrms-integration-test'),
        fieldPart('flags_json', '[]'),
        filePart('resume', $pdf, 'test-resume.pdf'),
    ]);
    $appId = $saved['json']['applicant_id'] ?? null;
    $CTX['recruit_applicant_id'] = $appId;
    record('recruitment', 'Save applicant after screening (POST /applicants multipart)', in_array($saved['status'], [200, 201], true) && $appId !== null && (int) scalar('SELECT COUNT(*) FROM applicants WHERE applicant_id = ?', [$appId]) === 1, "http={$saved['status']} applicant_id={$appId}");
    $screeningRow = $appId ? DB::table('applicant_screenings')->where('applicant_id', $appId)->orderByDesc('screening_id')->first() : null;
    record(
        'recruitment',
        'Save applicant — spaCy screening persisted (applicant_screenings)',
        $screeningRow !== null,
        'rows=' . ($appId ? DB::table('applicant_screenings')->where('applicant_id', $appId)->count() : 0)
            . ' processing=' . ($screeningRow->processing_status ?? 'n/a')
            . ' match=' . ($screeningRow->match_score ?? 'n/a')
    );

    /* 8. Convert requisition → job post ------------------------------------ */
    $req = api('POST', '/requisitions', [
        'department_id'   => $deptId,
        'position_id'     => $posId,
        'requested_count' => 1,
        'urgency'         => 'Normal',
        'justification'   => $TAG . ' integration test requisition',
        'requested_at'    => date('Y-m-d'),
        'force_create'    => true,
    ]);
    $reqId = $req['json']['requisition_id'] ?? null;
    $CTX['requisition_id'] = $reqId;
    record('recruitment', 'Requisition created (POST /requisitions)', in_array($req['status'], [200, 201], true) && $reqId !== null && (int) scalar('SELECT COUNT(*) FROM requisitions WHERE requisition_id = ?', [$reqId]) === 1, "http={$req['status']} id={$reqId}");

    if ($reqId) {
        $conv = api('POST', "/requisitions/{$reqId}/convert", ['job_post_id' => $jobId]);
        $convStatus = scalar('SELECT status FROM requisitions WHERE requisition_id = ?', [$reqId]);
        $convLink = scalar('SELECT converted_job_post_id FROM requisitions WHERE requisition_id = ?', [$reqId]);
        record('recruitment', 'Convert requisition (POST /requisitions/{id}/convert)', $conv['status'] === 200 && $convStatus === 'Converted' && (int) $convLink === $jobId, "http={$conv['status']} db status={$convStatus} converted_to={$convLink}");
    }

    section_recruitment_config_and_reference();
}

/* Criteria weights / Passing thresholds + Reference Data & Aliases */
function section_recruitment_config_and_reference(): void
{
    global $TAG, $CTX;

    $origConfigRaw = scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'screening.configuration'");
    $testConfig = [
        'criteria' => [
            'Skills'                 => ['weight' => 45, 'enabled' => true],
            'Work Experience'        => ['weight' => 25, 'enabled' => true],
            'Educational Background' => ['weight' => 20, 'enabled' => true],
            'Certifications'         => ['weight' => 10, 'enabled' => true],
        ],
        'passing_score'                => 80,
        'required_skills_coverage_min' => 0.65,
    ];
    $cfg = api('PUT', '/screening/configuration', ['configuration' => $testConfig]);
    $savedCfg = json_decode((string) scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'screening.configuration'"), true) ?: [];
    record(
        'recruitment',
        'Criteria weights + Passing thresholds saved (PUT /screening/configuration)',
        $cfg['status'] === 200 && (float) ($savedCfg['passing_score'] ?? 0) === 80.0 && (int) ($savedCfg['criteria']['Skills']['weight'] ?? 0) === 45,
        "http={$cfg['status']} db passing=" . ($savedCfg['passing_score'] ?? 'n/a') . ' skills=' . ($savedCfg['criteria']['Skills']['weight'] ?? 'n/a')
    );

    // Restore the previous configuration (or remove it when it never existed).
    if ($origConfigRaw !== null) {
        $orig = json_decode((string) $origConfigRaw, true) ?: null;
        if ($orig) {
            api('PUT', '/screening/configuration', ['configuration' => $orig]);
        }
    } else {
        api('DELETE', '/settings/screening.configuration');
    }
    $restored = scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'screening.configuration'");
    record('recruitment', 'Screening configuration restored after test', $origConfigRaw === null ? $restored === null : $restored !== null, 'restored=' . ($restored === null ? 'defaults' : 'previous saved config'));

    /* Reference Data & Aliases — add / edit / deactivate / delete ---------- */
    $refValue = $TAG . ' Skill';
    $add = api('POST', '/screening/reference-data', [
        'data_type'       => 'skill',
        'canonical_value' => $refValue,
        'aliases_json'    => ['t alias one', 't alias two'],
        'active'          => true,
    ]);
    $refId = $add['json']['data']['ref_id'] ?? null;
    $CTX['ref_id'] = $refId;
    $aliasRaw = $refId ? scalar('SELECT aliases_json FROM screening_reference_data WHERE ref_id = ?', [$refId]) : null;
    record(
        'recruitment',
        'Reference Data — Add entry & save changes (aliases persisted)',
        $add['status'] === 201 && $refId !== null && (int) scalar('SELECT COUNT(*) FROM screening_reference_data WHERE ref_id = ?', [$refId]) === 1 && json_decode((string) $aliasRaw, true) !== null,
        "http={$add['status']} ref_id={$refId} aliases=" . substr((string) $aliasRaw, 0, 120)
    );

    if ($refId) {
        $edit = api('PUT', "/screening/reference-data/{$refId}", [
            'data_type'       => 'skill',
            'canonical_value' => $refValue . ' Edited',
            'aliases_json'    => ['t alias one', 't alias two', 't alias three'],
            'active'          => true,
        ]);
        $canonical = scalar('SELECT canonical_value FROM screening_reference_data WHERE ref_id = ?', [$refId]);
        record('recruitment', 'Reference Data — Edit entry persists', $edit['status'] === 200 && $canonical === $refValue . ' Edited', "http={$edit['status']} db canonical='{$canonical}'");

        $toggle = api('PATCH', "/screening/reference-data/{$refId}/toggle");
        $activeNow = (int) scalar('SELECT active FROM screening_reference_data WHERE ref_id = ?', [$refId]);
        record('recruitment', 'Reference Data — Deactivate entry', $toggle['status'] === 200 && $activeNow === 0, "http={$toggle['status']} db active={$activeNow}");

        $remove = api('DELETE', "/screening/reference-data/{$refId}");
        $remains = (int) scalar('SELECT COUNT(*) FROM screening_reference_data WHERE ref_id = ?', [$refId]);
        record('recruitment', 'Reference Data — Delete entry', $remove['status'] === 200 && $remains === 0, "http={$remove['status']} remaining={$remains}");
    }

    section_recruitment_cleanup();
}

/* Removes the TEST rows created by the recruitment section (unless --keep). */
function section_recruitment_cleanup(): void
{
    global $CTX, $KEEP;

    if ($KEEP) {
        note('--keep set: TEST rows left in the database for manual UI review');
        return;
    }

    $appId = $CTX['recruit_applicant_id'] ?? null;
    if ($appId) {
        DB::table('applicant_screening_scores')->where('applicant_id', $appId)->delete();
        DB::table('applicant_screening_entities')->where('applicant_id', $appId)->delete();
        DB::table('applicant_screenings')->where('applicant_id', $appId)->delete();
        api('DELETE', "/applicants/{$appId}");
    }

    $reqId = $CTX['requisition_id'] ?? null;
    if ($reqId) {
        // Converted requisitions intentionally cannot be deleted through the API
        // (they remain as history), so the TEST row is removed directly — and it
        // must go first because it FK-links to the job post below.
        DB::table('requisitions')->where('requisition_id', $reqId)->delete();
    }

    $jobId = $CTX['job_post_id'] ?? null;
    if ($jobId) {
        api('DELETE', "/job-posts/{$jobId}");
    }

    $appGone = $appId ? (int) scalar('SELECT COUNT(*) FROM applicants WHERE applicant_id = ?', [$appId]) : 0;
    $jobGone = $jobId ? (int) scalar('SELECT COUNT(*) FROM job_posts WHERE job_post_id = ?', [$jobId]) : 0;
    record('recruitment', 'Cleanup — TEST rows removed', $appGone === 0 && $jobGone === 0, "applicant_remaining={$appGone} job_post_remaining={$jobGone}");
}

/* ------------------------------------------------------------------ */
/* Section: applicant management — full hiring pipeline                 */
/* ------------------------------------------------------------------ */

function section_applicant(): void
{
    global $TAG, $SUFFIX, $CTX, $KEEP;

    if (! ensureLoggedIn()) {
        return;
    }

    $deptId     = firstId('departments', 'department_id');
    $posId      = firstId('positions', 'position_id');
    $facilityId = firstId('facilities', 'facility_id');
    $userId     = (int) ($GLOBALS['ME']['system_user_id'] ?? 0) ?: (int) firstId('system_users', 'system_user_id');

    if (! $deptId || ! $posId) {
        record('applicant', 'seed lookups (department/position)', false, 'no departments or positions in DB');
        return;
    }

    /* 0. TEST job post that requires a practical exam ---------------------- */
    $jp = api('POST', '/job-posts', [
        'department_id'      => $deptId,
        'position_id'        => $posId,
        'employment_type'    => 'Full-time',
        'vacancies'          => 1,
        'status'             => 'Open',
        'active'             => true,
        'requires_practical' => true,
        'force_create'       => true,
        'summary'            => $TAG . ' pipeline job post',
        'platforms'          => ['Website'],
    ]);
    $jobId = $jp['json']['job_post_id'] ?? null;
    $CTX['apl_job_post_id'] = $jobId;
    record('applicant', 'Setup — pipeline job post created (requires practical)', $jobId !== null && (int) scalar('SELECT requires_practical FROM job_posts WHERE job_post_id = ?', [$jobId]) === 1, "id={$jobId}");

    /* 1. Applicant created with resume (runs spaCy screening) -------------- */
    $pdf = makeResumePdf(testResumeText());
    $email = 'test.pipeline.' . $SUFFIX . '@example.com';
    $saved = api('POST', '/applicants', null, [
        fieldPart('job_post_id', $jobId),
        fieldPart('name', $TAG . ' Pipeline Candidate'),
        fieldPart('email', $email),
        fieldPart('phone', '0917 555 0000'),
        fieldPart('source', 'Integration Test'),
        fieldPart('status', 'fit'),
        fieldPart('stage', 'Screened'),
        fieldPart('summary', 'hrms-integration-test pipeline candidate'),
        fieldPart('flags_json', '[]'),
        filePart('resume', $pdf, 'pipeline-resume.pdf'),
    ]);
    $appId = $saved['json']['applicant_id'] ?? null;
    $CTX['apl_applicant_id'] = $appId;
    record(
        'applicant',
        'Applicant created with resume (screening persisted)',
        in_array($saved['status'], [200, 201], true) && $appId !== null && (int) scalar('SELECT COUNT(*) FROM applicant_screenings WHERE applicant_id = ?', [$appId]) >= 1,
        "http={$saved['status']} applicant_id={$appId} screenings=" . ($appId ? DB::table('applicant_screenings')->where('applicant_id', $appId)->count() : 0)
    );

    if (! $appId) {
        return;
    }

    /* 2. Accept & Schedule — applicant moves to Accepted ------------------- */
    $acc = api('PUT', "/applicants/{$appId}", ['stage' => 'Accepted']);
    $stage = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    record('applicant', 'Accept — applicant marked Accepted', $acc['status'] === 200 && $stage === 'Accepted', "http={$acc['status']} db stage={$stage}");

    /* 3. Book an Interview — whole facility request → Scheduled ------------ */
    $date1 = date('Y-m-d', strtotime('+1 day'));
    $book = api('POST', '/interviews', [
        'applicant_id'   => $appId,
        'scheduled_date' => $date1,
        'scheduled_time' => '09:00',
        'mode'           => 'On-site',
        'facility_id'    => $facilityId,
    ]);
    $interviewId = $book['json']['interview_id'] ?? null;
    $CTX['interview_id'] = $interviewId;
    $iStatus = $interviewId ? scalar('SELECT status FROM interviews WHERE interview_id = ?', [$interviewId]) : null;
    $iFacility = $interviewId ? (string) scalar('SELECT facility_status FROM interviews WHERE interview_id = ?', [$interviewId]) : '';
    $stageNow = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    record(
        'applicant',
        'Book an Interview — request facility → scheduled',
        in_array($book['status'], [200, 201], true) && $interviewId !== null && $iStatus === 'Scheduled' && str_starts_with($iFacility, 'Waiting') && $stageNow === 'Interview Scheduled',
        "http={$book['status']} interview_id={$interviewId} status={$iStatus} facility_status='{$iFacility}' applicant_stage={$stageNow}"
    );

    // __APPLICANT_PART_A__

    /* 4. Confirm facility request → Facility Approved ---------------------- */
    if ($interviewId) {
        $fa = api('POST', "/interviews/{$interviewId}/facility-approve");
        $iFacility2 = (string) scalar('SELECT facility_status FROM interviews WHERE interview_id = ?', [$interviewId]);
        record('applicant', 'Confirm facility request → Facility Approved', $fa['status'] === 200 && $iFacility2 === 'Facility Approved', "http={$fa['status']} db facility_status='{$iFacility2}'");
    }

    /* 5. Reschedule interview ---------------------------------------------- */
    if ($interviewId) {
        $date2 = date('Y-m-d', strtotime('+3 day'));
        $resched = api('PUT', "/interviews/{$interviewId}", [
            'scheduled_date'   => $date2,
            'scheduled_time'   => '13:30',
            'mode'             => 'Virtual',
            'interviewer_name' => $TAG . ' Interviewer',
            'status'           => 'Scheduled',
        ]);
        $rDate = (string) scalar('SELECT scheduled_date FROM interviews WHERE interview_id = ?', [$interviewId]);
        $rTime = (string) scalar('SELECT scheduled_time FROM interviews WHERE interview_id = ?', [$interviewId]);
        record('applicant', 'Reschedule interview persists', $resched['status'] === 200 && substr($rDate, 0, 10) === $date2 && str_starts_with($rTime, '13:30'), "http={$resched['status']} db date={$rDate} time={$rTime}");
    }

    /* 6. Cancel interview (UI writes status = Cancelled) -------------------- */
    if ($interviewId) {
        $cancel = api('PUT', "/interviews/{$interviewId}", ['status' => 'Cancelled']);
        $cStat = scalar('SELECT status FROM interviews WHERE interview_id = ?', [$interviewId]);
        record('applicant', 'Cancel interview → status Cancelled', $cancel['status'] === 200 && $cStat === 'Cancelled', "http={$cancel['status']} db status={$cStat}");
    }

    /* 7. Schedule interview again (previous booking is cancelled) ----------- */
    $book2 = api('POST', '/interviews', [
        'applicant_id'   => $appId,
        'scheduled_date' => date('Y-m-d', strtotime('+2 day')),
        'scheduled_time' => '10:00',
        'mode'           => 'Virtual',
    ]);
    $interview2 = $book2['json']['interview_id'] ?? null;
    $CTX['interview_id_2'] = $interview2;
    $i2Status = $interview2 ? scalar('SELECT status FROM interviews WHERE interview_id = ?', [$interview2]) : null;
    record('applicant', 'Schedule interview again after cancellation', in_array($book2['status'], [200, 201], true) && $interview2 !== null && $i2Status === 'Scheduled', "http={$book2['status']} interview_id={$interview2} status={$i2Status}");

    // __APPLICANT_PART_B__

    /* 8. Interview assessment (Passed) — required gate for the next stages -- */
    $assess = api('POST', "/applicants/{$appId}/assessments", [
        'applicant_id'     => $appId,
        'assessor_user_id' => $userId,
        'assessment_date'  => date('Y-m-d'),
        'scores_json'      => ['Communication' => 90, 'Customer Service' => 86],
        'comments_json'    => ['Communication' => 'Clear and professional.'],
        'total_score'      => 88,
        'outcome'          => 'Recommended',
        'result'           => 'Passed',
        'remarks'          => $TAG . ' interview assessment',
    ]);
    $assessRow = DB::table('applicant_assessments')->where('applicant_id', $appId)->orderByDesc('assessment_id')->first();
    $stageAfterAssess = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    record(
        'applicant',
        'Interview assessment Passed persists + stage Assessed',
        $assess['status'] === 201 && $assessRow !== null && (float) $assessRow->total_score === 88.0 && $stageAfterAssess === 'Assessed',
        "http={$assess['status']} assessment_id=" . ($assessRow->assessment_id ?? 'n/a') . " score=" . ($assessRow->total_score ?? 'n/a') . " stage={$stageAfterAssess}"
    );

    /* 9. Start assessment test (after interview assessment) ------------------ */
    $test = api('POST', "/applicants/{$appId}/assessment-tests", [
        'assessor_user_id' => $userId,
        'test_title'       => $TAG . ' Job Knowledge Test',
        'questions_json'   => [
            ['question' => 'How do you handle an overbooked night?', 'points' => 50],
            ['question' => 'Walk through a check-in procedure.', 'points' => 50],
        ],
        'scores_json'      => [0 => 45, 1 => 40],
        'total_score'      => 85,
        'passing_score'    => 75,
        'result'           => 'Passed',
        'test_date'        => date('Y-m-d'),
        'remarks'          => $TAG . ' assessment test',
    ]);
    $testRow = DB::table('assessment_tests')->where('applicant_id', $appId)->orderByDesc('assessment_test_id')->first();
    $stageAfterTest = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    record(
        'applicant',
        'Start Assessment Test — record + stage Assessment Test',
        $test['status'] === 201 && $testRow !== null && $testRow->result === 'Passed' && $stageAfterTest === 'Assessment Test',
        "http={$test['status']} test_id=" . ($testRow->assessment_test_id ?? 'n/a') . ' result=' . ($testRow->result ?? 'n/a') . " stage={$stageAfterTest}"
    );

    // __APPLICANT_PART_C__

    /* 10. Start practical test (position requires it) ------------------------ */
    $prac = api('POST', "/applicants/{$appId}/practical-tests", [
        'assessor_user_id' => $userId,
        'task_title'       => $TAG . ' Practical Task',
        'criteria_json'    => [
            ['criterion' => 'Speed', 'max' => 50],
            ['criterion' => 'Accuracy', 'max' => 50],
        ],
        'scores_json'      => ['Speed' => 45, 'Accuracy' => 45],
        'total_score'      => 90,
        'result'           => 'Passed',
        'test_date'        => date('Y-m-d'),
        'remarks'          => $TAG . ' practical assessment',
    ]);
    $pracRow = DB::table('practical_tests')->where('applicant_id', $appId)->orderByDesc('practical_test_id')->first();
    $stageAfterPrac = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    record(
        'applicant',
        'Start Practical Test — record + stage Practical Test',
        $prac['status'] === 201 && $pracRow !== null && $pracRow->result === 'Passed' && $stageAfterPrac === 'Practical Test',
        "http={$prac['status']} practical_id=" . ($pracRow->practical_test_id ?? 'n/a') . ' result=' . ($pracRow->result ?? 'n/a') . " stage={$stageAfterPrac}"
    );

    /* 11. Complete final evaluation ----------------------------------------- */
    $final = api('POST', "/applicants/{$appId}/final-evaluations", [
        'evaluated_by_user_id' => $userId,
        'evaluation_date'      => date('Y-m-d'),
        'recommendation'       => 'Recommended for Hire',
        'overall_remarks'      => $TAG . ' final evaluation',
    ]);
    $finalRow = DB::table('final_evaluations')->where('applicant_id', $appId)->orderByDesc('final_evaluation_id')->first();
    $stageAfterFinal = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    record(
        'applicant',
        'Complete Final Evaluation — whole-process snapshot persisted',
        $final['status'] === 201 && $finalRow !== null
            && (float) $finalRow->interview_score === 88.0
            && (float) $finalRow->assessment_test_score === 85.0
            && (float) $finalRow->practical_test_score === 90.0
            && $finalRow->recommendation === 'Recommended for Hire'
            && $stageAfterFinal === 'Final Evaluation',
        "http={$final['status']} id=" . ($finalRow->final_evaluation_id ?? 'n/a') . ' interview=' . ($finalRow->interview_score ?? 'n/a') . ' test=' . ($finalRow->assessment_test_score ?? 'n/a') . ' practical=' . ($finalRow->practical_test_score ?? 'n/a') . " stage={$stageAfterFinal}"
    );

    /* 12. Verify candidate decision → accept (hire) -------------------------- */
    // NOTE: the "Verify candidate decision" dialog only stores the choice in
    // local component state (no endpoint) — its persisted effect is the hire
    // action below, which moves Final Evaluation → Offer → Hired.
    $h1 = api('POST', "/applicants/{$appId}/hire");
    $s1 = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    $h2 = api('POST', "/applicants/{$appId}/hire");
    $s2 = scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$appId]);
    record(
        'applicant',
        'Accept verified decision → hire flow (Final Evaluation → Offer → Hired)',
        $h1['status'] === 200 && $s1 === 'Offer' && $h2['status'] === 200 && $s2 === 'Hired',
        "offer_http={$h1['status']} stage1={$s1} hire_http={$h2['status']} stage2={$s2}"
    );
    record(
        'applicant',
        'Verify candidate decision — the verified choice itself is persisted',
        false,
        'UI-only: confirmVerifyFinal() stores the choice in local state; only the hire action writes to the DB (applicants.stage)'
    );

    /* 13. Reject flow (separate applicant) ----------------------------------- */
    $rejEmail = 'test.reject.' . $SUFFIX . '@example.com';
    $rejCreate = api('POST', '/applicants', [
        'job_post_id' => $jobId,
        'name'        => $TAG . ' Reject Candidate',
        'email'       => $rejEmail,
        'phone'       => '0917 555 2222',
        'source'      => 'Integration Test',
        'status'      => 'not-fit',
        'stage'       => 'Screened',
    ]);
    $rejId = $rejCreate['json']['applicant_id'] ?? null;
    $CTX['apl_reject_id'] = $rejId;
    $rej = $rejId ? api('PUT', "/applicants/{$rejId}", ['stage' => 'Rejected']) : ['status' => 0];
    $rejStage = $rejId ? scalar('SELECT stage FROM applicants WHERE applicant_id = ?', [$rejId]) : null;
    record('applicant', 'Reject applicant — stage Rejected persists', $rejId !== null && $rej['status'] === 200 && $rejStage === 'Rejected', "applicant_id={$rejId} http={$rej['status']} db stage={$rejStage}");

    section_applicant_cleanup();
}

/* Removes pipeline TEST rows (unless --keep). */
function section_applicant_cleanup(): void
{
    global $CTX, $KEEP;

    if ($KEEP) {
        note('--keep set: pipeline TEST rows left in the database for manual UI review');
        return;
    }

    $ids = array_values(array_filter([$CTX['apl_applicant_id'] ?? null, $CTX['apl_reject_id'] ?? null]));
    foreach ($ids as $id) {
        DB::table('applicant_screening_scores')->where('applicant_id', $id)->delete();
        DB::table('applicant_screening_entities')->where('applicant_id', $id)->delete();
        DB::table('applicant_screenings')->where('applicant_id', $id)->delete();
        DB::table('applicant_assessments')->where('applicant_id', $id)->delete();
        DB::table('assessment_tests')->where('applicant_id', $id)->delete();
        DB::table('practical_tests')->where('applicant_id', $id)->delete();
        DB::table('final_evaluations')->where('applicant_id', $id)->delete();
        DB::table('interviews')->where('applicant_id', $id)->delete();
        api('DELETE', "/applicants/{$id}");
    }

    $jobId = $CTX['apl_job_post_id'] ?? null;
    if ($jobId) {
        api('DELETE', "/job-posts/{$jobId}");
    }

    $leftoverApplicants = $ids ? (int) DB::table('applicants')->whereIn('applicant_id', $ids)->count() : 0;
    $leftoverJob = $jobId ? (int) scalar('SELECT COUNT(*) FROM job_posts WHERE job_post_id = ?', [$jobId]) : 0;
    record('applicant', 'Cleanup — pipeline TEST rows removed', $leftoverApplicants === 0 && $leftoverJob === 0, "applicants_remaining={$leftoverApplicants} job_post_remaining={$leftoverJob}");
}

/* ------------------------------------------------------------------ */
/* Section: new hire onboarding — write path                            */
/* ------------------------------------------------------------------ */

function section_onboarding(): void
{
    global $TAG, $SUFFIX, $CTX, $KEEP;

    if (! ensureLoggedIn()) {
        return;
    }

    $deptId     = firstId('departments', 'department_id');
    $posId      = firstId('positions', 'position_id');
    $employeeId = firstId('employees', 'employee_id');

    /* 1. Add new hire ------------------------------------------------------ */
    $hireEmail = 'test.hire.' . $SUFFIX . '@example.com';
    $hire = api('POST', '/new-hires', [
        'name'          => $TAG . ' New Hire',
        'email'         => $hireEmail,
        'phone'         => '0917 555 3333',
        'position_id'   => $posId,
        'department_id' => $deptId,
        'stage'         => 'Pre-onboarding',
        'start_date'    => date('Y-m-d'),
    ]);
    $hireId = $hire['json']['new_hire_id'] ?? null;
    $CTX['hire_id'] = $hireId;
    $hireEmail = 'test.hire.' . $SUFFIX . '@example.com';
    record(
        'onboarding',
        'Add new hire — row persisted (+ portal account created)',
        in_array($hire['status'], [200, 201], true) && $hireId !== null
            && (int) scalar('SELECT COUNT(*) FROM new_hires WHERE new_hire_id = ?', [$hireId]) === 1
            && (int) scalar('SELECT COUNT(*) FROM system_users WHERE email = ?', [$hireEmail]) === 1,
        "http={$hire['status']} new_hire_id={$hireId} portal_account=" . ((int) scalar('SELECT COUNT(*) FROM system_users WHERE email = ?', [$hireEmail]) === 1 ? 'created' : 'missing')
    );

    if (! $hireId) {
        return;
    }

    /* 2. Create checklist (save checklist) ---------------------------------- */
    $tpl = api('POST', '/checklist-templates', [
        'title'               => $TAG . ' Checklist',
        'phase'               => 'Probationary',
        'position_scope_json' => [],
        'status'              => 'Inactive',
        'items'               => [
            ['item_text' => $TAG . ' Item One', 'instructions' => 'Bring a copy', 'requires_upload' => false, 'upload_placeholder' => '', 'sort_order' => 0],
            ['item_text' => $TAG . ' Item Two', 'sort_order' => 1],
        ],
    ]);
    $tplId = $tpl['json']['template_id'] ?? null;
    $CTX['tpl_id'] = $tplId;
    $tplItems = $tplId ? (int) scalar('SELECT COUNT(*) FROM onboarding_checklist_items WHERE template_id = ?', [$tplId]) : 0;
    record('onboarding', 'Create checklist — template + items persisted', $tpl['status'] === 201 && $tplId !== null && $tplItems === 2, "http={$tpl['status']} template_id={$tplId} items={$tplItems}");

    // __ONBOARDING_PART_B__

    /* 3. Edit checklist (update template + item sync) ------------------------ */
    $upd = api('PUT', "/checklist-templates/{$tplId}", [
        'title'               => $TAG . ' Checklist Updated',
        'phase'               => 'Probationary',
        'position_scope_json' => [],
        'status'              => 'Inactive',
        'items'               => [
            ['item_text' => $TAG . ' Item One Updated', 'sort_order' => 0],
            ['item_text' => $TAG . ' Item Three', 'sort_order' => 1],
        ],
    ]);
    $updatedTitle = scalar('SELECT title FROM onboarding_checklist_templates WHERE template_id = ?', [$tplId]);
    $itemTexts = DB::table('onboarding_checklist_items')->where('template_id', $tplId)->orderBy('sort_order')->pluck('item_text')->toArray();
    record(
        'onboarding',
        'Edit checklist — title + items updated in DB',
        $upd['status'] === 200 && $updatedTitle === $TAG . ' Checklist Updated'
            && in_array($TAG . ' Item Three', $itemTexts, true)
            && ! in_array($TAG . ' Item Two', $itemTexts, true),
        "http={$upd['status']} db title='{$updatedTitle}' items=" . jdump($itemTexts)
    );

    /* 4. Activate checklist --------------------------------------------------- */
    $act = api('PUT', "/checklist-templates/{$tplId}", ['status' => 'Active']);
    $statusNow = scalar('SELECT status FROM onboarding_checklist_templates WHERE template_id = ?', [$tplId]);
    record('onboarding', 'Activate checklist — status Active persisted', $act['status'] === 200 && $statusNow === 'Active', "http={$act['status']} db status={$statusNow}");

    /* 5. Edit checklist in the onboarding pipeline ----------------------------- */
    // Checklist phases are stage-gated: a Probationary checklist applies once the
    // hire is promoted (the pipeline's "advance stage" action), which is also
    // what materializes the rows via OnboardingChecklistTemplate::applyAllFor().
    $promote = api('POST', "/new-hires/{$hireId}/promote-stage");
    $stageNow = scalar('SELECT stage FROM new_hires WHERE new_hire_id = ?', [$hireId]);
    record('onboarding', 'Pipeline — hire advanced to Probationary (promote-stage)', $promote['status'] === 200 && $stageNow === 'Probationary', "http={$promote['status']} db stage={$stageNow}");

    $visible = api('GET', "/new-hires/{$hireId}/onboarding-items");
    $visibleItems = (array) ($visible['json'] ?? []);
    $visibleTexts = array_map(fn ($i) => $i['item_text'] ?? '', $visibleItems);
    $hasTemplateItem = in_array($TAG . ' Item One Updated', $visibleTexts, true) && in_array($TAG . ' Item Three', $visibleTexts, true);
    $materialized = count(array_filter($visibleItems, fn ($i) => ($i['employee_onboarding_item_id'] ?? null) !== null));
    record(
        'onboarding',
        'Pipeline — active template items appear for the promoted hire',
        $visible['status'] === 200 && $hasTemplateItem,
        'visible_items=' . count($visibleTexts) . ' matched=' . jdump($hasTemplateItem) . ' materialized=' . $materialized
    );

    /* 6. Materialize + toggle a pipeline item -------------------------------- */
    $virtualItem = null;
    $materializedItem = null;
    foreach ($visibleItems as $vi) {
        if ($virtualItem === null && ($vi['employee_onboarding_item_id'] ?? null) === null && ! empty($vi['template_item_id'])) {
            $virtualItem = $vi;
        }
        if ($materializedItem === null && ($vi['employee_onboarding_item_id'] ?? null) !== null) {
            $materializedItem = $vi;
        }
    }

    $itemId = null;
    if ($virtualItem) {
        $mat = api('POST', "/new-hires/{$hireId}/onboarding-items", ['template_item_id' => $virtualItem['template_item_id']]);
        $itemId = $mat['json']['employee_onboarding_item_id'] ?? null;
        record('onboarding', 'Pipeline checklist — materialize a virtual item', in_array($mat['status'], [200, 201], true) && $itemId !== null && (int) scalar('SELECT COUNT(*) FROM employee_onboarding_items WHERE employee_onboarding_item_id = ?', [$itemId]) === 1, "http={$mat['status']} item_id={$itemId}");
    } else {
        $itemId = $materializedItem['employee_onboarding_item_id'] ?? null;
        record('onboarding', 'Pipeline checklist — items auto-materialized by template apply', $itemId !== null, "item_id={$itemId} (rows created by promote-stage)");
    }
    $CTX['onboarding_item_id'] = $itemId;

    if ($itemId) {
        $toggle = api('PATCH', "/onboarding-items/{$itemId}/toggle", ['done' => true]);
        $row = DB::table('employee_onboarding_items')->where('employee_onboarding_item_id', $itemId)->first();
        record(
            'onboarding',
            'Pipeline checklist — item marked done persists',
            $toggle['status'] === 200 && $row !== null && (bool) $row->done && $row->completed_at !== null,
            "http={$toggle['status']} done=" . jdump($row->done ?? null) . ' completed_at=' . ($row->completed_at ?? 'null')
        );
    }

    /* 7. Close checklist ------------------------------------------------------ */
    $close = api('PUT', "/checklist-templates/{$tplId}", ['status' => 'Inactive']);
    $statusClosed = scalar('SELECT status FROM onboarding_checklist_templates WHERE template_id = ?', [$tplId]);
    record('onboarding', 'Close checklist — status Inactive persisted', $close['status'] === 200 && $statusClosed === 'Inactive', "http={$close['status']} db status={$statusClosed}");

    // __ONBOARDING_PART_C__

    /* 8. Request for evaluation (+ cancel) ------------------------------------ */
    $evalAt = now()->toIso8601String();
    $evalReq = api('PUT', "/new-hires/{$hireId}", ['evaluation_requested_at' => $evalAt]);
    $evalDb = scalar('SELECT evaluation_requested_at FROM new_hires WHERE new_hire_id = ?', [$hireId]);
    record('onboarding', 'Request for evaluation — timestamp persisted', $evalReq['status'] === 200 && $evalDb !== null, "http={$evalReq['status']} db={$evalDb}");

    $evalCancel = api('PUT', "/new-hires/{$hireId}", ['evaluation_requested_at' => null]);
    $evalDb2 = scalar('SELECT evaluation_requested_at FROM new_hires WHERE new_hire_id = ?', [$hireId]);
    record('onboarding', 'Request for evaluation — cancel clears the timestamp', $evalCancel['status'] === 200 && $evalDb2 === null, "http={$evalCancel['status']} db=" . jdump($evalDb2));

    /* 9. Auto-regularization setting ------------------------------------------ */
    $origAuto = scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'onboarding.auto_regularize_days'");
    $auto = api('PUT', '/settings/onboarding.auto_regularize_days', ['setting_value' => 150]);
    $autoDb = scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'onboarding.auto_regularize_days'");
    record('onboarding', 'Auto-regularization — Save setting persisted', $auto['status'] === 200 && (int) trim((string) $autoDb, '"') === 150, "http={$auto['status']} db={$autoDb}");
    if ($origAuto !== null) {
        api('PUT', '/settings/onboarding.auto_regularize_days', ['setting_value' => json_decode((string) $origAuto, true)]);
    } else {
        api('DELETE', '/settings/onboarding.auto_regularize_days');
    }
    note('auto-regularization threshold restored to ' . ($origAuto ?? 'defaults'));

    /* 10. Delete checklist (no requests attached yet) --------------------------- */
    $del = api('DELETE', "/checklist-templates/{$tplId}");
    $tplGone = (int) scalar('SELECT COUNT(*) FROM onboarding_checklist_templates WHERE template_id = ?', [$tplId]);
    $itemsGone = (int) scalar('SELECT COUNT(*) FROM onboarding_checklist_items WHERE template_id = ?', [$tplId]);
    record('onboarding', 'Delete checklist — template + items removed (FK cascade)', $del['status'] === 200 && $tplGone === 0 && $itemsGone === 0, "http={$del['status']} template_remaining={$tplGone} items_remaining={$itemsGone}");

    /* 11. Requested checklist — create / edit / delete -------------------------- */
    $tplB = api('POST', '/checklist-templates', [
        'title'  => $TAG . ' Requested-Checklist Target',
        'phase'  => 'Probationary',
        'status' => 'Inactive',
    ]);
    $tplBId = $tplB['json']['template_id'] ?? null;

    if ($employeeId && $tplBId) {
        $cr = api('POST', '/checklist-requests', [
            'employee_id'  => $employeeId,
            'template_id'  => $tplBId,
            'phase'        => 'Probationary',
            'items_json'   => [$TAG . ' requested item'],
            'requested_at' => date('Y-m-d'),
        ]);
        $crId = $cr['json']['checklist_request_id'] ?? null;
        $CTX['checklist_request_id'] = $crId;
        record('onboarding', 'Requested checklist — create persists (POST /checklist-requests)', in_array($cr['status'], [200, 201], true) && $crId !== null && (int) scalar('SELECT COUNT(*) FROM checklist_requests WHERE checklist_request_id = ?', [$crId]) === 1, "http={$cr['status']} id={$crId}");

        if ($crId) {
            $crUpd = api('PUT', "/checklist-requests/{$crId}", ['items_json' => [$TAG . ' requested item v2'], 'status' => 'Approved']);
            $crStatus = scalar('SELECT status FROM checklist_requests WHERE checklist_request_id = ?', [$crId]);
            record('onboarding', 'Edit requested checklist — PUT persists (API)', $crUpd['status'] === 200 && $crStatus === 'Approved', "http={$crUpd['status']} db status={$crStatus}");
        }

        record(
            'onboarding',
            'Delete requested checklist — persists to DB',
            false,
            'UI-only: deleteRequestedItem() filters local state only; no DELETE route exists for /checklist-requests'
        );

        // Finding: a template referenced by a requested checklist cannot be deleted
        // (FK fk_checklist_requests_template_id is RESTRICT), and the failure
        // surfaces as a 500 instead of a friendly 422.
        $delBlocked = api('DELETE', "/checklist-templates/{$tplBId}");
        $tplBLeft = (int) scalar('SELECT COUNT(*) FROM onboarding_checklist_templates WHERE template_id = ?', [$tplBId]);
        record(
            'onboarding',
            'Delete checklist with a linked requested checklist — clean handling',
            $delBlocked['status'] === 200,
            "http={$delBlocked['status']} remaining={$tplBLeft} — FK is RESTRICT; frontend also deletes optimistically (fire-and-forget) and toasts \"Checklist deleted\""
        );

        // Housekeeping so the FK target can be removed.
        if ($crId) {
            DB::table('checklist_requests')->where('checklist_request_id', $crId)->delete();
        }
        $delAfter = api('DELETE', "/checklist-templates/{$tplBId}");
        $tplBGone = (int) scalar('SELECT COUNT(*) FROM onboarding_checklist_templates WHERE template_id = ?', [$tplBId]);
        record('onboarding', 'Delete checklist — succeeds once no request references it', $delAfter['status'] === 200 && $tplBGone === 0, "http={$delAfter['status']} remaining={$tplBGone}");
    } else {
        record('onboarding', 'Requested checklist — create persists', false, 'no employees row / template available');
    }

    section_onboarding_cleanup();
}

/* Removes onboarding TEST rows (unless --keep). */
function section_onboarding_cleanup(): void
{
    global $CTX, $KEEP, $SUFFIX;

    if ($KEEP) {
        note('--keep set: onboarding TEST rows left in the database for manual UI review');
        return;
    }

    $hireId = $CTX['hire_id'] ?? null;
    if ($hireId) {
        DB::table('employee_onboarding_items')->where('new_hire_id', $hireId)->delete();
        api('DELETE', "/new-hires/{$hireId}");
    }

    $crId = $CTX['checklist_request_id'] ?? null;
    if ($crId) {
        DB::table('checklist_requests')->where('checklist_request_id', $crId)->delete();
    }

    $hireEmail = 'test.hire.' . $SUFFIX . '@example.com';
    DB::table('system_users')->where('email', $hireEmail)->delete();

    $hireGone = $hireId ? (int) scalar('SELECT COUNT(*) FROM new_hires WHERE new_hire_id = ?', [$hireId]) : 0;
    $crGone = $crId ? (int) scalar('SELECT COUNT(*) FROM checklist_requests WHERE checklist_request_id = ?', [$crId]) : 0;
    record('onboarding', 'Cleanup — TEST rows removed', $hireGone === 0 && $crGone === 0, "new_hire_remaining={$hireGone} checklist_request_remaining={$crGone}");
}

/* ------------------------------------------------------------------ */
/* Section: settings — notifications, preferences, security, company    */
/* ------------------------------------------------------------------ */

function section_settings(): void
{
    global $TAG, $SUFFIX, $EMAIL, $PASSWORD, $CTX;

    if (! ensureLoggedIn()) {
        return;
    }

    $userRow = DB::table('system_users')->where('email', $EMAIL)->orWhere('username', $EMAIL)->first();
    if (! $userRow) {
        record('settings', 'account lookup', false, "no system_users row for {$EMAIL}");
        return;
    }
    $userId = (int) $userRow->system_user_id;
    $origOtp = (int) $userRow->otp_enabled;
    $settingsMap = api('GET', '/settings')['json']['map'] ?? [];
    $origCompany = $settingsMap['company'] ?? null;
    $origSecurity = $settingsMap['security'] ?? null;

    /* 1. Email / Browser notifications + System announcements (toggles) ------ */
    $notifKey = 'my_notifications_' . strtolower($EMAIL);
    $origNotif = scalar('SELECT setting_value FROM system_settings WHERE setting_key = ?', [$notifKey]);
    $notifValue = ['Email notifications' => true, 'Browser notifications' => false, 'System announcements' => true];
    $savedN = api('PUT', '/my/settings/notifications', ['user' => $EMAIL, 'value' => $notifValue]);
    $dbN = json_decode((string) scalar('SELECT setting_value FROM system_settings WHERE setting_key = ?', [$notifKey]), true) ?: [];
    record(
        'settings',
        'Email / Browser notifications + System announcements — save changes',
        $savedN['status'] === 200 && ($dbN['Email notifications'] ?? null) === true && ($dbN['Browser notifications'] ?? null) === false && ($dbN['System announcements'] ?? null) === true,
        'http=' . $savedN['status'] . ' db=' . jdump($dbN)
    );
    if ($origNotif !== null) {
        api('PUT', '/my/settings/notifications', ['user' => $EMAIL, 'value' => json_decode((string) $origNotif, true)]);
    } else {
        api('DELETE', "/settings/{$notifKey}");
    }

    /* 2. Preferences — theme / date format / language / time format / tz ----- */
    $prefKey = 'my_preferences_' . strtolower($EMAIL);
    $origPref = scalar('SELECT setting_value FROM system_settings WHERE setting_key = ?', [$prefKey]);
    $prefValue = ['theme' => 'Dark', 'dateFormat' => 'DD/MM/YYYY', 'language' => 'Filipino', 'timeFormat' => '24-hour', 'timeZone' => 'Asia/Manila (GMT+8)'];
    $savedP = api('PUT', '/my/settings/preferences', ['user' => $EMAIL, 'value' => $prefValue]);
    $dbP = json_decode((string) scalar('SELECT setting_value FROM system_settings WHERE setting_key = ?', [$prefKey]), true) ?: [];
    record(
        'settings',
        'Preference — theme, date format, language, time format, time zone (Save changes)',
        $savedP['status'] === 200 && ($dbP['theme'] ?? null) === 'Dark' && ($dbP['dateFormat'] ?? null) === 'DD/MM/YYYY' && ($dbP['language'] ?? null) === 'Filipino' && ($dbP['timeFormat'] ?? null) === '24-hour' && ($dbP['timeZone'] ?? null) === 'Asia/Manila (GMT+8)',
        'db=' . jdump($dbP)
    );
    if ($origPref !== null) {
        api('PUT', '/my/settings/preferences', ['user' => $EMAIL, 'value' => json_decode((string) $origPref, true)]);
    } else {
        api('DELETE', "/settings/{$prefKey}");
    }

    // __SETTINGS_PART_B__

    /* 3. Login Security policy — 2FA + password requirements ---------------- */
    $security = [
        'twoFactor'        => true,
        'minLength'        => 12,
        'requireUppercase' => true,
        'requireLowercase' => true,
        'requireNumber'    => true,
        'requireSymbol'    => true,
        'sessionTimeout'   => '30 minutes',
        'maxLoginAttempts' => '5 attempts',
    ];
    $savedSec = api('PUT', '/settings/security', ['setting_value' => $security]);
    $dbSec = json_decode((string) scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'security'"), true) ?: [];
    record(
        'settings',
        'Login Security — Two-factor + password rules (Save changes)',
        $savedSec['status'] === 200 && ($dbSec['minLength'] ?? null) === 12 && ($dbSec['requireSymbol'] ?? null) === true && ($dbSec['twoFactor'] ?? null) === true,
        'db=' . jdump($dbSec)
    );
    if ($origSecurity) {
        api('PUT', '/settings/security', ['setting_value' => $origSecurity]);
    }

    /* 4. OTP verification at login (per-account toggle) ---------------------- */
    $flipped = $origOtp === 1 ? false : true;
    $otp1 = api('PUT', '/my/otp', ['enabled' => $flipped]);
    $dbOtp1 = (int) scalar('SELECT otp_enabled FROM system_users WHERE system_user_id = ?', [$userId]);
    $otp2 = api('PUT', '/my/otp', ['enabled' => (bool) $origOtp]);
    $dbOtp2 = (int) scalar('SELECT otp_enabled FROM system_users WHERE system_user_id = ?', [$userId]);
    record(
        'settings',
        'Security — OTP verification at login toggles + persists (PUT /my/otp)',
        $otp1['status'] === 200 && $dbOtp1 === (int) $flipped && $otp2['status'] === 200 && $dbOtp2 === $origOtp,
        "on={$dbOtp1} off/restored={$dbOtp2} (original={$origOtp})"
    );

    /* 5. Update Password (change + revert) ----------------------------------- */
    $tempPassword = 'TestPass@' . $SUFFIX;
    $ch1 = api('POST', '/my/change-password', ['user' => $EMAIL, 'current_password' => $PASSWORD, 'new_password' => $tempPassword]);
    $hash1 = Hash::check($tempPassword, (string) scalar('SELECT password_hash FROM system_users WHERE system_user_id = ?', [$userId]));
    $ch2 = api('POST', '/my/change-password', ['user' => $EMAIL, 'current_password' => $tempPassword, 'new_password' => $PASSWORD]);
    $hash2 = Hash::check($PASSWORD, (string) scalar('SELECT password_hash FROM system_users WHERE system_user_id = ?', [$userId]));
    record(
        'settings',
        'Security — Update Password (change persists, then reverted)',
        $ch1['status'] === 200 && $hash1 && $ch2['status'] === 200 && $hash2,
        "change_http={$ch1['status']} hash_ok={$hash1} revert_http={$ch2['status']} revert_ok={$hash2}"
    );

    /* 6. Company info — save + public career page cross-check ---------------- */
    $company = [
        'name'          => 'Oxford Suites Test Co',
        'email'         => 'hr.test@example.com',
        'contact'       => '+63 2 5555 0000',
        'businessHours' => 'Mon-Fri 9AM-6PM',
        'address'       => 'Test Address, Makati',
        'tin'           => '000-111-222',
    ];
    $savedC = api('PUT', '/settings/company', ['setting_value' => $company]);
    $dbC = json_decode((string) scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'company'"), true) ?: [];
    record(
        'settings',
        'Company — name/email/contact/business hours/address (Edit + save changes)',
        $savedC['status'] === 200 && ($dbC['name'] ?? null) === 'Oxford Suites Test Co' && ($dbC['businessHours'] ?? null) === 'Mon-Fri 9AM-6PM',
        'db=' . jdump($dbC)
    );
    $landing = api('GET', '/landing/company');
    record(
        'settings',
        'Company — public career page reflects the saved company info',
        ($landing['json']['data']['name'] ?? null) === 'Oxford Suites Test Co',
        'landing name=' . ($landing['json']['data']['name'] ?? 'n/a')
            . ' — Settings writes one system_settings key "company" ({name,email,contact,businessHours,address,tin});'
            . ' LandingController::company() instead reads per-key rows "company.name"/"company.address"/"company.phone"/"company.email"/"company.hours"'
    );
    if ($origCompany) {
        api('PUT', '/settings/company', ['setting_value' => $origCompany]);
    }

    /* 7. System announcements (create + delete) ------------------------------ */
    $ann = api('POST', '/announcements', [
        'title'    => $TAG . ' Announcement',
        'body'     => 'Integration test announcement body.',
        'audience' => 'All',
        'status'   => 'published',
    ]);
    $annId = $ann['json']['data']['announcement_id'] ?? null;
    $annRows = $annId ? (int) scalar('SELECT COUNT(*) FROM announcements WHERE announcement_id = ?', [$annId]) : 0;
    record('settings', 'System announcements — create persists', $ann['status'] === 201 && $annId !== null && $annRows === 1, "http={$ann['status']} id={$annId}");
    if ($annId) {
        $annDel = api('DELETE', "/announcements/{$annId}");
        $annGone = (int) scalar('SELECT COUNT(*) FROM announcements WHERE announcement_id = ?', [$annId]);
        record('settings', 'System announcements — delete', $annDel['status'] === 200 && $annGone === 0, "http={$annDel['status']} remaining={$annGone}");
    }

    section_settings_backups($userId);
}

/** True when an ACTIVE (uncommented) scheduler entry runs the auto-backup command. */
function schedulerHasBackupJob(): bool
{
    $roots = [base_path('routes'), base_path('bootstrap'), base_path('Modules')];
    foreach ($roots as $root) {
        if (! is_dir($root)) {
            continue;
        }
        foreach (\Illuminate\Support\Facades\File::allFiles($root) as $file) {
            foreach (@file($file->getPathname()) ?: [] as $line) {
                $trimmed = ltrim($line);
                if ($trimmed === '' || str_starts_with($trimmed, '//') || str_starts_with($trimmed, '*') || str_starts_with($trimmed, '/*')) {
                    continue;
                }
                if (preg_match('/->command\(\s*[\'"]settings:auto-backup|withSchedule\(|Schedule::command\(/', $line)) {
                    return true;
                }
            }
        }
    }
    return false;
}

/* Backup & Restore card + destructive maintenance actions. */
function section_settings_backups(int $userId): void
{
    global $DESTRUCTIVE, $EMAIL, $PASSWORD;

    /* 8. Create backup -------------------------------------------------------- */
    $before = BackupService::entries();
    $cb = api('POST', '/settings/backups');
    $entry = $cb['json']['backup'] ?? null;
    $fileExists = $entry ? is_file(storage_path('app/backups') . DIRECTORY_SEPARATOR . ($entry['filename'] ?? '')) : false;
    $fileSize = $fileExists ? (int) filesize(storage_path('app/backups') . DIRECTORY_SEPARATOR . $entry['filename']) : 0;
    record(
        'settings',
        'Backup & Restore — Create backup (real .sql dump + entry)',
        $cb['status'] === 201 && $entry !== null && $fileExists && $fileSize > 0 && count(BackupService::entries()) === count($before) + 1,
        "http={$cb['status']} id=" . ($entry['id'] ?? 'n/a') . " file={$fileSize} bytes"
    );
    $backupId = $entry['id'] ?? null;

    /* 9. Download backup ------------------------------------------------------ */
    if ($backupId) {
        $dl = api('GET', "/settings/backups/{$backupId}/download");
        record('settings', 'Backup & Restore — Download .sql', $dl['status'] === 200 && str_starts_with($dl['body'], '-- Database backup'), "http={$dl['status']} bytes=" . strlen($dl['body']));
        $noAuth = api('GET', "/settings/backups/{$backupId}/download", null, null, true);
        note("download without a Bearer token → HTTP {$noAuth['status']} (route is outside auth:sanctum — security note)");
    }

    /* 10. Automatic backup toggle + scheduler --------------------------------- */
    $origBackup = scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'backup'");
    $ab = api('PUT', '/settings/backup', ['setting_value' => ['enabled' => true, 'schedule' => 'weekly']]);
    $dbB = json_decode((string) scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'backup'"), true) ?: [];
    record('settings', 'Backup & Restore — Automatic backup preference persists', $ab['status'] === 200 && ($dbB['schedule'] ?? null) === 'weekly' && ($dbB['enabled'] ?? null) === true, 'db=' . jdump($dbB));
    // The command exists (Modules/Settings/app/Console/RunSettingsAutoBackup.php,
    // signature settings:auto-backup) — verify it executes and respects the setting.
    $autoOut = '';
    try {
        \Illuminate\Support\Facades\Artisan::call('settings:auto-backup');
        $autoOut = trim(\Illuminate\Support\Facades\Artisan::output());
    } catch (\Throwable $e) {
        $autoOut = 'error: ' . $e->getMessage();
    }
    record('settings', 'Backup & Restore — automatic backup command executes (settings:auto-backup)', $autoOut !== '' && ! str_starts_with($autoOut, 'error:'), 'output: ' . substr($autoOut, 0, 150));

    $scheduled = schedulerHasBackupJob();
    record(
        'settings',
        'Backup & Restore — a scheduler triggers the automatic backup',
        $scheduled,
        $scheduled
            ? 'active schedule entry found'
            : 'command is registered but NOT scheduled anywhere (routes/console.php has no entry; the module schedule examples are commented out) — run `php artisan settings:auto-backup` manually or add a scheduler entry'
    );
    if ($origBackup !== null) {
        api('PUT', '/settings/backup', ['setting_value' => json_decode((string) $origBackup, true)]);
    }

    /* 11. Restore + change default password (destructive) ---------------------- */
    if (! $DESTRUCTIVE) {
        note('Restore + Change default password skipped — rerun with --destructive to include them');
        return;
    }

    if ($backupId) {
        $restore = api('POST', "/settings/backups/{$backupId}/restore");
        $countsAfter = [
            'applicants' => (int) scalar('SELECT COUNT(*) FROM applicants'),
            'new_hires'  => (int) scalar('SELECT COUNT(*) FROM new_hires'),
            'job_posts'  => (int) scalar('SELECT COUNT(*) FROM job_posts'),
        ];
        record(
            'settings',
            'Backup & Restore — Restore snapshot executes',
            $restore['status'] === 200 && str_contains((string) ($restore['json']['message'] ?? ''), 'statement'),
            'http=' . $restore['status'] . ' message=' . ($restore['json']['message'] ?? 'n/a') . ' spot_counts=' . jdump($countsAfter)
        );
    }

    $rdp = api('POST', '/reset-default-password', ['password' => 'Oxford@2026']);
    $updated = (int) ($rdp['json']['updated'] ?? 0);
    $dbDefault = json_decode((string) scalar("SELECT setting_value FROM system_settings WHERE setting_key = 'default_password'"), true) ?: [];
    $hashOk = Hash::check('Oxford@2026', (string) scalar('SELECT password_hash FROM system_users WHERE system_user_id = ?', [$userId]));
    record(
        'settings',
        'Login Security — Change default password of all users (Update all users)',
        $rdp['status'] === 200 && $updated > 0 && ($dbDefault['password'] ?? null) === 'Oxford@2026' && $hashOk,
        "http={$rdp['status']} updated={$updated} stored=" . jdump($dbDefault['password'] ?? null) . ' sample_hash_verifies=' . jdump($hashOk)
    );
    note("All active users now sign in with the default password Oxford@2026 ({$EMAIL} included).");
}

/* Removes any TEST- leftover rows from previous runs (idempotent sweep). */
function section_cleanup_test_rows(): void
{
    $deleted = [];

    $appIds = DB::table('applicants')->where('name', 'like', 'TEST-%')->pluck('applicant_id')->toArray();
    foreach ($appIds as $id) {
        DB::table('applicant_screening_scores')->where('applicant_id', $id)->delete();
        DB::table('applicant_screening_entities')->where('applicant_id', $id)->delete();
        DB::table('applicant_screenings')->where('applicant_id', $id)->delete();
        DB::table('applicant_assessments')->where('applicant_id', $id)->delete();
        DB::table('assessment_tests')->where('applicant_id', $id)->delete();
        DB::table('practical_tests')->where('applicant_id', $id)->delete();
        DB::table('final_evaluations')->where('applicant_id', $id)->delete();
        DB::table('interviews')->where('applicant_id', $id)->delete();
    }
    $deleted['applicants'] = DB::table('applicants')->whereIn('applicant_id', $appIds)->delete();

    // Requisitions first — they FK-link to the job post they were converted to.
    $deleted['requisitions'] = DB::table('requisitions')->where('justification', 'like', 'TEST-%')->delete();

    $deleted['job_posts'] = DB::table('job_posts')->where(function ($q) {
        $q->where('summary', 'like', 'TEST-%')->orWhere('description', 'like', 'TEST-%');
    })->delete();

    $hireIds = DB::table('new_hires')->where('name', 'like', 'TEST-%')->pluck('new_hire_id')->toArray();
    if ($hireIds) {
        DB::table('employee_onboarding_items')->whereIn('new_hire_id', $hireIds)->delete();
    }
    $deleted['new_hires'] = DB::table('new_hires')->whereIn('new_hire_id', $hireIds)->delete();

    $tplIds = DB::table('onboarding_checklist_templates')->where('title', 'like', 'TEST-%')->pluck('template_id')->toArray();
    $deleted['checklist_templates'] = DB::table('onboarding_checklist_templates')->whereIn('template_id', $tplIds)->delete();

    $deleted['checklist_requests'] = DB::table('checklist_requests')->where('items_json', 'like', '%TEST-%')->delete();
    $deleted['announcements'] = DB::table('announcements')->where('title', 'like', 'TEST-%')->delete();
    $deleted['screening_reference_data'] = DB::table('screening_reference_data')->where('canonical_value', 'like', 'TEST-%')->delete();
    $deleted['test_system_users'] = DB::table('system_users')->where('email', 'like', 'test.%@example.com')->delete();

    record('cleanup', 'Leftover TEST- rows swept', true, jdump($deleted));
}

/* ------------------------------------------------------------------ */
/* Runner                                                               */
/* ------------------------------------------------------------------ */

$valid = ['auth', 'lists', 'recruitment', 'applicant', 'onboarding', 'settings', 'destructive', 'cleanup', 'all'];
if (! in_array($SECTION, $valid, true)) {
    out("Unknown --section={$SECTION}. Use one of: " . implode('|', $valid));
    exit(2);
}
if ($SECTION === 'destructive' && ! $DESTRUCTIVE) {
    out('--section=destructive requires the --destructive flag (it resets every user password).');
    exit(2);
}

out('HRMS database-integration test');
out('  API base : ' . $BASE);
out('  Section  : ' . $SECTION . ' | account: ' . $EMAIL . ' | TEST tag: ' . $TAG);
if ($DESTRUCTIVE) {
    out('  WARNING  : --destructive is ON (restore snapshot + reset all passwords at the end).');
}
out(str_repeat('-', 104));

$health = api('GET', '/landing/company', null, null, true);
if ($health['status'] === 0) {
    out('FATAL: cannot reach ' . $BASE . ' — ' . ($health['error'] ?? 'connection failed'));
    out('Start the backend first:  cd backend-laravel && php artisan serve');
    exit(1);
}

if (in_array($SECTION, ['auth', 'all'], true)) {
    section_auth();
}
if (in_array($SECTION, ['lists', 'all'], true)) {
    section_lists();
}
if (in_array($SECTION, ['recruitment', 'all'], true)) {
    section_recruitment();
    if (! empty($CTX['job_post_id'])) {
        section_recruitment_part2((int) $CTX['job_post_id'], (int) firstId('departments', 'department_id'), (int) firstId('positions', 'position_id'));
    }
}
if (in_array($SECTION, ['applicant', 'all'], true)) {
    section_applicant();
}
if (in_array($SECTION, ['onboarding', 'all'], true)) {
    section_onboarding();
}
if (in_array($SECTION, ['settings', 'destructive', 'all'], true)) {
    section_settings();
}
if (in_array($SECTION, ['cleanup', 'all'], true)) {
    section_cleanup_test_rows();
}

$passed = count(array_filter($RESULTS, fn ($r) => $r['pass']));
$failed = count($RESULTS) - $passed;

out(str_repeat('-', 104));
out(sprintf('SUMMARY — %d passed / %d failed / %d checks', $passed, $failed, count($RESULTS)));

if ($failed > 0) {
    out('FAILURES:');
    foreach ($RESULTS as $r) {
        if (! $r['pass']) {
            out(sprintf('  x [%s] %s — %s', $r['section'], $r['name'], $r['evidence']));
        }
    }
}

exit($failed > 0 ? 1 : 0);









<?php

/* Scratch DB dumper for verifying job post persistence. */

$pdo = new PDO('mysql:host=127.0.0.1;dbname=hotel_hr;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

echo "=== job_posts (newest 8) ===\n";
$sql = 'SELECT jp.job_post_id, jp.slug, jp.title, jp.status, jp.active, jp.vacancies,
               jp.department_id, jp.position_id, jp.picture, jp.posted_date, jp.created_at
        FROM job_posts jp ORDER BY jp.job_post_id DESC LIMIT 8';
foreach ($pdo->query($sql) as $r) {
    echo "JP {$r['job_post_id']} | {$r['title']} | {$r['status']} | active={$r['active']} | "
        ."vac={$r['vacancies']} | dept={$r['department_id']} pos={$r['position_id']} | "
        .'picture='.($r['picture'] ?? 'NULL')." | {$r['created_at']}\n";
}

echo "\n=== orphan job_post_platforms rows ===\n";
echo (int) $pdo->query('SELECT COUNT(*) FROM job_post_platforms p LEFT JOIN job_posts j ON j.job_post_id = p.job_post_id WHERE j.job_post_id IS NULL')->fetchColumn()."\n";

echo "\n=== personal_access_tokens (newest 5) ===\n";
foreach ($pdo->query('SELECT id, tokenable_type, tokenable_id, name, abilities, expires_at, last_used_at, created_at FROM personal_access_tokens ORDER BY id DESC LIMIT 5') as $r) {
    echo json_encode($r)."\n";
}

$id = (int) ($argv[1] ?? 0);
if ($id > 0) {
    echo "\n=== job_post {$id} platforms ===\n";
    $st = $pdo->prepare('SELECT * FROM job_post_platforms WHERE job_post_id = ?');
    $st->execute([$id]);
    foreach ($st->fetchAll() as $r) {
        echo 'platform '.json_encode($r)."\n";
    }
    echo "\n=== total job_posts ===\n";
    echo $pdo->query('SELECT COUNT(*) FROM job_posts')->fetchColumn()."\n";
}

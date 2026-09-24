<?php

/* Scratch cleanup after the verification runs.
   Usage: php tmp_jobpurge.php 24 25 ...   (job post ids)
          php tmp_jobpurge.php --tokens    (rm-verify-* API tokens) */

$pdo = new PDO('mysql:host=127.0.0.1;dbname=hotel_hr;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

if (in_array('--tokens', array_slice($argv, 1), true)) {
    $removed = $pdo->exec("DELETE FROM personal_access_tokens WHERE name LIKE 'rm-verify-%'");
    echo 'rm-verify tokens removed = '.$removed.PHP_EOL;
    exit;
}

foreach (array_slice($argv, 1) as $rawId) {
    $id = (int) $rawId;
    if ($id <= 0) {
        continue;
    }
    $row = $pdo->query("SELECT job_post_id, title, position_id FROM job_posts WHERE job_post_id = $id")->fetch(PDO::FETCH_ASSOC);
    $st = $pdo->prepare('DELETE FROM job_posts WHERE job_post_id = ?');
    $st->execute([$id]);
    $platforms = (int) $pdo->query("SELECT COUNT(*) FROM job_post_platforms WHERE job_post_id = $id")->fetchColumn();
    echo 'JP '.$id.' ('.($row['title'] ?? 'missing').') deleted='.$st->rowCount()
        .' platforms_left='.$platforms.PHP_EOL;
}

echo 'job_posts total = '.$pdo->query('SELECT COUNT(*) FROM job_posts')->fetchColumn().PHP_EOL;

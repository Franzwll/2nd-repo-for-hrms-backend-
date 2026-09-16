<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECKING MYSQL DATABASE: hotel_hr (phpMyAdmin) ===\n\n";

$tables = DB::select('SHOW TABLES');
$dbName = DB::getDatabaseName();
$prop = 'Tables_in_' . $dbName;

echo "Database Name: " . $dbName . "\n";
echo "Total Tables: " . count($tables) . "\n\n";

echo "--- All Tables & Row Counts in hotel_hr ---\n";
foreach ($tables as $t) {
    $tableName = $t->$prop;
    $count = DB::table($tableName)->count();
    $marker = in_array($tableName, ['social_recognitions', 'recognition_reactions']) ? " [NEW TABLE]" : "";
    echo sprintf("%-35s : %d rows%s\n", $tableName, $count, $marker);
}

echo "\n--- Schema: social_recognitions ---\n";
$columns = DB::select("DESCRIBE social_recognitions");
foreach ($columns as $c) {
    echo sprintf("  - %-25s %-20s Null:%-5s Key:%-5s Default:%s\n", $c->Field, $c->Type, $c->Null, $c->Key, $c->Default ?? 'NULL');
}

echo "\n--- Content in social_recognitions ---\n";
foreach (\Modules\EmployeeSelfService\Models\SocialRecognition::all() as $r) {
    echo "ID: {$r->recognition_id} | Sender: {$r->sender_name} | Recipient: {$r->recipient_name} | Pillar: {$r->core_value} | Claps: {$r->clap_count} | Message: \"{$r->message}\"\n";
}

echo "\n--- Schema: recognition_reactions ---\n";
$reactionCols = DB::select("DESCRIBE recognition_reactions");
foreach ($reactionCols as $c) {
    echo sprintf("  - %-25s %-20s Null:%-5s Key:%-5s Default:%s\n", $c->Field, $c->Type, $c->Null, $c->Key, $c->Default ?? 'NULL');
}

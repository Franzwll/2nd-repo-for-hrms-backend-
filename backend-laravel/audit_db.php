<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== DATABASE TABLES & ROW COUNTS ===\n";
$tables = DB::select('SHOW TABLES');
$dbName = DB::getDatabaseName();
$prop = 'Tables_in_' . $dbName;

$report = [];
foreach ($tables as $t) {
    $tableName = $t->$prop;
    $count = DB::table($tableName)->count();
    $report[$tableName] = $count;
    echo sprintf("%-35s : %d rows\n", $tableName, $count);
}

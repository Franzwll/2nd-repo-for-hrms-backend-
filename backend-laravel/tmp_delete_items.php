<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

DB::table('employee_onboarding_items')->where('new_hire_id', 17)->delete();
echo 'deleted rows for hire 17', PHP_EOL;
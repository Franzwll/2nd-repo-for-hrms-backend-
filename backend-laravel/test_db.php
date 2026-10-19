<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo 'DB Connection: ' . \Illuminate\Support\Facades\DB::connection()->getPdo()->getAttribute(\PDO::ATTR_CONNECTION_STATUS) . PHP_EOL;
    echo 'Applicants count: ' . \Modules\ApplicantManagement\Models\Applicant::count() . PHP_EOL;
} catch (\Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
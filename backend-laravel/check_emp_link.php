<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== System Users ===\n";
foreach (\App\Models\SystemUser::all() as $u) {
    echo "ID: {$u->system_user_id} | Username: {$u->username} | Email: {$u->email} | EmployeeID: {$u->employee_id} | Role: {$u->role_id}\n";
}

echo "\n=== Employees Table ===\n";
foreach (\App\Models\Employee::all() as $e) {
    echo "EmpID: {$e->employee_id} | Code: {$e->employee_code} | Name: {$e->first_name} {$e->last_name} | Email: {$e->email}\n";
}

echo "\n=== New Hires Table ===\n";
foreach (\Modules\NewHireOnboarding\Models\NewHire::all() as $nh) {
    echo "NH ID: {$nh->new_hire_id} | Code: {$nh->new_hire_code} | Name: {$nh->name} | Email: {$nh->email} | EmpID: {$nh->employee_id}\n";
}

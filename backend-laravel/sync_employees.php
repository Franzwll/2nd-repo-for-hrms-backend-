<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Syncing & Linking Employee Records ===\n";

$users = \App\Models\SystemUser::where('role_id', 3)->get();
foreach ($users as $user) {
    if (! $user->employee_id) {
        $emp = \App\Models\Employee::where('email', $user->email)->orWhere('personal_email', $user->email)->first();
        if (! $emp) {
            $nh = \Modules\NewHireOnboarding\Models\NewHire::where('email', $user->email)->first();
            $names = explode(' ', trim($user->full_name ?? $user->username));
            $firstName = $names[0] ?? 'Employee';
            $middleName = count($names) > 2 ? $names[1] : null;
            $lastName = count($names) > 1 ? end($names) : 'Staff';
            $nextCodeNumber = (\App\Models\Employee::max('employee_id') ?? 0) + 1;
            $code = 'EMP-' . str_pad((string) $nextCodeNumber, 4, '0', STR_PAD_LEFT);

            $emp = \App\Models\Employee::create([
                'employee_code'   => $code,
                'first_name'      => $firstName,
                'middle_name'     => $middleName,
                'last_name'       => $lastName,
                'email'           => $user->email,
                'department_id'   => $nh?->department_id ?? 1,
                'position_id'     => $nh?->position_id ?? 1,
                'employment_type' => 'Probationary',
                'date_hired'      => now(),
                'status'          => 'Active',
                'onboarding_complete' => true,
            ]);
            echo "Created Employee #{$emp->employee_id} ({$code}) for {$user->username}\n";
        }
        $user->employee_id = $emp->employee_id;
        $user->save();
        echo "Linked user {$user->username} -> employee_id: {$emp->employee_id}\n";
    }
}

// Check new_hires without employee_id
$newHires = \Modules\NewHireOnboarding\Models\NewHire::whereNull('employee_id')->get();
foreach ($newHires as $nh) {
    $emp = \App\Models\Employee::where('email', $nh->email)->first();
    if ($emp) {
        $nh->employee_id = $emp->employee_id;
        $nh->save();
        echo "Linked NewHire {$nh->name} -> employee_id: {$emp->employee_id}\n";
    }
}

echo "COMPLETED SYNC.\n";

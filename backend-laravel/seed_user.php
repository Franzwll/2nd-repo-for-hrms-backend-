<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$u = \App\Models\SystemUser::firstOrNew(['email' => 'aldrex1@gmail.com']);
$u->username = 'aldrex1';
$u->full_name = 'Aldrex M. Cordon';
$u->department_name = 'Culinary & F&B';
$u->password_hash = \Illuminate\Support\Facades\Hash::make('BLUESTITCH@2004');
$u->role_id = 3;
$u->status = 'Active';
$u->save();

$pos = \App\Models\Position::first();
$dept = \App\Models\Department::first();

$nh = \Modules\NewHireOnboarding\Models\NewHire::firstOrNew(['email' => 'aldrex1@gmail.com']);
$nh->name = 'Aldrex M. Cordon';
$nh->phone = '09171234567';
$nh->department_id = $dept ? $dept->department_id : 1;
$nh->position_id = $pos ? $pos->position_id : 1;
$nh->department = $dept ? $dept->name : 'Culinary';
$nh->position = $pos ? $pos->title : 'Kitchen Staff';
$nh->stage = 'Pre-onboarding';
$nh->start_date = date('Y-m-d');
$nh->target_completion_date = date('Y-m-d', strtotime('+30 days'));
$nh->new_hire_code = 'EMP-NH-0013';
$nh->status = 'In Progress';
$nh->save();

echo "SUCCESS: User aldrex1 created with ID: {$u->system_user_id} and NewHire ID: {$nh->new_hire_id}\n";

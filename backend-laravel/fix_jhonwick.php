<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\SystemUser::where('email', 'jhonwick@gmal.com')->orWhere('username', 'jhonwick')->first();
if ($user) {
    $user->email = 'jhonwick@gmail.com';
    $user->password_hash = \Illuminate\Support\Facades\Hash::make('Oxford@2026');
    $user->status = 'Active';
    $user->save();
    echo "SystemUser updated: email is now {$user->email}\n";
}

$nh = \Modules\NewHireOnboarding\Models\NewHire::where('email', 'jhonwick@gmal.com')->orWhere('name', 'like', '%Jhon Wick%')->first();
if ($nh) {
    $nh->email = 'jhonwick@gmail.com';
    $nh->save();
    echo "NewHire updated: email is now {$nh->email}\n";
}

echo "DONE.\n";

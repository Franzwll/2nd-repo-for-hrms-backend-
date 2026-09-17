<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\SystemUser::where('email', 'jhonwick@gmail.com')->orWhere('username', 'jhonwick')->first();
if ($user) {
    echo "Found user: ID={$user->system_user_id}, username={$user->username}, email={$user->email}, status={$user->status}\n";
    echo "Checking 'Oxford@2026': " . (\Illuminate\Support\Facades\Hash::check('Oxford@2026', $user->password_hash) ? 'MATCH' : 'NO MATCH') . "\n";
    
    // Check what SystemSetting default_password has
    $def = \Modules\Settings\Models\SystemSetting::getValue('default_password', []);
    echo "default_password setting: " . json_encode($def) . "\n";
} else {
    echo "User not found in system_users.\n";
}

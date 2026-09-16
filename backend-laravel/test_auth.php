<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\SystemUser::where('email', 'aldrex1@gmail.com')->first();
if ($user && \Illuminate\Support\Facades\Hash::check('BLUESTITCH@2004', $user->password_hash)) {
    echo "AUTH SUCCESS: aldrex1@gmail.com authenticated correctly with role ID {$user->role_id} ({$user->status})\n";
} else {
    echo "AUTH FAILED\n";
}

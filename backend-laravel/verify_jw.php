<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\SystemUser::where('email', 'jhonwick@gmail.com')->orWhere('username', 'jhonwick')->first();
if ($user && \Illuminate\Support\Facades\Hash::check('Oxford@2026', $user->password_hash)) {
    echo "SUCCESS: jhonwick is ready to log in with email {$user->email} or username {$user->username} and password Oxford@2026\n";
} else {
    echo "FAILED: User password does not match.\n";
}

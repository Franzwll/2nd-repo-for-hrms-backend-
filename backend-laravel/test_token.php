<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\SystemUser::find(1);
$token = $user->createToken('test')->plainTextToken;
echo 'Token: ' . $token . PHP_EOL;
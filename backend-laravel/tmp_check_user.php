<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$u = DB::table('system_users')->where('email', 'smoke.test@oxfordsuites.com.ph')->first();
echo $u ? ('account created: id=' . $u->system_user_id . ' username=' . $u->username . ' role_id=' . $u->role_id . ' status=' . $u->status)
       : 'NO ACCOUNT';
echo PHP_EOL;
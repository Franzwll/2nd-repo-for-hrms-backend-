<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\SystemUser::where('email', 'aldrex1@gmail.com')->first();
if ($user) {
    $match = Illuminate\Support\Facades\Hash::check('pogiako123', $user->password_hash);
    echo "Password 'pogiako123' match: " . ($match ? "YES / MATCH" : "NO") . "\n";
}

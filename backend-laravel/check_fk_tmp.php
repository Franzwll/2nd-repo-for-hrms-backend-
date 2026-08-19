<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$fk = Illuminate\Support\Facades\DB::selectOne(
    "SELECT DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS
     WHERE CONSTRAINT_NAME = 'fk_employee_onboarding_items_template_item_id'
       AND CONSTRAINT_SCHEMA = DATABASE()"
);
echo $fk ? ('DELETE_RULE=' . $fk->DELETE_RULE) : 'FK NOT FOUND';
echo PHP_EOL;
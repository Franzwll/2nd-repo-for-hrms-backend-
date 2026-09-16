<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\SystemUser::where('email', 'aldrex1@gmail.com')->first();
$req = \Illuminate\Http\Request::create('/api/v1/ess/my-overview', 'GET');
$req->setUserResolver(fn() => $user);

$controller = app(\Modules\EmployeeSelfService\Http\Controllers\EssPortalController::class);
$response = $controller->getOverview($req);

echo "Status Code: " . $response->getStatusCode() . "\n";
echo "Response Payload: " . json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT) . "\n";

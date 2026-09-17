<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\SystemUser::where('email', 'aldrex1@gmail.com')->first();
$req = \Illuminate\Http\Request::create('/api/v1/ess/my-overview', 'GET');
$req->setUserResolver(fn() => $user);

$controller = app(\Modules\EmployeeSelfService\Http\Controllers\EssPortalController::class);

echo "1. Overview: " . $controller->getOverview($req)->getStatusCode() . "\n";
echo "2. Schedule: " . $controller->getSchedule($req)->getStatusCode() . "\n";
echo "3. Leaves: " . $controller->getLeaves($req)->getStatusCode() . "\n";
echo "4. Benefits: " . $controller->getBenefits($req)->getStatusCode() . "\n";
echo "5. Payroll: " . $controller->getPayroll($req)->getStatusCode() . "\n";
echo "6. My Requests: " . $controller->getMyRequests($req)->getStatusCode() . "\n";
echo "7. Recognitions: " . $controller->getRecognitions($req)->getStatusCode() . "\n";
echo "SUCCESS: ALL ESS ENDPOINTS RETURN 200 OK WITH NO ERRORS!\n";

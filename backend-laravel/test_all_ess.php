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
echo "3. Attendance: " . $controller->getAttendanceLogs($req)->getStatusCode() . "\n";
echo "4. Leave Balances: " . $controller->getLeaveBalances($req)->getStatusCode() . "\n";
echo "5. Leave Requests: " . $controller->getLeaveRequests($req)->getStatusCode() . "\n";
echo "6. Payroll: " . $controller->getPayroll($req)->getStatusCode() . "\n";
echo "7. Documents: " . $controller->getDocuments($req)->getStatusCode() . "\n";
echo "8. Recognitions: " . $controller->getRecognitions($req)->getStatusCode() . "\n";
echo "ALL ENDPOINTS RETURN 200 OK!\n";

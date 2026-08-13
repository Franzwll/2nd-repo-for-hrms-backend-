<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeSelfService\Http\Controllers\EmployeeSelfServiceController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('employeeselfservices', EmployeeSelfServiceController::class)->names('employeeselfservice');
});

<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeRecords\Http\Controllers\EmployeeRecordsController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('employeerecords', EmployeeRecordsController::class)->names('employeerecords');
});

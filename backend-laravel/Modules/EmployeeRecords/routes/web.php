<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeRecords\Http\Controllers\EmployeeRecordsController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('employeerecords', EmployeeRecordsController::class)->names('employeerecords');
});

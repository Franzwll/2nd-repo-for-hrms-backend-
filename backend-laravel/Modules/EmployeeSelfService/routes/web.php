<?php

use Illuminate\Support\Facades\Route;
use Modules\EmployeeSelfService\Http\Controllers\EmployeeSelfServiceController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('employeeselfservices', EmployeeSelfServiceController::class)->names('employeeselfservice');
});

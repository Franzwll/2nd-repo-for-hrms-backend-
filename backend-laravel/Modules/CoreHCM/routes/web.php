<?php

use Illuminate\Support\Facades\Route;
use Modules\CoreHCM\Http\Controllers\CoreHCMController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('corehcms', CoreHCMController::class)->names('corehcm');
});

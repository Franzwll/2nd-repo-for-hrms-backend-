<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['module' => 'Auth']);
});

Route::get('login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');
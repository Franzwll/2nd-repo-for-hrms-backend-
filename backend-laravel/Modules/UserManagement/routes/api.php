<?php

use Illuminate\Support\Facades\Route;
use Modules\UserManagement\Http\Controllers\RoleController;
use Modules\UserManagement\Http\Controllers\UserController;

Route::middleware(['auth:sanctum', 'permission:User Management'])->prefix('v1')->group(function () {
    Route::get('users', [UserController::class, 'index'])->name('usermanagement.users.index');
    Route::post('users', [UserController::class, 'store'])->name('usermanagement.users.store');
    Route::get('users/{user}', [UserController::class, 'show'])->name('usermanagement.users.show');
    Route::put('users/{user}', [UserController::class, 'update'])->name('usermanagement.users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('usermanagement.users.destroy');
    Route::get('users/{user}/login-activity', [UserController::class, 'loginActivity'])->name('usermanagement.users.login-activity');

    Route::get('roles', [RoleController::class, 'index'])->name('usermanagement.roles.index');
    Route::post('roles', [RoleController::class, 'store'])->name('usermanagement.roles.store');
    Route::get('roles/{role}', [RoleController::class, 'show'])->name('usermanagement.roles.show');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('usermanagement.roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('usermanagement.roles.destroy');
    Route::get('roles/{role}/permissions', [RoleController::class, 'permissions'])->name('usermanagement.roles.permissions');
    Route::put('roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->name('usermanagement.roles.permissions.update');
});
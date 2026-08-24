<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/invitations/{token}', [InvitationController::class, 'show']);
    Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept'])
        ->middleware('throttle:10,1');
});

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::apiResource('todos', TodoController::class);
    Route::post('/assistant', [AssistantController::class, 'prompt']);
    Route::delete('/assistant/conversations', [AssistantController::class, 'reset']);
    Route::post('/assistant/{conversation}/approve', [AssistantController::class, 'approve'])
        ->whereUuid('conversation');

    Route::prefix('admin')->middleware('admin')->group(function (): void {
        Route::get('/metrics', [AdminController::class, 'metrics']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/invitations', [InvitationController::class, 'store'])
            ->middleware('throttle:10,1');
        Route::post('/invitations/{invitation}/resend', [InvitationController::class, 'resend'])
            ->whereNumber('invitation')
            ->middleware('throttle:10,1');
        Route::delete('/invitations/{invitation}', [InvitationController::class, 'destroy'])
            ->whereNumber('invitation');
        Route::patch('/users/{user}/status', [AdminController::class, 'updateStatus'])
            ->whereNumber('user');
        Route::delete('/users/{user}', [AdminController::class, 'destroy'])
            ->whereNumber('user');
    });
});

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Http;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/broadcasting/auth', function (Request $request) {
    return Broadcast::auth($request);
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Authenticated routes
Route::middleware(['auth:sanctum', \App\Http\Middleware\UpdateLastSeen::class])->group(function () {
    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/status', [UserController::class, 'status']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/avatar', [UserController::class, 'updateAvatar']);
    
    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::put('/conversations/{conversation}', [ConversationController::class, 'update']);
    Route::delete('/conversations/{conversation}', [ConversationController::class, 'destroy']);
    
    // Messages
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::put('/messages/{message}', [MessageController::class, 'update']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    Route::post('/messages/{message}/seen', [MessageController::class, 'markAsSeen']);
    Route::post('/typing', [MessageController::class, 'typing']);
    Route::get('/messages/{message}/download', [MessageController::class, 'downloadFile'])
        ->name('messages.download');
});
    Route::get('/proxy-image/{id}', function ($id) {
    $url = "https://drive.google.com/uc?export=view&id=$id";
    $content = @file_get_contents($url);
    if (!$content) abort(404);
    return response($content)->header('Content-Type', 'image/jpeg');
});
<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;

// Custom broadcasting auth endpoint
Route::post('/broadcasting/auth', function (Request $request) {
    try {
        // Check if user is authenticated via Sanctum
        if ($request->user()) {
            return Broadcast::auth($request);
        }
        
        return response()->json(['message' => 'Unauthenticated'], 403);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Authentication failed'], 403);
    }
})->middleware(['auth:sanctum']);

// Channel definitions
Broadcast::channel('conversation.{id}', function ($user, $id) {
    return $user->conversations()->where('conversation_id', $id)->exists();
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.status', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});

// Add presence channel for typing indicators
Broadcast::channel('typing.{conversationId}', function ($user, $conversationId) {
    if ($user->conversations()->where('conversation_id', $conversationId)->exists()) {
        return ['id' => $user->id, 'name' => $user->name];
    }
    return false;
});
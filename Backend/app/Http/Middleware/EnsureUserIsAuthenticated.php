<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsAuthenticated
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::guard('sanctum')->check()) {
            return $next($request);
        }
        
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        return redirect()->guest(route('login'));
    }
}
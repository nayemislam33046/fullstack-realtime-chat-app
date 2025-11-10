<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class UpdateLastSeen
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $user->update(['last_seen_at' => now()]);
            if (!$user->last_seen_at || $user->last_seen_at->diffInMinutes(now()) > 5) {
                $user->update(['last_seen_at' => now()]);
            }
        }
        return $next($request);
    }
}
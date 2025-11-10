<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ConversationController extends Controller
{
    use AuthorizesRequests;
    public function index()
{
    $user = Auth::user();
    $conversations = $user->conversations()
        ->with([
            'participants.user',
            'lastMessage',
            'messages' => function ($query) {
                $query->latest()->take(20)->with(['user', 'statuses']);
            }
        ])
        ->withCount(['unseenMessages' => function($query) use ($user) {
            $query->where('user_id', '!=', $user->id)
                ->whereDoesntHave('statuses', function($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->where('is_seen', true);
                });
        }])
        ->orderByDesc(
            Message::select('created_at')
                ->whereColumn('conversation_id', 'conversations.id')
                ->latest()
                ->take(1)
        )
        ->get();
    return response()->json($conversations);
}

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);
        $user = Auth::user();
        $otherUser = User::find($request->user_id);
        $existingConversation = $user->conversations()
            ->whereHas('participants', function($query) use ($otherUser) {
                $query->where('user_id', $otherUser->id);
            })
            ->where('is_group', false)
            ->first();
        if ($existingConversation) {
            return response()->json($existingConversation);
        }
        $conversation = Conversation::create([
            'is_group' => false,
        ]);
        $conversation->participants()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $otherUser->id],
        ]);
        $conversation->load(['participants.user', 'lastMessage']);
        return response()->json($conversation, 201);
    }

    public function show(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        
        $conversation->load(['participants.user', 'messages.user','messages.statuses']);
        
        return response()->json($conversation);
    }

    public function update(Request $request, Conversation $conversation)
    {
        $this->authorize('update', $conversation);
        
        $request->validate([
            'title' => 'required|string|max:255',
        ]);
        
        $conversation->update($request->only('title'));
        
        return response()->json($conversation);
    }

    public function destroy(Conversation $conversation)
    {
        $this->authorize('delete', $conversation);
        $conversation->delete();
        return response()->json(['message' => 'Conversation deleted']);
    }
}
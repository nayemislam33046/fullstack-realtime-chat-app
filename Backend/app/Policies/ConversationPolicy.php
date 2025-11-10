<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ConversationPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Conversation $conversation)
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Conversation $conversation)
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Conversation $conversation)
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }
}
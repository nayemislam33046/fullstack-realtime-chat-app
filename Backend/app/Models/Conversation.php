<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'is_group',
    ];

    protected $casts = [
        'is_group' => 'boolean',
    ];

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->latest();
    }

    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function unseenMessages()
    {
        return $this->hasMany(Message::class)
            ->whereDoesntHave('statuses', function($query) {
                $query->where('user_id', auth()->id())
                    ->where('is_seen', true);
            });
    }
}
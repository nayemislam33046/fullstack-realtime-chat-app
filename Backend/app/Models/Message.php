<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'conversation_id',
        'body',
        'type',
        'data',
        'unsent_at',
        'unsent_by',
        'is_unsent'
    ];

    protected $casts = [
        'data' => 'array',
        'unsent_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function statuses()
    {
        return $this->hasMany(MessageStatus::class);
    }

    public function getFileUrlAttribute()
    {
        return isset($this->data['file_path']) ? Storage::url($this->data['file_path']) : null;
    }

    public function getThumbnailUrlAttribute()
    {
        return isset($this->data['thumbnail']) ? Storage::url($this->data['thumbnail']) : null;
    }
}
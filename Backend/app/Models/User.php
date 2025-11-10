<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'participants')
            ->withPivot('created_at', 'updated_at');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function messageStatuses()
    {
        return $this->hasMany(MessageStatus::class);
    }

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? Storage::url($this->avatar) : 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&color=7F9CF5&background=EBF4FF';
    }
}
<?php

namespace App\Events;

use App\Models\MessageStatus;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messageStatus;

    public function __construct(MessageStatus $messageStatus)
    {
        $this->messageStatus = $messageStatus;
    }
    public function broadcastOn()
    {
        return new PrivateChannel('conversation.'. $this->messageStatus->message->conversation_id);
    }
    public function broadcastWith()
    {
        return [
            'status' => $this->messageStatus,
            'is_seen'=> $this->messageStatus->is_seen,
            'seen_at'=> $this->messageStatus->seen_at,
            'message_id' => $this->messageStatus->message_id,
            'conversation_id' => $this->messageStatus->message->conversation_id,
        ];
    }
}
import { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import MessageItem from './MessageItem';
import { useAuth } from '../contexts/AuthContext';

const MessageList = () => {
  const { activeConversation, typingUsers } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  const otherTypingUsers = Object.keys(typingUsers || {}).filter(
    (uid) => typingUsers[uid] && parseInt(uid) !== user.id
  );

  return (
    <div className="flex-1 overflow-y-auto pt-4 pb-10 px-4">
      {activeConversation?.messages?.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...(activeConversation?.messages || [])]
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map((message, index, arr) => (
              <MessageItem
                key={`${message.id}-${index}`}
                message={message}
                isLastMessage={index === arr.length - 1}
              />
            ))}

          {/* Typing indicator */}
          {otherTypingUsers.length > 0 && (
            <div className="text-sm italic text-gray-500">
              {otherTypingUsers.length === 1
                ? 'Typing...'
                : `${otherTypingUsers.length} people typing...`}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
export default MessageList;

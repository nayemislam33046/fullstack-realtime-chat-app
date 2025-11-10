import { useEffect, useState } from "react";
import { useChat } from "../contexts/ChatContext";

const TypingIndicator = () => {
  const { activeConversation, pusher } = useChat();
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (pusher && activeConversation) {
      const channel = pusher.subscribe(
        `private-conversation.${activeConversation.id}`
      );

      channel.bind("TypingStatus", (data) => {
        if (data.is_typing) {
          setTypingUsers((prev) => [...prev, data.user_id]);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
        }
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [pusher, activeConversation]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
      {typingUsers.length === 1 ? (
        <span>{typingUsers[0]} is typing...</span>
      ) : (
        <span>Several people are typing...</span>
      )}
    </div>
  );
};

export default TypingIndicator;

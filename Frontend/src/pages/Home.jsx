import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import TypingIndicator from "../components/TypingIndicator";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";

const Home = () => {
  const { user, loading } = useAuth();
  const { activeConversation } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {activeConversation && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {activeConversation?.is_group
              ? activeConversation.title || ""
              : activeConversation.participants?.find(
                  (p) => p.user_id !== user.id
                )?.user?.name || ""}
          </h2>
        </div>
      )}
      <MessageList />
      <TypingIndicator />
      {activeConversation && <MessageInput />}
    </div>
  );
};

export default Home;

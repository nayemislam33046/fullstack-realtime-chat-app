import { useState, useEffect } from "react";
import { getUsers } from "../api/users";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { createConversation } from "../api/conversation";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { conversations, addConversation, setActiveConversation } = useChat();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUsers();
        setUsers(response.data.filter((u) => u.id !== currentUser.id));
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser.id]);

  const handleStartConversation = async (userId) => {
    try {
      const response = await createConversation(userId);
      const conversation = response.data;

      addConversation(conversation);
      setActiveConversation(conversation);

      // remove that user from list immediately
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Filter users who already have a conversation
  const availableUsers = users.filter((user) => {
    return !conversations.some((conv) =>
      conv.participants?.some((p) => p.user_id === user.id)
    );
  });

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Start a Conversation
      </h3>

      {availableUsers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No users available</p>
      ) : (
        <div className="space-y-2">
          {availableUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-1 gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
              onClick={() => handleStartConversation(user.id)}
            >
              <img
                src={
                  user.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=random`
                }
                alt={user.name}
                className="h-10 w-10 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Chat Now
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersList;

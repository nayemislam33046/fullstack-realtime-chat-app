import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import UsersList from "./UsersList";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const {
    conversations,
    usersStatus,
    setActiveConversation,
    isOpen,
    setIsOpen,
  } = useChat();
  const [showUsersList, setShowUsersList] = useState(false);

  const getUserStatus = (userId) => {
    const userStatus = usersStatus.find((u) => u.id === userId);
    return userStatus?.is_online;
  };

  return (
    <div
      className={`
    ${isOpen ? "md:w-64 w-44" : "w-16"}
    transition-all duration-300 bg-white dark:bg-gray-900
    border-r border-gray-200 dark:border-gray-700 flex flex-col
    md:static md:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    fixed md:relative z-40 top-0 left-0 h-full
  `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {/* Sidebar toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Toggle menu"
        >
          <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Title and user list toggle icons */}
        {isOpen && (
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Chats
            </h2>
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              title={showUsersList ? "Show conversations" : "Show users list"}
            >
              {showUsersList ? (
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <UsersIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {showUsersList ? (
          <UsersList />
        ) : (
          <>
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                {isOpen && (
                  <>
                    <p className="text-gray-500 dark:text-gray-400">
                      No conversations yet
                    </p>
                    <button
                      onClick={() => setShowUsersList(true)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Start a conversation
                    </button>
                  </>
                )}
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = conversation.participants?.find(
                  (p) => p.user_id !== user.id
                )?.user;
                return (
                  <NavLink
                    key={conversation.id}
                    to={`/conversations/${conversation.id}`}
                    className={({ isActive }) =>
                      `flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`
                    }
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          otherUser?.avatar
                            ? `https://chat-app-backend-xz9q.onrender.com/api/proxy-image/${otherUser?.avatar}`
                            : `https://ui-avatars.com/api/?name=${otherUser?.name}&background=random`
                        }
                        alt={otherUser?.name}
                        className="md:h-10 md:w-10 sm:w-7 sm:h-7 w-5 h-5 mx-auto rounded-full"
                      />
                      {getUserStatus(otherUser?.id) && (
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
                      )}
                    </div>

                    {isOpen && (
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.is_group
                            ? conversation.title
                            : otherUser?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.last_message?.body || "No messages yet"}
                        </p>
                      </div>
                    )}

                    {conversation.unseen_messages_count > 0 && isOpen && (
                      <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.25rem] text-center">
                        {conversation.unseen_messages_count}
                      </span>
                    )}
                  </NavLink>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

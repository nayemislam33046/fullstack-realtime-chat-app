import { createContext, useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";
import { getConversations } from "../api/conversation";
import { getUserStatus } from "../api/users";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [usersStatus, setUsersStatus] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [pusher, setPusher] = useState(null);
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [conversationsRes, statusRes] = await Promise.all([
        getConversations(),
        getUserStatus(),
      ]);
      setConversations(conversationsRes.data);
      setUsersStatus(statusRes.data);
    };

    loadData();

    const pusherInstance = new Pusher("7f267ddb01558cff59bf", {
      cluster: "ap2",
      forceTLS: true,
      authEndpoint:
        "https://chat-app-backend-xz9q.onrender.com/api/broadcasting/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      },
    });
    setPusher(pusherInstance);

    return () => {
      pusherInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!pusher || !user) return;

    const statusChannel = pusher.subscribe("user.status");
    statusChannel.bind("App\\Events\\UserStatusUpdated", (data) => {
      setUsersStatus((prev) =>
        prev.map((u) =>
          u.id === data.user_id ? { ...u, is_online: data.is_online } : u
        )
      );
    });

    return () => {
      statusChannel.unbind_all();
      statusChannel.unsubscribe();
    };
  }, [pusher, user]);

  useEffect(() => {
    if (!pusher || !activeConversation) return;

    const convChannel = pusher.subscribe(
      `private-conversation.${activeConversation.id}`
    );

    convChannel.bind("App\\Events\\MessageSent", (payload) => {
      const message = payload.message || payload.data?.message;
      if (!message) return;

      setConversations((prev) => {
        const conversation = prev.find((c) => c.id === message.conversation_id);
        if (
          conversation &&
          (conversation.messages || []).some((m) => m.id === message.id)
        ) {
          return prev.map((c) =>
            c.id === message.conversation_id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === message.id ? message : m
                  ),
                }
              : c
          );
        } else {
          return prev.map((c) =>
            c.id === message.conversation_id
              ? {
                  ...c,
                  messages: [...(c.messages || []), message],
                  last_message: message,
                }
              : c
          );
        }
      });

      setActiveConversation((prev) => {
        if (prev && prev.id === message.conversation_id) {
          const messages = prev.messages || [];

          if (messages.some((m) => m.id === message.id)) {
            return {
              ...prev,
              messages: messages.map((m) =>
                m.id === message.id ? message : m
              ),
            };
          } else {
            return {
              ...prev,
              messages: [...messages, message],
              last_message: message,
            };
          }
        }
        return prev;
      });
    });

    convChannel.bind("App\\Events\\MessageStatusUpdated", (data) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== data.conversation_id) return conv;

          return {
            ...conv,
            messages: conv.messages.map((msg) => {
              if (msg.id !== data.message_id) return msg;

              const oldStatuses = msg.statuses || [];
              const idx = oldStatuses.findIndex((s) => s.id === data.status.id);

              const newStatuses =
                idx !== -1
                  ? [
                      ...oldStatuses.slice(0, idx),
                      { ...oldStatuses[idx], ...data.status },
                      ...oldStatuses.slice(idx + 1),
                    ]
                  : [...oldStatuses, data.status];

              return { ...msg, statuses: newStatuses };
            }),
          };
        })
      );
    });

    convChannel.bind("App\\Events\\MessageDeleted", (payload) => {
      const message = payload.message || payload.data?.message;
      if (!message) return;
      removeMessage(message);
    });

    const typingChannel = pusher.subscribe(
      `presence-typing.${activeConversation.id}`
    );
    typingChannel.bind("App\\Events\\TypingStatus", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.user_id]: data.is_typing,
      }));

      if (data.is_typing) {
        setTimeout(() => {
          setTypingUsers((prev) => ({
            ...prev,
            [data.user_id]: false,
          }));
        }, 5000);
      }
    });

    return () => {
      convChannel.unbind_all();
      convChannel.unsubscribe();
      typingChannel.unbind_all();
      typingChannel.unsubscribe();
    };
  }, [pusher, activeConversation]);

  // --- Conversation helpers ---
  const updateConversation = (conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? conversation : c))
    );
  };

  const addConversation = (conversation) => {
    setConversations((prev) => [...prev, conversation]);
  };

  const removeConversation = (conversationId) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }
  };

  const addMessage = (message) => {
    if (!message || !message.conversation_id) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === message.conversation_id
          ? {
              ...c,
              messages: [...(c.messages || []), message],
              last_message: message,
            }
          : c
      )
    );

    setActiveConversation((prev) =>
      prev && prev.id === message.conversation_id
        ? {
            ...prev,
            messages: [...(prev.messages || []), message],
            last_message: message,
          }
        : prev
    );
  };

  const updateMessageInContext = (updatedMessage) => {
    const update = (prev) =>
      prev.map((convo) =>
        convo.id === updatedMessage.conversation_id
          ? {
              ...convo,
              messages: convo.messages.map((m) =>
                m.id === updatedMessage.id ? updatedMessage : m
              ),
            }
          : convo
      );
    setConversations(update);
    setActiveConversation((prev) =>
      prev && prev.id === updatedMessage.conversation_id
        ? {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === updatedMessage.id ? updatedMessage : m
            ),
          }
        : prev
    );
  };

  const removeMessage = (message) => {
    const update = (prev) =>
      prev.map((c) =>
        c.id === message.conversation_id
          ? {
              ...c,
              messages: c.messages.filter((m) => m.id !== message.id),
              last_message:
                c.last_message?.id === message.id ? null : c.last_message,
            }
          : c
      );
    setConversations(update);
    setActiveConversation((prev) =>
      prev && prev.id === message.conversation_id
        ? {
            ...prev,
            messages: prev.messages.filter((m) => m.id !== message.id),
            last_message:
              prev.last_message?.id === message.id ? null : prev.last_message,
          }
        : prev
    );
  };

  const [isOpen, setIsOpen] = useState(true);

  return (
    <ChatContext.Provider
      value={{
        setIsOpen,
        isOpen,
        conversations,
        usersStatus,
        setConversations,
        activeConversation,
        setActiveConversation,
        updateConversation,
        addConversation,
        removeConversation,
        addMessage,
        updateMessage: updateMessageInContext,
        typingUsers,
        removeMessage,
        pusher,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  return useContext(ChatContext);
}

import axios from "axios";

const API_URL = "https://chat-app-backend-xz9q.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMessages = async (conversationId) => {
  return api.get(`${API_URL}/conversations/${conversationId}/messages`);
};

export const sendMessage = async (conversationId, message) => {
  if (message.file) {
    const formData = new FormData();
    formData.append('file', message.file);
    if (message.body) {
      formData.append('body', message.body);
    }
    return api.post(`${API_URL}/conversations/${conversationId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return api.post(`${API_URL}/conversations/${conversationId}/messages`, message);
};

export const updateMessage = async (messageId, data) => {
  return api.put(`${API_URL}/messages/${messageId}`, data);
};


export const deleteMessage = async (messageId) => {
  return api.delete(`${API_URL}/messages/${messageId}`);
};

export const markAsSeen = async (messageId) => {
  return api.post(`${API_URL}/messages/${messageId}/seen`);
};

export const sendTypingStatus = async (conversationId, isTyping) => {
  return api.post(`${API_URL}/typing`, {
    conversation_id: conversationId,
    is_typing: isTyping,
  });
};
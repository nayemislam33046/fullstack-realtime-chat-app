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

export const getConversations = () => api.get("/conversations");
export const createConversation = (userId) =>
  api.post("/conversations", { user_id: userId });
export const getConversation = (conversationId) =>
  api.get(`/conversations/${conversationId}`);
export const updateConversation = (conversationId, title) =>
  api.put(`/conversations/${conversationId}`, { title });
export const deleteConversation = (conversationId) =>
  api.delete(`/conversations/${conversationId}`);
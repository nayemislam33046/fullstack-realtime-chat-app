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

export const getUsers = async () => {
  return api.get(`${API_URL}/users`);
};

export const getUserStatus = async () => {
  return api.get(`${API_URL}/users/status`);
};

export const updateProfiles = async (profileData, config) => {
  return api.put(`${API_URL}/users/profile`, profileData, config);
};

export const updateAvatar = async (avatar) => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  return api.post(`${API_URL}/users/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

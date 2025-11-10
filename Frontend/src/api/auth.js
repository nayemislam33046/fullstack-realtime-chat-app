import axios from "axios";

const API_URL = "https://chat-app-backend-xz9q.onrender.com/api";

const getToken = localStorage.getItem("token");

export const login = async (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};

export const register = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

export const logout = async () => {
  return axios.post(
    `${API_URL}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${getToken}`,
      },
    }
  );
};

// Get authenticated user (with Bearer token)
export const getUser = async () => {
  return axios.get(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  });
};

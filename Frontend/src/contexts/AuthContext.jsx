import { createContext, useContext, useEffect, useState } from "react";
import {
  getUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../api/auth";
import { useNavigate } from "react-router-dom";
import { updateProfiles } from "../api/users";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getUser();
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          console.error("Token expired or invalid:", err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogin = async (credentials) => {
    const res = await apiLogin(credentials);
    const userData = res.data?.user;
    const accessToken = res.data?.token || res.data?.access_token;

    setUser(userData);
    setToken(accessToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);

    navigate("/");
  };

  const handleRegister = async (userData) => {
    await apiRegister(userData);
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const updateProfile = async (formData) => {
    try {
      const res = await updateProfiles(formData);
      setUser(res.data?.user);
      return res.data;
    } catch (error) {
      console.error("Profile update failed:", error.response?.data || error);
      throw new Error("Profile update failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        updateProfile,
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export function useAuth() {
  return useContext(AuthContext);
}

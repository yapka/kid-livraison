import React, { createContext, useState, useEffect, useContext } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getAccessToken,
  getRefreshToken,
  apiClient,
} from "../services/auth";
import { jwtDecode } from "jwt-decode"; // You might need to install jwt-decode: npm install jwt-decode
import LoadingSpinner from "../components/LoadingSpinner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("🔄 Token existant décodé:", decoded);
          console.log("👤 Rôle depuis token:", decoded.role);
          // Check if token is expired
          if (decoded.exp * 1000 > Date.now()) {
            setUser({
              id: decoded.user_id,
              username: decoded.username,
              role: decoded.role,
            }); // Store role
            setIsAuthenticated(true);
          } else {
            // Token expired, try to refresh
            try {
              const refreshToken = getRefreshToken();
              if (refreshToken) {
                // The apiClient interceptor should handle refresh automatically,
                // but we might want to manually trigger a check here or ensure it runs.
                // If refresh fails, user will be logged out by interceptor
                setUser(null);
                setIsAuthenticated(false);
              }
            } catch (error) {
              console.error(
                "Failed to refresh token during initialization:",
                error
              );
              apiLogout();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error("Invalid token:", error);
          apiLogout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await apiLogin(username, password);
      const decoded = jwtDecode(data.access);
      console.log("🔑 JWT Token décodé:", decoded);
      console.log("👤 Rôle détecté:", decoded.role);
      console.log("🆔 User ID:", decoded.user_id);
      console.log("📛 Username:", decoded.username);
      setUser({
        id: decoded.user_id,
        username: decoded.username,
        role: decoded.role,
      }); // Store role
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = { user, isAuthenticated, loading, login, logout };

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        message="Vérification de l'authentification..."
      />
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

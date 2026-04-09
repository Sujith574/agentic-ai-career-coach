import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";

const AuthContext = createContext(null);
const AUTH_KEY = "career_os_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authRaw = localStorage.getItem(AUTH_KEY);
    if (authRaw) {
      try {
        const auth = JSON.parse(authRaw);
        setUser(auth.user);
      } catch (err) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const sendOtp = async (email) => {
    try {
      const result = await apiRequest("/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return { success: true, message: result.message };
    } catch (err) {
      return { success: false, message: err.message || "Failed to send code" };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const result = await apiRequest("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (result.access_token) {
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          accessToken: result.access_token,
          user: result.user 
        }));
        setUser(result.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || "Invalid or expired code" };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

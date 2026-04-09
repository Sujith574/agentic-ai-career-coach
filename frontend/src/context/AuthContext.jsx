import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";

const AuthContext = createContext(null);
const AUTH_KEY = "agentic_saas_auth";

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

  const login = async (email, password) => {
    const result = await apiRequest("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (result.ok) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result));
      setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message || "Login failed" };
  };

  const registerStart = async (name, email) => {
    const result = await apiRequest("/api/v1/auth/register/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    return result;
  };

  const registerComplete = async (name, email, password, otp, orgName) => {
    const result = await apiRequest("/api/v1/auth/register/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, otp, org_name: orgName }),
    });

    if (result.ok) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result));
      setUser(result.user);
      return { success: true };
    }
    return { success: false, message: result.message || "Registration verification failed" };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerStart, registerComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

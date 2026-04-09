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

  const login = async (email, password) => {
    // Standard OAuth2 form data
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const result = await apiRequest("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (result.access_token) {
        // We need a separate call to get user info if following strict OAuth2, 
        // but for now let's assume login returns user info or we Fetch it.
        // For simplicity, I'll update the backend to return user info in login.
        // Actually, let's just use the current approach of storing token.
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          accessToken: result.access_token,
          user: result.user 
        }));
        setUser(result.user);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  const register = async (name, email, password, orgSlug, role = "student") => {
    try {
      const result = await apiRequest("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          organization_slug: orgSlug,
          role 
        }),
      });

      if (result.id) {
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

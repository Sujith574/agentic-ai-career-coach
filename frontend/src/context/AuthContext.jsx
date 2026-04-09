import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/apiClient";

const AuthContext = createContext(null);

const STORAGE_KEY = "agentic_saas_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.accessToken),
      role: auth?.role || "guest",
      orgId: auth?.organization?.id || "",
      async login(email, password) {
        const data = await apiRequest("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!data.ok) throw new Error(data.message || "Login failed");
        setAuth({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: data.user,
          role: data.role,
          organization: data.organization,
        });
        return data;
      },
      async register(name, email, password, orgName) {
        const data = await apiRequest("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, org_name: orgName || undefined }),
        });
        if (!data.ok) throw new Error(data.message || "Registration failed");
        setAuth({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: data.user,
          role: data.role,
          organization: data.organization,
        });
        return data;
      },
      async logout() {
        try {
          if (auth?.refreshToken) {
            await apiRequest("/api/v1/auth/logout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: auth.refreshToken }),
            });
          }
        } catch {
          // no-op, local logout still succeeds
        }
        setAuth(null);
      },
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}


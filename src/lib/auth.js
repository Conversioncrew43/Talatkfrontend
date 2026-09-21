"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("talatk_token");
    if (!stored) {
      queueMicrotask(() => setReady(true));
      return;
    }
    queueMicrotask(() => setToken(stored));
    api("/auth/me", { token: stored })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("talatk_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      async login(email, password) {
        const data = await api("/auth/login", { method: "POST", body: { email, password } });
        localStorage.setItem("talatk_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async register(name, email, password) {
        const data = await api("/auth/register", {
          method: "POST",
          body: { name, email, password },
        });
        localStorage.setItem("talatk_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      completePasswordlessAuth(data) {
        localStorage.setItem("talatk_token", data.token);
        setToken(data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem("talatk_token");
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

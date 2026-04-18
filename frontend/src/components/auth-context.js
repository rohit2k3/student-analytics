"use client";

import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("spa_token") : null
  );
  const [user, setUser] = useState(() =>
    typeof window !== "undefined"
      ? parseJson(localStorage.getItem("spa_user") || "null", null)
      : null
  );

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isTeacher: user?.role === "teacher",
      isStudent: !user?.role || user?.role === "student",
      login: (newToken, newUser) => {
        localStorage.setItem("spa_token", newToken);
        localStorage.setItem("spa_user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
      },
      logout: () => {
        localStorage.removeItem("spa_token");
        localStorage.removeItem("spa_user");
        setToken(null);
        setUser(null);
      },
      updateUser: (nextUser) => {
        localStorage.setItem("spa_user", JSON.stringify(nextUser));
        setUser(nextUser);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}


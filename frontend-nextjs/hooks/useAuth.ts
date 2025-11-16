"use client";

import { useState, useEffect } from "react";
import { login as apiLogin } from "@/lib/api";

export interface AuthUser {
  userId: string;
  username: string;
  isAnonymous: boolean;
  token: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username?: string) => {
    setLoading(true);
    try {
      const response = await apiLogin(username);
      const authUser: AuthUser = {
        userId: response.userId,
        username: response.username,
        isAnonymous: response.isAnonymous,
        token: response.token,
      };
      setUser(authUser);
      localStorage.setItem("user", JSON.stringify(authUser));
      return authUser;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return { user, loading, login, logout };
}

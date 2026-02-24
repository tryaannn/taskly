"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthSession } from "@/types";
import {
  getSession,
  login,
  logout,
  register,
  syncSessionCookie,
} from "@/lib/auth";

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync: if localStorage was cleared manually, purge stale cookie
    syncSessionCookie();
    setSession(getSession());
    setLoading(false);
  }, []);

  const handleLogin = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await login(email, password);
      if (result.success) {
        setSession(getSession());
      }
      return result;
    },
    []
  );

  const handleRegister = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await register(name, email, password);
      if (result.success) {
        setSession(getSession());
      }
      return result;
    },
    []
  );

  const handleLogout = useCallback(() => {
    logout();
    setSession(null);
  }, []);

  return { session, loading, handleLogin, handleRegister, handleLogout };
}

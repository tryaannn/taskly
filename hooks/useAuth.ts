"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthSession } from "@/types";
import { login, logout, register, getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 1. Load initial session
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // 2. Subscribe to Supabase auth state changes (token refresh, sign-out, etc.)
    //    This fires whenever the cookie-stored JWT is refreshed or the user
    //    signs out from another tab.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (!supabaseSession) {
        setSession(null);
      } else {
        const user = supabaseSession.user;
        setSession({
          userId: user.id,
          name:
            (user.user_metadata?.name as string | undefined) ??
            user.email ??
            "",
          email: user.email ?? "",
          loginAt: user.last_sign_in_at ?? new Date().toISOString(),
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions (call API routes → server-side validation + rate limit) ───

  const handleLogin = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const result = await login(email, password);
      if (result.success) {
        // Session will be set automatically by onAuthStateChange after the
        // cookie is written by the API route + client reads it.
        const s = await getSession();
        setSession(s);
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
        const s = await getSession();
        setSession(s);
      }
      return result;
    },
    []
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setSession(null);
  }, []);

  return { session, loading, handleLogin, handleRegister, handleLogout };
}

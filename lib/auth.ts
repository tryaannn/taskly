/**
 * lib/auth.ts — Client-side auth helpers.
 *
 * All mutating operations (login / register / logout) are delegated to
 * Next.js API routes so that:
 *   • Passwords are hashed with bcrypt (Supabase internal)
 *   • Session tokens are stored in HttpOnly cookies set by the server
 *   • Rate limiting and Zod validation run server-side
 *
 * getSession() uses the Supabase browser client which reads the cookies
 * set by the server and verifies the JWT with Supabase's servers.
 */

import { createClient } from "./supabase/client";
import type { AuthSession } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiPost(
  path: string,
  body: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok)
      return { success: false, error: data.error ?? "Terjadi kesalahan." };
    return { success: true };
  } catch {
    return { success: false, error: "Tidak dapat terhubung ke server." };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Delegates to POST /api/auth/register which applies:
 *   - Zod validation, rate limiting, Supabase bcrypt hashing.
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  return apiPost("/api/auth/register", { name, email, password });
}

/**
 * Sign in with email + password.
 * Delegates to POST /api/auth/login which applies:
 *   - Zod validation, per-IP + per-email rate limiting.
 *   - On success, Supabase sets HttpOnly session cookies in the response.
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  return apiPost("/api/auth/login", { email, password });
}

/**
 * Sign out — clears the Supabase session cookies server-side.
 */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

/**
 * Returns the current authenticated user's session.
 * The browser client reads the HttpOnly-compatible cookies that were set
 * by the server during login, then verifies the JWT with Supabase.
 */
export async function getSession(): Promise<AuthSession | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    userId: user.id,
    name: (user.user_metadata?.name as string | undefined) ?? user.email ?? "",
    email: user.email ?? "",
    loginAt: user.last_sign_in_at ?? new Date().toISOString(),
  };
}

/** Convenience boolean wrapper around getSession(). */
export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

import type { User, AuthSession } from "@/types";
import { generateId, hashPassword } from "./utils";

const USERS_KEY = "taskly_users";
const SESSION_KEY = "taskly_session";
const SESSION_COOKIE = "taskly_session";

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Sync cookie for middleware (server-readable)
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(
    JSON.stringify(session)
  )}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const users = getUsers();
  const exists = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (exists) {
    return { success: false, error: "Email sudah terdaftar." };
  }

  const hashedPassword = await hashPassword(password);

  const newUser: User = {
    id: generateId(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);

  const session: AuthSession = {
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    loginAt: new Date().toISOString(),
  };
  setSession(session);
  return { success: true };
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const users = getUsers();
  const hashedPassword = await hashPassword(password);

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === hashedPassword
  );
  if (!user) {
    return { success: false, error: "Email atau kata sandi salah." };
  }

  const session: AuthSession = {
    userId: user.id,
    name: user.name,
    email: user.email,
    loginAt: new Date().toISOString(),
  };
  setSession(session);
  return { success: true };
}

export function logout(): void {
  clearSession();
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    // Validate session has required fields
    if (!session.userId || !session.email) return null;
    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Sync check: if localStorage session is missing but cookie exists,
 * the cookie is stale — clear it. Call this on app boot.
 */
export function syncSessionCookie(): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    // localStorage was cleared manually — purge stale cookie
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

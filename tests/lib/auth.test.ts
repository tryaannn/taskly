/**
 * tests/lib/auth.test.ts
 *
 * Since auth.ts now delegates to server API routes (for security: rate limiting,
 * bcrypt hashing, HttpOnly cookies), we test it by mocking fetch.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { login, register, logout, getSession } from "@/lib/auth";

// ── Mock Supabase browser client used by getSession() ─────────────────────────
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "alice@example.com",
            user_metadata: { name: "Alice" },
            last_sign_in_at: "2026-01-01T00:00:00Z",
          },
        },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockFetch(status: number, body: Record<string, unknown>) {
  return vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ── register() ────────────────────────────────────────────────────────────────
describe("register()", () => {
  it("returns success:true on 201 response", async () => {
    mockFetch(201, { success: true });
    const result = await register("Alice", "alice@example.com", "Secret1!");
    expect(result.success).toBe(true);
  });

  it("returns success:false with error message on 409 (duplicate email)", async () => {
    mockFetch(409, { error: "Email sudah terdaftar." });
    const result = await register("Alice", "alice@example.com", "Secret1!");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/terdaftar/i);
  });

  it("returns success:false on network failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const result = await register("Alice", "alice@example.com", "Secret1!");
    expect(result.success).toBe(false);
  });

  it("sends the correct payload to the API", async () => {
    const spy = mockFetch(201, { success: true });
    await register("Bob", "bob@example.com", "Secret1!");
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("/api/auth/register");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({ name: "Bob", email: "bob@example.com" });
    // Password must be in the body (server hashes it; plaintext is sent over HTTPS)
    expect(body.password).toBeDefined();
  });
});

// ── login() ───────────────────────────────────────────────────────────────────
describe("login()", () => {
  it("returns success:true on 200 response", async () => {
    mockFetch(200, { success: true });
    const result = await login("alice@example.com", "Secret1!");
    expect(result.success).toBe(true);
  });

  it("returns success:false with error on 401", async () => {
    mockFetch(401, { error: "Email atau kata sandi salah." });
    const result = await login("alice@example.com", "wrong");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns success:false on rate limit (429)", async () => {
    mockFetch(429, { error: "Terlalu banyak percobaan." });
    const result = await login("alice@example.com", "any");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/terlalu banyak/i);
  });
});

// ── logout() ──────────────────────────────────────────────────────────────────
describe("logout()", () => {
  it("calls POST /api/auth/logout", async () => {
    const spy = mockFetch(200, { success: true });
    await logout();
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("/api/auth/logout");
    expect((init as RequestInit).method).toBe("POST");
  });
});

// ── getSession() ──────────────────────────────────────────────────────────────
describe("getSession()", () => {
  it("returns the session from Supabase getUser()", async () => {
    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe("alice@example.com");
    expect(session?.name).toBe("Alice");
    expect(session?.userId).toBe("user-123");
  });
});

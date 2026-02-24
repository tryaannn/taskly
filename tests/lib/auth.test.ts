import { describe, it, expect, beforeEach } from "vitest";
import { register, login, logout, getSession, isAuthenticated } from "@/lib/auth";

beforeEach(() => {
  localStorage.clear();
  // Clear session cookie
  document.cookie = "taskly_session=; max-age=0";
});

describe("register()", () => {
  it("creates a new user and returns success", async () => {
    const result = await register("Alice", "alice@example.com", "secret123");
    expect(result.success).toBe(true);
  });

  it("stores password as hash (not plaintext)", async () => {
    await register("Bob", "bob@example.com", "mypassword");
    const raw = localStorage.getItem("taskly_users");
    expect(raw).toBeTruthy();
    const users = JSON.parse(raw!);
    expect(users[0].password).not.toBe("mypassword");
    expect(users[0].password).toHaveLength(64); // SHA-256 hex = 64 chars
  });

  it("rejects duplicate email", async () => {
    await register("Alice", "alice@example.com", "pass1");
    const result = await register("Alice2", "alice@example.com", "pass2");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("login()", () => {
  beforeEach(async () => {
    await register("Alice", "alice@example.com", "secret123");
  });

  it("succeeds with correct credentials", async () => {
    const result = await login("alice@example.com", "secret123");
    expect(result.success).toBe(true);
  });

  it("fails with wrong password", async () => {
    const result = await login("alice@example.com", "wrongpass");
    expect(result.success).toBe(false);
  });

  it("fails with unknown email", async () => {
    const result = await login("unknown@example.com", "secret123");
    expect(result.success).toBe(false);
  });

  it("sets session after successful login", async () => {
    await login("alice@example.com", "secret123");
    expect(isAuthenticated()).toBe(true);
  });
});

describe("logout()", () => {
  it("clears the session", async () => {
    await register("Alice", "alice@example.com", "secret123");
    await login("alice@example.com", "secret123");
    logout();
    expect(getSession()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});

describe("getSession()", () => {
  it("returns null when not logged in", () => {
    expect(getSession()).toBeNull();
  });

  it("returns session after login", async () => {
    await register("Alice", "alice@example.com", "pass");
    await login("alice@example.com", "pass");
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe("alice@example.com");
    expect(session?.name).toBe("Alice");
  });
});

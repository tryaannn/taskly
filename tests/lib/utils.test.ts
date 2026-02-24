import { describe, it, expect } from "vitest";
import {
  cn,
  generateId,
  formatDueDate,
  isOverdue,
  getInitials,
} from "@/lib/utils";

describe("cn()", () => {
  it("joins truthy classes", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters falsy values", () => {
    expect(cn("a", null, undefined, false, "", "b")).toBe("a b");
  });

  it("returns empty string when all falsy", () => {
    expect(cn(null, false)).toBe("");
  });
});

describe("generateId()", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateId()).toBe("string");
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("returns unique values", () => {
    const ids = Array.from({ length: 100 }, () => generateId());
    expect(new Set(ids).size).toBe(100);
  });
});

describe("getInitials()", () => {
  it("returns first letter of first two words", () => {
    expect(getInitials("Budi Santoso")).toBe("BS");
  });

  it("handles a single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("uppercases letters", () => {
    expect(getInitials("ani wati")).toBe("AW");
  });

  it("only uses first two words", () => {
    expect(getInitials("A B C D")).toBe("AB");
  });
});

describe("isOverdue()", () => {
  it("returns false when dueDate is undefined", () => {
    expect(isOverdue(undefined)).toBe(false);
  });

  it("returns true for a past date", () => {
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    expect(isOverdue(past)).toBe(true);
  });

  it("returns false for a future date", () => {
    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    expect(isOverdue(future)).toBe(false);
  });
});

describe("formatDueDate()", () => {
  it("returns isOverdue=true for past date", () => {
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatDueDate(past);
    expect(result.isOverdue).toBe(true);
    expect(result.isDueToday).toBe(false);
    expect(result.label).toMatch(/Terlambat/);
  });

  it("returns isDueToday=true for today", () => {
    const todayIso = new Date().toISOString();
    const result = formatDueDate(todayIso);
    expect(result.isDueToday).toBe(true);
    expect(result.label).toBe("Hari ini");
  });

  it("returns isDueSoon=true 1 day from now", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const result = formatDueDate(tomorrow);
    expect(result.isDueSoon).toBe(true);
    expect(result.label).toBe("Besok");
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTasks,
  addTask,
  deleteTask,
  toggleTask,
  updateTask,
  deleteCompletedTasks,
  getCategories,
} from "@/lib/tasks";

// happy-dom provides localStorage automatically
const USER = "test-user-123";

beforeEach(() => {
  localStorage.clear();
});

describe("getTasks()", () => {
  it("returns [] when no tasks stored", () => {
    expect(getTasks(USER)).toEqual([]);
  });
});

describe("addTask()", () => {
  it("adds and returns a task", () => {
    const task = addTask(USER, { text: "Buy milk", priority: "medium" });
    expect(task.text).toBe("Buy milk");
    expect(task.priority).toBe("medium");
    expect(task.completed).toBe(false);
    expect(task.userId).toBe(USER);
  });

  it("persists task to localStorage", () => {
    addTask(USER, { text: "Test task", priority: "high" });
    const tasks = getTasks(USER);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe("Test task");
  });

  it("trims whitespace from text", () => {
    const task = addTask(USER, { text: "  hello  ", priority: "low" });
    expect(task.text).toBe("hello");
  });

  it("stores dueDate when provided", () => {
    const task = addTask(USER, {
      text: "Task with date",
      priority: "medium",
      dueDate: "2030-12-31",
    });
    expect(task.dueDate).toBe("2030-12-31");
  });

  it("stores category when provided", () => {
    const task = addTask(USER, {
      text: "Categorised task",
      priority: "low",
      category: "Work",
    });
    expect(task.category).toBe("Work");
  });

  it("prepends new tasks (newest first)", () => {
    addTask(USER, { text: "First", priority: "low" });
    addTask(USER, { text: "Second", priority: "low" });
    const tasks = getTasks(USER);
    expect(tasks[0].text).toBe("Second");
  });
});

describe("deleteTask()", () => {
  it("removes the task by id", () => {
    const task = addTask(USER, { text: "Remove me", priority: "medium" });
    deleteTask(USER, task.id);
    expect(getTasks(USER)).toHaveLength(0);
  });

  it("leaves other tasks unaffected", () => {
    const a = addTask(USER, { text: "A", priority: "low" });
    addTask(USER, { text: "B", priority: "low" });
    deleteTask(USER, a.id);
    const remaining = getTasks(USER);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].text).toBe("B");
  });
});

describe("toggleTask()", () => {
  it("marks active task as completed", () => {
    const task = addTask(USER, { text: "Toggle me", priority: "medium" });
    toggleTask(USER, task.id);
    const updated = getTasks(USER)[0];
    expect(updated.completed).toBe(true);
    expect(updated.completedAt).toBeDefined();
  });

  it("marks completed task as active", () => {
    const task = addTask(USER, { text: "Already done", priority: "medium" });
    toggleTask(USER, task.id);
    toggleTask(USER, task.id);
    const updated = getTasks(USER)[0];
    expect(updated.completed).toBe(false);
    expect(updated.completedAt).toBeUndefined();
  });
});

describe("updateTask()", () => {
  it("updates text and priority", () => {
    const task = addTask(USER, { text: "Old text", priority: "low" });
    const updated = updateTask(USER, task.id, {
      text: "New text",
      priority: "high",
    });
    expect(updated?.text).toBe("New text");
    expect(updated?.priority).toBe("high");
  });

  it("returns null for unknown id", () => {
    expect(updateTask(USER, "nonexistent-id", { text: "x" })).toBeNull();
  });
});

describe("deleteCompletedTasks()", () => {
  it("removes completed tasks and returns count", () => {
    const t1 = addTask(USER, { text: "A", priority: "low" });
    addTask(USER, { text: "B", priority: "low" });
    toggleTask(USER, t1.id); // mark A as done
    const deleted = deleteCompletedTasks(USER);
    expect(deleted).toBe(1);
    const remaining = getTasks(USER);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].text).toBe("B");
  });
});

describe("getCategories()", () => {
  it("returns unique categories", () => {
    addTask(USER, { text: "A", priority: "low", category: "Work" });
    addTask(USER, { text: "B", priority: "low", category: "Work" });
    addTask(USER, { text: "C", priority: "low", category: "Study" });
    const cats = getCategories(USER);
    expect(cats.sort()).toEqual(["Study", "Work"]);
  });

  it("excludes tasks without category", () => {
    addTask(USER, { text: "A", priority: "low" });
    addTask(USER, { text: "B", priority: "low", category: "X" });
    expect(getCategories(USER)).toEqual(["X"]);
  });
});

/**
 * tests/lib/tasks.test.ts
 *
 * lib/tasks.ts now calls Next.js API routes instead of localStorage.
 * Functions are async and we mock global.fetch to unit-test them in isolation.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getTasks,
  addTask,
  deleteTask,
  toggleTask,
  updateTask,
  deleteCompletedTasks,
  getCategories,
} from "@/lib/tasks";
import type { Task } from "@/types";

const USER = "test-user-123";

// ── fetch mock helpers ────────────────────────────────────────────────────────

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function created(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    userId: USER,
    text: "Buy milk",
    priority: "medium",
    completed: false,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

afterEach(() => vi.restoreAllMocks());

// ── getTasks() ────────────────────────────────────────────────────────────────

describe("getTasks()", () => {
  it("returns mapped tasks from the API", async () => {
    const row = {
      id: "t1",
      user_id: USER,
      text: "Hello",
      priority: "low",
      completed: false,
      created_at: "2026-01-01T00:00:00Z",
      completed_at: null,
      due_date: null,
      category: null,
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(ok({ tasks: [row] }));
    const tasks = await getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe("Hello");
    expect(tasks[0].userId).toBe(USER);
  });

  it("calls GET /api/tasks", async () => {
    const spy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(ok({ tasks: [] }));
    await getTasks();
    expect(spy.mock.calls[0][0]).toBe("/api/tasks");
  });
});

// ── addTask() ─────────────────────────────────────────────────────────────────

describe("addTask()", () => {
  it("returns the created task", async () => {
    const row = {
      id: "t2",
      user_id: USER,
      text: "Buy milk",
      priority: "medium",
      completed: false,
      created_at: "2026-01-01T00:00:00Z",
      completed_at: null,
      due_date: null,
      category: null,
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(created({ task: row }));
    const task = await addTask(USER, { text: "Buy milk", priority: "medium" });
    expect(task.text).toBe("Buy milk");
    expect(task.priority).toBe("medium");
    expect(task.completed).toBe(false);
  });

  it("sends correct body to POST /api/tasks", async () => {
    const spy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        created({
          task: {
            id: "t",
            user_id: USER,
            text: "T",
            priority: "high",
            completed: false,
            created_at: "2026-01-01T00:00:00Z",
            completed_at: null,
            due_date: "2030-12-31",
            category: "Work",
          },
        })
      );
    await addTask(USER, {
      text: "T",
      priority: "high",
      dueDate: "2030-12-31",
      category: "Work",
    });
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("/api/tasks");
    expect((init as RequestInit).method).toBe("POST");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.priority).toBe("high");
    expect(body.dueDate).toBe("2030-12-31");
    expect(body.category).toBe("Work");
  });
});

// ── deleteTask() ──────────────────────────────────────────────────────────────

describe("deleteTask()", () => {
  it("calls DELETE /api/tasks/:id", async () => {
    const spy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(ok({ success: true }));
    await deleteTask(USER, "task-123");
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("/api/tasks/task-123");
    expect((init as RequestInit).method).toBe("DELETE");
  });
});

// ── toggleTask() ──────────────────────────────────────────────────────────────

describe("toggleTask()", () => {
  it("sends PATCH with completed:true when task is currently false", async () => {
    const spy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        ok({
          task: {
            id: "t1",
            user_id: USER,
            text: "X",
            priority: "low",
            completed: true,
            created_at: "2026-01-01T00:00:00Z",
            completed_at: "2026-01-02T00:00:00Z",
            due_date: null,
            category: null,
          },
        })
      );
    const result = await toggleTask(USER, "t1", false);
    expect(result?.completed).toBe(true);
    const body = JSON.parse(
      (spy.mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.completed).toBe(true);
  });

  it("sends PATCH with completed:false when task is currently true", async () => {
    const spy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        ok({
          task: {
            id: "t1",
            user_id: USER,
            text: "X",
            priority: "low",
            completed: false,
            created_at: "2026-01-01T00:00:00Z",
            completed_at: null,
            due_date: null,
            category: null,
          },
        })
      );
    await toggleTask(USER, "t1", true);
    const body = JSON.parse(
      (spy.mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.completed).toBe(false);
  });
});

// ── updateTask() ──────────────────────────────────────────────────────────────

describe("updateTask()", () => {
  it("sends PATCH with updated fields", async () => {
    const spy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        ok({
          task: {
            id: "t1",
            user_id: USER,
            text: "New text",
            priority: "high",
            completed: false,
            created_at: "2026-01-01T00:00:00Z",
            completed_at: null,
            due_date: null,
            category: null,
          },
        })
      );
    const result = await updateTask(USER, "t1", {
      text: "New text",
      priority: "high",
    });
    expect(result?.text).toBe("New text");
    expect(result?.priority).toBe("high");
    const body = JSON.parse(
      (spy.mock.calls[0][1] as RequestInit).body as string
    );
    expect(body.text).toBe("New text");
    expect(body.priority).toBe("high");
  });

  it("returns null on fetch error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));
    const result = await updateTask(USER, "t1", { text: "x" });
    expect(result).toBeNull();
  });
});

// ── deleteCompletedTasks() ────────────────────────────────────────────────────

describe("deleteCompletedTasks()", () => {
  it("deletes only completed tasks and returns count", async () => {
    const spy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(ok({ success: true })); // one DELETE call

    const tasks: Task[] = [
      makeTask({ id: "t1", completed: true }),
      makeTask({ id: "t2", completed: false }),
    ];
    const count = await deleteCompletedTasks(USER, tasks);
    expect(count).toBe(1);
    // Only one fetch (for the completed task)
    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0][0]).toBe("/api/tasks/t1");
  });
});

// ── getCategories() ───────────────────────────────────────────────────────────

describe("getCategories()", () => {
  it("returns unique sorted categories from a task list", () => {
    const tasks: Task[] = [
      makeTask({ category: "Work" }),
      makeTask({ id: "t2", category: "Work" }),
      makeTask({ id: "t3", category: "Study" }),
    ];
    expect(getCategories(USER, tasks)).toEqual(["Study", "Work"]);
  });

  it("excludes tasks without category", () => {
    const tasks: Task[] = [makeTask({}), makeTask({ id: "t2", category: "X" })];
    expect(getCategories(USER, tasks)).toEqual(["X"]);
  });
});

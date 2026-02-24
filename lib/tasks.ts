/**
 * lib/tasks.ts — Client-side task helpers.
 *
 * All operations go through Next.js API routes (server-side), which:
 *   • Verify the auth session via Supabase (no client-supplied userId needed)
 *   • Apply Zod validation on every write
 *   • Use Supabase Row-Level-Security as a second defence layer
 *
 * Data is now stored in Supabase PostgreSQL, not localStorage.
 */

import type { Task, Priority } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddTaskOptions {
  text: string;
  priority: Priority;
  dueDate?: string;
  category?: string;
}

// ─── Row mapper (snake_case DB → camelCase TS) ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRow(row: Record<string, any>): Task {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    text: row.text as string,
    priority: row.priority as Priority,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string | null) ?? undefined,
    dueDate: (row.due_date as string | null) ?? undefined,
    category: (row.category as string | null) ?? undefined,
  };
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok)
    throw new Error((data as { error?: string }).error ?? "Request gagal");
  return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch all tasks for the authenticated user. */
export async function getTasks(): Promise<Task[]> {
  const data = await apiFetch<{ tasks: Record<string, unknown>[] }>(
    "/api/tasks"
  );
  return data.tasks.map(mapRow);
}

/** Create a new task and return the persisted record. */
export async function addTask(
  _userId: string,
  options: AddTaskOptions
): Promise<Task> {
  const data = await apiFetch<{ task: Record<string, unknown> }>("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      text: options.text,
      priority: options.priority,
      dueDate: options.dueDate ?? null,
      category: options.category ?? null,
    }),
  });
  return mapRow(data.task);
}

/** Update arbitrary fields on a task. Returns the updated record. */
export async function updateTask(
  _userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> {
  try {
    const body: Record<string, unknown> = {};
    if (updates.text !== undefined) body.text = updates.text;
    if (updates.priority !== undefined) body.priority = updates.priority;
    if (updates.completed !== undefined) body.completed = updates.completed;
    if (updates.dueDate !== undefined) body.dueDate = updates.dueDate;
    if (updates.category !== undefined) body.category = updates.category;

    const data = await apiFetch<{ task: Record<string, unknown> }>(
      `/api/tasks/${taskId}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
    return mapRow(data.task);
  } catch {
    return null;
  }
}

/** Delete a task by id. */
export async function deleteTask(
  _userId: string,
  taskId: string
): Promise<void> {
  await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
}

/** Delete all completed tasks. Returns number of deleted records. */
export async function deleteCompletedTasks(
  _userId: string,
  tasks: Task[]
): Promise<number> {
  const completed = tasks.filter((t) => t.completed);
  await Promise.all(completed.map((t) => deleteTask("", t.id)));
  return completed.length;
}

/** Toggle the completed state of a task. */
export async function toggleTask(
  _userId: string,
  taskId: string,
  currentCompleted: boolean
): Promise<Task | null> {
  return updateTask("", taskId, { completed: !currentCompleted });
}

/** Get unique categories from a list of tasks. */
export function getCategories(_userId: string, tasks: Task[]): string[] {
  const cats = new Set(
    tasks.map((t) => t.category).filter(Boolean) as string[]
  );
  return Array.from(cats).sort();
}

import type { Task, Priority } from "@/types";
import { generateId, isOverdue } from "./utils";

function getKey(userId: string): string {
  return `taskly_tasks_${userId}`;
}

export function getTasks(userId: string): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(userId: string, tasks: Task[]): void {
  localStorage.setItem(getKey(userId), JSON.stringify(tasks));
}

export interface AddTaskOptions {
  text: string;
  priority: Priority;
  dueDate?: string;
  category?: string;
}

export function addTask(userId: string, options: AddTaskOptions): Task {
  const tasks = getTasks(userId);
  const task: Task = {
    id: generateId(),
    userId,
    text: options.text.trim(),
    priority: options.priority,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: options.dueDate,
    category: options.category?.trim() || undefined,
  };
  const updated = [task, ...tasks];
  saveTasks(userId, updated);
  // Optimistic: return task directly, no re-read needed
  return task;
}

export function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Task | null {
  const tasks = getTasks(userId);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  const updated: Task = { ...tasks[idx], ...updates };
  if (updates.completed !== undefined) {
    updated.completedAt = updates.completed
      ? new Date().toISOString()
      : undefined;
  }
  tasks[idx] = updated;
  saveTasks(userId, tasks);
  return updated;
}

export function deleteTask(userId: string, taskId: string): void {
  const tasks = getTasks(userId);
  saveTasks(
    userId,
    tasks.filter((t) => t.id !== taskId)
  );
}

export function deleteCompletedTasks(userId: string): number {
  const tasks = getTasks(userId);
  const remaining = tasks.filter((t) => !t.completed);
  const deleted = tasks.length - remaining.length;
  saveTasks(userId, remaining);
  return deleted;
}

export function toggleTask(userId: string, taskId: string): Task | null {
  const tasks = getTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;
  return updateTask(userId, taskId, { completed: !task.completed });
}

/** Get unique categories across all tasks for a user */
export function getCategories(userId: string): string[] {
  const tasks = getTasks(userId);
  const cats = new Set(
    tasks.map((t) => t.category).filter(Boolean) as string[]
  );
  return Array.from(cats).sort();
}

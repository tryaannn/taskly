"use client";

import { create } from "zustand";
import type { Task, Priority, FilterType, SortType } from "@/types";
import {
  getTasks,
  addTask as addTaskLib,
  deleteTask as deleteTaskLib,
  deleteCompletedTasks as deleteCompletedLib,
  toggleTask as toggleTaskLib,
  updateTask as updateTaskLib,
  type AddTaskOptions,
} from "@/lib/tasks";

// ─── State shape ──────────────────────────────────────────────────────────────

interface TaskState {
  tasks: Task[];
  filter: FilterType;
  sort: SortType;
  search: string;
  categoryFilter: string;
  loading: boolean;
  error: string | null;

  // ── Actions (all async — delegate to API via lib/tasks) ──────────────────
  init: (userId: string) => Promise<void>;
  addTask: (userId: string, options: AddTaskOptions) => Promise<Task | null>;
  deleteTask: (userId: string, taskId: string) => Promise<void>;
  deleteCompleted: (userId: string) => Promise<number>;
  toggleTask: (userId: string, taskId: string) => Promise<void>;
  editTask: (
    userId: string,
    taskId: string,
    text: string,
    priority: Priority,
    dueDate?: string,
    category?: string
  ) => Promise<void>;

  // ── Filter / sort actions (synchronous) ──────────────────────────────────
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType) => void;
  setSearch: (search: string) => void;
  setCategoryFilter: (cat: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: "all",
  sort: "newest",
  search: "",
  categoryFilter: "",
  loading: false,
  error: null,

  // ── Init: load all tasks from Supabase on mount ───────────────────────────
  init: async (_userId) => {
    set({ loading: true, error: null });
    try {
      const tasks = await getTasks();
      set({ tasks, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  // ── Optimistic add: insert locally, then persist ──────────────────────────
  addTask: async (userId, options) => {
    // Optimistic placeholder so the UI feels instant
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Task = {
      id: optimisticId,
      userId,
      text: options.text.trim(),
      priority: options.priority,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: options.dueDate,
      category: options.category?.trim() || undefined,
    };
    set((s) => ({ tasks: [optimistic, ...s.tasks] }));

    try {
      const persisted = await addTaskLib(userId, options);
      // Swap optimistic entry with the real persisted record
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === optimisticId ? persisted : t)),
      }));
      return persisted;
    } catch (err) {
      // Rollback on failure
      set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== optimisticId),
        error: (err as Error).message,
      }));
      return null;
    }
  },

  // ── Optimistic delete ─────────────────────────────────────────────────────
  deleteTask: async (userId, taskId) => {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
    try {
      await deleteTaskLib(userId, taskId);
    } catch {
      set({ tasks: prev }); // rollback
    }
  },

  // ── Delete all completed ──────────────────────────────────────────────────
  deleteCompleted: async (userId) => {
    const prev = get().tasks;
    const completed = prev.filter((t) => t.completed);
    set((s) => ({ tasks: s.tasks.filter((t) => !t.completed) }));
    try {
      const count = await deleteCompletedLib(userId, prev);
      return count;
    } catch {
      set({ tasks: prev }); // rollback
      return 0;
    }
  },

  // ── Optimistic toggle ─────────────────────────────────────────────────────
  toggleTask: async (_userId, taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic flip
    const optimistic: Task = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    };
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? optimistic : t)),
    }));

    try {
      const updated = await toggleTaskLib("", taskId, task.completed);
      if (updated) {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)),
        }));
      }
    } catch {
      // Rollback to original
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === taskId ? task : t)),
      }));
    }
  },

  // ── Optimistic edit ───────────────────────────────────────────────────────
  editTask: async (_userId, taskId, text, priority, dueDate, category) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const optimistic: Task = { ...task, text, priority, dueDate, category };
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? optimistic : t)),
    }));

    try {
      const updated = await updateTaskLib("", taskId, {
        text,
        priority,
        dueDate,
        category,
      });
      if (updated) {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)),
        }));
      }
    } catch {
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === taskId ? task : t)),
      }));
    }
  },

  // ── Synchronous filter / sort setters ────────────────────────────────────
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setSearch: (search) => set({ search }),
  setCategoryFilter: (cat) => set({ categoryFilter: cat }),
}));

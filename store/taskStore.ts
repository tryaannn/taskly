"use client";

import { create } from "zustand";
import type { Task, Priority, FilterType, SortType, TaskStats } from "@/types";
import {
  getTasks,
  addTask as addTaskLib,
  deleteTask as deleteTaskLib,
  deleteCompletedTasks as deleteCompletedLib,
  toggleTask as toggleTaskLib,
  updateTask as updateTaskLib,
  getCategories,
  type AddTaskOptions,
} from "@/lib/tasks";
import { isOverdue } from "@/lib/utils";

interface TaskState {
  tasks: Task[];
  filter: FilterType;
  sort: SortType;
  search: string;
  categoryFilter: string;

  // Actions
  init: (userId: string) => void;
  addTask: (userId: string, options: AddTaskOptions) => Task;
  deleteTask: (userId: string, taskId: string) => void;
  deleteCompleted: (userId: string) => number;
  toggleTask: (userId: string, taskId: string) => void;
  editTask: (
    userId: string,
    taskId: string,
    text: string,
    priority: Priority,
    dueDate?: string,
    category?: string
  ) => void;
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType) => void;
  setSearch: (search: string) => void;
  setCategoryFilter: (cat: string) => void;

  // Computed (derived, not stored)
  getFiltered: () => Task[];
  getStats: () => TaskStats;
  getCounts: () => Record<FilterType, number>;
  getCategories: (userId: string) => string[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filter: "all",
  sort: "newest",
  search: "",
  categoryFilter: "",

  init: (userId) => {
    set({ tasks: getTasks(userId) });
  },

  addTask: (userId, options) => {
    const task = addTaskLib(userId, options);
    // Optimistic update — prepend directly, no re-read
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  deleteTask: (userId, taskId) => {
    deleteTaskLib(userId, taskId);
    // Optimistic update — remove immediately
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));
  },

  deleteCompleted: (userId) => {
    const count = deleteCompletedLib(userId);
    set((state) => ({ tasks: state.tasks.filter((t) => !t.completed) }));
    return count;
  },

  toggleTask: (userId, taskId) => {
    const updated = toggleTaskLib(userId, taskId);
    if (!updated) return;
    // Optimistic update — swap in-place
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
    }));
  },

  editTask: (userId, taskId, text, priority, dueDate, category) => {
    const updated = updateTaskLib(userId, taskId, {
      text,
      priority,
      dueDate,
      category,
    });
    if (!updated) return;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
    }));
  },

  setFilter: (filter) => set({ filter }),
  setSort: (sort) => set({ sort }),
  setSearch: (search) => set({ search }),
  setCategoryFilter: (cat) => set({ categoryFilter: cat }),

  getFiltered: () => {
    const { tasks, filter, sort, search, categoryFilter } = get();
    let result = [...tasks];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.text.toLowerCase().includes(q));
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Status filter
    switch (filter) {
      case "active":
        result = result.filter((t) => !t.completed);
        break;
      case "completed":
        result = result.filter((t) => t.completed);
        break;
      case "high":
        result = result.filter((t) => t.priority === "high");
        break;
    }

    // Sort
    switch (sort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "az":
        result.sort((a, b) => a.text.localeCompare(b.text));
        break;
      case "priority": {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => order[a.priority] - order[b.priority]);
        break;
      }
    }

    return result;
  },

  getStats: (): TaskStats => {
    const { tasks } = get();
    // Single-pass computation
    let completed = 0;
    let highPriority = 0;
    let overdue = 0;
    for (const t of tasks) {
      if (t.completed) {
        completed++;
      } else {
        if (t.priority === "high") highPriority++;
        if (isOverdue(t.dueDate)) overdue++;
      }
    }
    return {
      total: tasks.length,
      completed,
      active: tasks.length - completed,
      highPriority,
      overdue,
    };
  },

  getCounts: () => {
    const { tasks } = get();
    let active = 0;
    let completed = 0;
    let high = 0;
    for (const t of tasks) {
      if (t.completed) completed++;
      else active++;
      if (t.priority === "high") high++;
    }
    return { all: tasks.length, active, completed, high };
  },

  getCategories: (userId) => getCategories(userId),
}));

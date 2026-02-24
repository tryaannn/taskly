"use client";

import { useEffect, useMemo } from "react";
import { useTaskStore } from "@/store/taskStore";
import { isOverdue } from "@/lib/utils";
import type { FilterType, Priority, SortType, Task, TaskStats } from "@/types";
import type { AddTaskOptions } from "@/lib/tasks";
import { getCategories } from "@/lib/tasks";

// ─── Pure computed-value functions (extracted so useMemo deps are explicit) ───

function computeFiltered(
  tasks: Task[],
  filter: FilterType,
  sort: SortType,
  search: string,
  categoryFilter: string
): Task[] {
  let result = [...tasks];

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.text.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }

  if (categoryFilter) {
    result = result.filter((t) => t.category === categoryFilter);
  }

  switch (filter) {
    case "active":
      result = result.filter((t) => !t.completed);
      break;
    case "completed":
      result = result.filter((t) => t.completed);
      break;
    case "high":
      result = result.filter((t) => t.priority === "high" && !t.completed);
      break;
    case "overdue":
      result = result.filter((t) => !t.completed && isOverdue(t.dueDate));
      break;
  }

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
}

function computeStats(tasks: Task[]): TaskStats {
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
}

function computeCounts(tasks: Task[]): Record<FilterType, number> {
  let active = 0;
  let completed = 0;
  let high = 0;
  let overdue = 0;
  for (const t of tasks) {
    if (t.completed) completed++;
    else {
      active++;
      if (t.priority === "high") high++;
      if (isOverdue(t.dueDate)) overdue++;
    }
  }
  return { all: tasks.length, active, completed, high, overdue };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Thin hook that initialises the Zustand task store for a given user
 * and exposes memoised derived selectors + async actions.
 *
 * Computed values (filteredTasks, stats, counts, categories) are recalculated
 * only when their specific dependencies change — never on every render.
 */
export function useTasks(userId: string | undefined) {
  // Subscribe to individual store slices to minimise re-renders
  const tasks = useTaskStore((s) => s.tasks);
  const filter = useTaskStore((s) => s.filter);
  const sort = useTaskStore((s) => s.sort);
  const search = useTaskStore((s) => s.search);
  const categoryFilter = useTaskStore((s) => s.categoryFilter);
  const loading = useTaskStore((s) => s.loading);
  const error = useTaskStore((s) => s.error);
  const storeInit = useTaskStore((s) => s.init);
  const storeAdd = useTaskStore((s) => s.addTask);
  const storeDelete = useTaskStore((s) => s.deleteTask);
  const storeDeleteCompleted = useTaskStore((s) => s.deleteCompleted);
  const storeToggle = useTaskStore((s) => s.toggleTask);
  const storeEdit = useTaskStore((s) => s.editTask);
  const setFilter = useTaskStore((s) => s.setFilter);
  const setSort = useTaskStore((s) => s.setSort);
  const setSearch = useTaskStore((s) => s.setSearch);
  const setCategoryFilter = useTaskStore((s) => s.setCategoryFilter);

  // Load tasks when userId becomes available
  useEffect(() => {
    if (userId) {
      storeInit(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Memoised computed values ───────────────────────────────────────────────
  // Each value only recomputes when its own dependencies change.

  const filteredTasks = useMemo(
    () => computeFiltered(tasks, filter, sort, search, categoryFilter),
    [tasks, filter, sort, search, categoryFilter]
  );

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  const counts = useMemo(() => computeCounts(tasks), [tasks]);

  const categories = useMemo(
    () => (userId ? getCategories(userId, tasks) : []),
    [userId, tasks]
  );

  // ── Typed action wrappers ─────────────────────────────────────────────────

  return {
    tasks,
    filteredTasks,
    stats,
    counts,
    categories,
    filter,
    setFilter,
    sort,
    setSort,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    loading,
    error,

    addTask: (options: AddTaskOptions) =>
      userId ? storeAdd(userId, options) : Promise.resolve(null),

    deleteTask: (id: string) =>
      userId ? storeDelete(userId, id) : Promise.resolve(),

    deleteCompleted: () =>
      userId ? storeDeleteCompleted(userId) : Promise.resolve(0),

    toggleTask: (id: string) =>
      userId ? storeToggle(userId, id) : Promise.resolve(),

    editTask: (
      id: string,
      text: string,
      priority: Priority,
      dueDate?: string,
      category?: string
    ) =>
      userId
        ? storeEdit(userId, id, text, priority, dueDate, category)
        : Promise.resolve(),
  };
}

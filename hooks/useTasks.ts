"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";

/**
 * Thin hook that initialises Zustand task store for a given user
 * and exposes derived selectors + actions.
 */
export function useTasks(userId: string | undefined) {
  const store = useTaskStore();

  // Load tasks when userId becomes available
  useEffect(() => {
    if (userId) {
      store.init(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    tasks: store.tasks,
    filteredTasks: store.getFiltered(),
    stats: store.getStats(),
    counts: store.getCounts(),
    categories: userId ? store.getCategories(userId) : [],
    filter: store.filter,
    setFilter: store.setFilter,
    sort: store.sort,
    setSort: store.setSort,
    search: store.search,
    setSearch: store.setSearch,
    categoryFilter: store.categoryFilter,
    setCategoryFilter: store.setCategoryFilter,
    addTask: (options: import("@/lib/tasks").AddTaskOptions) =>
      userId ? store.addTask(userId, options) : null,
    deleteTask: (id: string) => userId && store.deleteTask(userId, id),
    deleteCompleted: () => (userId ? store.deleteCompleted(userId) : 0),
    toggleTask: (id: string) => userId && store.toggleTask(userId, id),
    editTask: (
      id: string,
      text: string,
      priority: import("@/types").Priority,
      dueDate?: string,
      category?: string
    ) =>
      userId && store.editTask(userId, id, text, priority, dueDate, category),
  };
}

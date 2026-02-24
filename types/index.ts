export type Priority = "high" | "medium" | "low";
export type FilterType = "all" | "active" | "completed" | "high" | "overdue";
export type SortType = "newest" | "oldest" | "az" | "priority";
export type Theme = "light" | "dark";

/**
 * AuthSession — derived from Supabase's auth.User.
 * Stored in component state only; never in localStorage.
 */
export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  loginAt: string;
}

/**
 * Task — mirrors the `tasks` table in Supabase (fields camelCased).
 * The `userId` is populated by the server; the client never supplies it.
 */
export interface Task {
  id: string;
  userId: string;
  text: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  /** ISO date string YYYY-MM-DD — optional due date */
  dueDate?: string;
  /** Free-form category label */
  category?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  highPriority: number;
  overdue: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export type Priority = "high" | "medium" | "low";
export type FilterType = "all" | "active" | "completed" | "high";
export type SortType = "newest" | "oldest" | "az" | "priority";
export type Theme = "light" | "dark";

export interface User {
  id: string;
  name: string;
  email: string;
  /** SHA-256 hex hash of the password */
  password: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  text: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  /** ISO string — optional due date */
  dueDate?: string;
  /** Free-form category label */
  category?: string;
}

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  loginAt: string;
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

"use client";

import { AnimatePresence } from "framer-motion";
import type { Task, Priority } from "@/types";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "./EmptyState";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    text: string,
    priority: Priority,
    dueDate?: string,
    category?: string
  ) => void;
  onAddFirst: () => void;
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  onAddFirst,
  isFiltered = false,
  onClearFilter,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        onAdd={onAddFirst}
        isFiltered={isFiltered}
        onClearFilter={onClearFilter}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

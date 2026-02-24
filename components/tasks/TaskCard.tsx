"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, Check, X, Clock, Tag } from "lucide-react";
import type { Task, Priority } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn, formatTime, formatDueDate } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    text: string,
    priority: Priority,
    dueDate?: string,
    category?: string
  ) => void;
}

const priorityBorder: Record<Priority, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-400",
  low: "border-l-emerald-400",
};

const priorityCheckbox: Record<Priority, string> = {
  high: "border-red-400 hover:border-red-500",
  medium: "border-amber-400 hover:border-amber-500",
  low: "border-emerald-400 hover:border-emerald-500",
};

const priorityCheckboxChecked: Record<Priority, string> = {
  high: "bg-red-500 border-red-500",
  medium: "bg-amber-500 border-amber-500",
  low: "bg-emerald-500 border-emerald-500",
};

export function TaskCard({ task, onToggle, onDelete, onEdit }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ?? "");
  const [editCategory, setEditCategory] = useState(task.category ?? "");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(
        task.id,
        editText.trim(),
        editPriority,
        editDueDate || undefined,
        editCategory.trim() || undefined
      );
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ?? "");
    setEditCategory(task.category ?? "");
    setIsEditing(false);
  };

  const due = task.dueDate ? formatDueDate(task.dueDate) : null;
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -16, height: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group flex items-start gap-3 rounded-xl px-4 py-3.5 transition-all duration-150",
          "bg-(--bg-card) border border-(--border-default) border-l-[3px]",
          "hover:border-(--border-hover) card-shadow card-shadow-hover",
          priorityBorder[task.priority],
          task.completed && "opacity-70"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? "Tandai aktif" : "Tandai selesai"}
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-150",
            task.completed
              ? priorityCheckboxChecked[task.priority]
              : priorityCheckbox[task.priority]
          )}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.12 }}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                className="w-full text-sm border border-(--border-default) rounded-lg px-3 py-1.5 bg-(--bg-card) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="text-xs border border-(--border-default) rounded-md px-2 py-1 bg-(--bg-card) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
                <input
                  type="date"
                  value={editDueDate}
                  min={today}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="text-xs border border-(--border-default) rounded-md px-2 py-1 bg-(--bg-card) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Kategori..."
                  className="text-xs border border-(--border-default) rounded-md px-2 py-1 w-28 bg-(--bg-card) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <button
                  onClick={handleSave}
                  className="text-xs bg-brand-blue text-white px-3 py-1 rounded-md hover:bg-brand-blue-hover transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={handleCancel}
                  className="text-xs text-(--text-secondary) hover:text-(--text-primary) px-2 py-1"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={cn(
                  "text-sm text-(--text-primary) leading-snug wrap-break-word",
                  task.completed && "line-through text-(--text-secondary)"
                )}
              >
                {task.text}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge priority={task.priority} />

                {task.category && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                    <Tag className="h-2.5 w-2.5" />
                    {task.category}
                  </span>
                )}

                {due && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                      due.isOverdue && !task.completed
                        ? "bg-red-50 text-brand-danger dark:bg-red-950/40 dark:text-red-400"
                        : due.isDueToday && !task.completed
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : due.isDueSoon && !task.completed
                        ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                        : "bg-(--bg-surface) text-(--text-secondary)"
                    )}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {due.label}
                  </span>
                )}

                <span className="text-[10px] text-(--text-secondary) font-mono">
                  {formatTime(task.createdAt)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-(--bg-surface) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
              aria-label="Edit tugas"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-(--text-secondary) hover:text-brand-danger transition-colors"
              aria-label="Hapus tugas"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        open={showConfirm}
        title="Hapus tugas?"
        message={`"${task.text.slice(0, 60)}${
          task.text.length > 60 ? "..." : ""
        }" akan dihapus secara permanen.`}
        confirmLabel="Hapus"
        danger
        onConfirm={() => {
          setShowConfirm(false);
          onDelete(task.id);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

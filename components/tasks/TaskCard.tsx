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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20, height: 0 }}
        transition={{ duration: 0.2 }}
        className="group flex items-start gap-3 bg-white border border-brand-border rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? "Mark as active" : "Mark as completed"}
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all duration-150",
            task.completed
              ? "bg-brand-black border-brand-black"
              : "border-gray-300 hover:border-brand-black"
          )}
        >
          {task.completed && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
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
                className="w-full text-sm border border-brand-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="text-xs border border-brand-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="date"
                  value={editDueDate}
                  min={today}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="text-xs border border-brand-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Kategori..."
                  className="text-xs border border-brand-border rounded-md px-2 py-1 w-28 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <button
                  onClick={handleSave}
                  className="text-xs bg-brand-black text-white px-3 py-1 rounded-md hover:bg-neutral-800"
                >
                  Simpan
                </button>
                <button
                  onClick={handleCancel}
                  className="text-xs text-brand-muted hover:text-brand-black px-2 py-1"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={cn(
                  "text-sm text-brand-black leading-snug break-words",
                  task.completed && "line-through text-brand-muted"
                )}
              >
                {task.text}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge priority={task.priority} />

                {/* Category chip */}
                {task.category && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    <Tag className="h-2.5 w-2.5" />
                    {task.category}
                  </span>
                )}

                {/* Due date chip */}
                {due && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      due.isOverdue && !task.completed
                        ? "bg-red-50 text-brand-danger border-red-200"
                        : due.isDueToday && !task.completed
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : due.isDueSoon && !task.completed
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-gray-50 text-brand-muted border-brand-border"
                    )}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {due.label}
                  </span>
                )}

                <span className="text-xs text-brand-muted font-mono">
                  {formatTime(task.createdAt)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-brand-surface text-brand-muted hover:text-brand-black transition-colors"
              aria-label="Edit task"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-50 text-brand-muted hover:text-brand-danger transition-colors"
              aria-label="Delete task"
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

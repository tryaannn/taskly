"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Tag, Calendar } from "lucide-react";
import type { Priority } from "@/types";
import type { AddTaskOptions } from "@/lib/tasks";
import { cn } from "@/lib/utils";

interface AddTaskFormProps {
  onAdd: (opts: AddTaskOptions) => void;
  categories?: string[];
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const priorityPills: {
  value: Priority;
  label: string;
  active: string;
  dot: string;
}[] = [
  {
    value: "high",
    label: "Tinggi",
    active: "bg-red-500 text-white",
    dot: "bg-red-500",
  },
  {
    value: "medium",
    label: "Sedang",
    active: "bg-amber-500 text-white",
    dot: "bg-amber-500",
  },
  {
    value: "low",
    label: "Rendah",
    active: "bg-emerald-500 text-white",
    dot: "bg-emerald-500",
  },
];

export function AddTaskForm({
  onAdd,
  categories = [],
  inputRef,
}: AddTaskFormProps) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const localRef = useRef<HTMLInputElement>(null);
  const ref = (inputRef ?? localRef) as React.RefObject<HTMLInputElement>;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onAdd({
      text: text.trim(),
      priority,
      dueDate: dueDate || undefined,
      category: category.trim() || undefined,
    });
    setText("");
    setPriority("medium");
    setDueDate("");
    setCategory("");
    setExpanded(false);
    ref.current?.focus();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 3px rgba(37,99,235,0.14)"
            : "0 0 0 0px rgba(37,99,235,0)",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-(--bg-card) border rounded-xl transition-colors duration-150 overflow-hidden",
          focused ? "border-brand-blue" : "border-(--border-default)",
          shake && "animate-shake"
        )}
      >
        {/* Main row */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <div className="h-7 w-7 rounded-lg bg-brand-blue flex items-center justify-center shrink-0">
            <Plus className="h-4 w-4 text-white" />
          </div>

          <input
            ref={ref}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => {
              setFocused(true);
              setExpanded(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") {
                setExpanded(false);
                ref.current?.blur();
              }
            }}
            placeholder="Tambahkan tugas baru... (tekan N untuk fokus)"
            className="flex-1 bg-transparent text-sm text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none"
          />

          {/* Priority pills — inline, compact */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {priorityPills.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150",
                  priority === p.value
                    ? p.active
                    : "text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-surface)"
                )}
              >
                {priority === p.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80 shrink-0" />
                )}
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="h-8 px-4 text-xs font-semibold rounded-lg bg-brand-blue text-white hover:bg-brand-blue-hover transition-colors duration-150 shrink-0"
          >
            Tambah
          </button>
        </div>

        {/* Expanded row */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-(--border-default) px-4 py-2.5 flex items-center gap-3 flex-wrap bg-(--bg-surface)"
          >
            {/* Mobile priority selector */}
            <div className="flex sm:hidden items-center gap-1">
              {priorityPills.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150",
                    priority === p.value
                      ? p.active
                      : "text-(--text-secondary) bg-(--bg-surface)"
                  )}
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full shrink-0", p.dot)}
                  />
                  {p.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
              <Calendar className="h-3.5 w-3.5" />
              <span>Tenggat</span>
              <input
                type="date"
                value={dueDate}
                min={today}
                onChange={(e) => setDueDate(e.target.value)}
                className="ml-1 text-xs border border-(--border-default) rounded-md px-2 py-1 bg-(--bg-card) text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </label>

            <label className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
              <Tag className="h-3.5 w-3.5" />
              <span>Kategori</span>
              {categories.length > 0 ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ml-1 text-xs border border-(--border-default) rounded-md px-2 py-1 bg-(--bg-card) text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-brand-blue"
                >
                  <option value="">Pilih atau buat baru...</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="cth: Kuliah, Kerja..."
                  className="ml-1 text-xs border border-(--border-default) rounded-md px-2 py-1 bg-(--bg-card) text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-brand-blue w-36"
                />
              )}
            </label>
          </motion.div>
        )}
      </motion.div>
    </form>
  );
}

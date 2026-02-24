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

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
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
            ? "0 0 0 3px rgba(37,99,235,0.12)"
            : "0 0 0 0px rgba(37,99,235,0)",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-white border border-brand-border rounded-xl transition-colors duration-150",
          focused && "border-brand-blue",
          shake && "animate-shake"
        )}
      >
        {/* Main row */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Plus className="h-5 w-5 text-brand-muted shrink-0" />

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
            className="flex-1 bg-transparent text-sm text-brand-black placeholder:text-brand-muted focus:outline-none"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="text-xs border border-brand-border rounded-lg px-2.5 py-1.5 bg-white text-brand-black focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
          >
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-8 px-4 text-xs font-semibold rounded-lg bg-brand-black text-white hover:bg-brand-blue transition-colors duration-150 shrink-0"
          >
            Tambah
          </button>
        </div>

        {/* Expanded row — due date & category */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="border-t border-brand-border px-4 py-2.5 flex items-center gap-3 flex-wrap"
          >
            <label className="flex items-center gap-1.5 text-xs text-brand-muted">
              <Calendar className="h-3.5 w-3.5" />
              <span>Tenggat</span>
              <input
                type="date"
                value={dueDate}
                min={today}
                onChange={(e) => setDueDate(e.target.value)}
                className="ml-1 text-xs border border-brand-border rounded-md px-2 py-1 bg-white text-brand-black focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </label>

            <label className="flex items-center gap-1.5 text-xs text-brand-muted">
              <Tag className="h-3.5 w-3.5" />
              <span>Kategori</span>
              {categories.length > 0 ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ml-1 text-xs border border-brand-border rounded-md px-2 py-1 bg-white text-brand-black focus:outline-none focus:ring-1 focus:ring-brand-blue"
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
                  className="ml-1 text-xs border border-brand-border rounded-md px-2 py-1 bg-white text-brand-black focus:outline-none focus:ring-1 focus:ring-brand-blue w-36"
                />
              )}
            </label>
          </motion.div>
        )}
      </motion.div>
    </form>
  );
}

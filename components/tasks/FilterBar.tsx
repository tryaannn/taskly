"use client";

import type { FilterType, SortType } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

interface FilterBarProps {
  filter: FilterType;
  sort: SortType;
  counts: Record<FilterType, number>;
  categories: string[];
  categoryFilter: string;
  onFilterChange: (f: FilterType) => void;
  onSortChange: (s: SortType) => void;
  onCategoryChange: (c: string) => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
  { value: "high", label: "Prioritas Tinggi" },
  { value: "overdue", label: "Terlambat" },
];

const sorts: { value: SortType; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "az", label: "A–Z" },
  { value: "priority", label: "Prioritas" },
];

export function FilterBar({
  filter,
  sort,
  counts,
  categories,
  categoryFilter,
  onFilterChange,
  onSortChange,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Filter pills — scrollable on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-nowrap sm:flex-wrap">
        {filters.map((f) => {
          const isActive = filter === f.value;
          const count = counts[f.value];
          const isOverdue = f.value === "overdue";
          const hasAlert = isOverdue && count > 0;

          return (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-150 shrink-0 whitespace-nowrap",
                isActive
                  ? isOverdue
                    ? "bg-red-500 text-white"
                    : "bg-brand-blue text-white"
                  : "bg-(--bg-card) border border-(--border-default) text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-hover)"
              )}
            >
              {/* Red dot for overdue when count > 0 and not active */}
              {hasAlert && !isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              )}
              {f.label}
              <span
                className={cn(
                  "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-sm text-[10px] font-bold tabular-nums",
                  isActive
                    ? "bg-white/20 text-white"
                    : hasAlert
                    ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                    : "bg-(--bg-surface) text-(--text-secondary)"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 shrink-0">
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cn(
              "h-8 px-2 text-xs border rounded-lg cursor-pointer",
              "border-(--border-default) bg-(--bg-card) text-(--text-primary)",
              "focus:outline-none focus:ring-2 focus:ring-brand-blue"
            )}
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1.5 border border-(--border-default) rounded-lg px-2 h-8">
          <ArrowUpDown className="h-3 w-3 text-(--text-secondary) shrink-0" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            className={cn(
              "text-xs bg-transparent text-(--text-primary) cursor-pointer",
              "focus:outline-none"
            )}
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { FilterType, SortType } from "@/types";
import { cn } from "@/lib/utils";

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
  { value: "high", label: "🔴 Prioritas Tinggi" },
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
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-150",
              filter === f.value
                ? "bg-brand-black text-white"
                : "bg-white border border-brand-border text-brand-muted hover:text-brand-black hover:border-gray-400"
            )}
          >
            {f.label}
            <span
              className={cn(
                "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-sm text-[10px] font-bold",
                filter === f.value
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-8 px-2 text-xs border border-brand-border rounded-lg bg-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <span className="text-xs text-brand-muted">Sort:</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortType)}
          className="h-8 px-2 text-xs border border-brand-border rounded-lg bg-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

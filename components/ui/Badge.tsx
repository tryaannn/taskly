import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

interface BadgeProps {
  priority: Priority;
  className?: string;
}

const config: Record<
  Priority,
  { label: string; dot: string; className: string }
> = {
  high: {
    label: "Tinggi",
    dot: "bg-red-500",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  medium: {
    label: "Sedang",
    dot: "bg-amber-500",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  low: {
    label: "Rendah",
    dot: "bg-emerald-500",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
};

export function Badge({ priority, className }: BadgeProps) {
  const { label, dot, className: badgeClass } = config[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        badgeClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
      {label}
    </span>
  );
}

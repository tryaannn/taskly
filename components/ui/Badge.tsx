import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

interface BadgeProps {
  priority: Priority;
  className?: string;
}

const config: Record<Priority, { label: string; className: string }> = {
  high: {
    label: "HIGH",
    className: "bg-brand-blue-light text-brand-blue border border-blue-200",
  },
  medium: {
    label: "MED",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  low: {
    label: "LOW",
    className: "bg-gray-50 text-gray-400 border border-gray-100",
  },
};

export function Badge({ priority, className }: BadgeProps) {
  const { label, className: badgeClass } = config[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide",
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  );
}

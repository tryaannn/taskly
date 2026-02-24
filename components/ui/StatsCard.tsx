"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  /** Tailwind text color class, e.g. "text-brand-blue" */
  colorClass?: string;
  /** Tailwind bg color class for icon container, e.g. "bg-blue-50" */
  iconBgClass?: string;
}

function useCountUp(target: number, duration = 650) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const from = prev.current;
    prev.current = target;

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - (1 - t) ** 3;
      setCount(Math.round(from + eased * (target - from)));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

export function StatsCard({
  label,
  value,
  icon,
  colorClass = "text-(--text-primary)",
  iconBgClass = "bg-gray-100 dark:bg-white/10",
}: StatsCardProps) {
  const count = useCountUp(value);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "var(--shadow-card-hover)" }}
      transition={{ duration: 0.18 }}
      className={cn(
        "flex-1 rounded-xl px-4 py-4 transition-all duration-150",
        "bg-(--bg-card) border border-(--border-default)",
        "card-shadow cursor-default select-none"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            iconBgClass,
            colorClass
          )}
        >
          {icon}
        </div>
      </div>
      <p className={cn("text-3xl font-bold tabular-nums", colorClass)}>
        {count}
      </p>
    </motion.div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass?: string;
  borderHoverClass?: string;
}

function useCountUp(target: number, duration = 600) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
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
  colorClass = "text-brand-black",
  borderHoverClass,
}: StatsCardProps) {
  const count = useCountUp(value);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex-1 bg-white border border-brand-border rounded-xl px-5 py-4 transition-all duration-150",
        "hover:border-blue-200 hover:shadow-sm",
        borderHoverClass
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-brand-muted font-medium">{label}</span>
        <div className={cn("opacity-70", colorClass)}>{icon}</div>
      </div>
      <p className={cn("text-3xl font-bold font-sans", colorClass)}>{count}</p>
    </motion.div>
  );
}

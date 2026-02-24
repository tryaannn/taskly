"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import type { ToastMessage } from "@/types";
import { cn } from "@/lib/utils";

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const iconConfig = {
  success: {
    icon: <CheckCircle className="h-4 w-4" />,
    bg: "bg-emerald-100 dark:bg-emerald-900/50 text-brand-success",
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    bg: "bg-red-100 dark:bg-red-900/50 text-brand-danger",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    bg: "bg-blue-100 dark:bg-blue-900/50 text-brand-blue",
  },
};

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon, bg } = iconConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3",
                "glass border border-(--border-default) shadow-xl"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                  bg
                )}
              >
                {icon}
              </div>
              <span className="flex-1 text-sm font-medium text-(--text-primary)">
                {toast.message}
              </span>
              <button
                onClick={() => onRemove(toast.id)}
                className="text-(--text-secondary) hover:text-(--text-primary) transition-colors rounded-lg p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import type { ToastMessage } from "@/types";
import { cn } from "@/lib/utils";

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="h-4 w-4 text-brand-success shrink-0" />,
  error: <XCircle className="h-4 w-4 text-brand-danger shrink-0" />,
  info: <Info className="h-4 w-4 text-brand-blue shrink-0" />,
};

const styles = {
  success: "border-l-4 border-l-brand-success",
  error: "border-l-4 border-l-brand-danger",
  info: "border-l-4 border-l-brand-blue",
};

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 bg-white border border-brand-border rounded-xl shadow-lg px-4 py-3",
              styles[toast.type]
            )}
          >
            {icons[toast.type]}
            <span className="flex-1 text-sm text-brand-black">
              {toast.message}
            </span>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-brand-muted hover:text-brand-black transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

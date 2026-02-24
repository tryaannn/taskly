"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Trap focus & close on Escape
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-xl border border-brand-border w-full max-w-sm mx-4 p-6"
          >
            <div className="flex items-start gap-4">
              {danger && (
                <div className="shrink-0 h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-brand-danger" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2
                  id="confirm-title"
                  className="text-base font-semibold text-brand-black"
                >
                  {title}
                </h2>
                <p
                  id="confirm-desc"
                  className="text-sm text-brand-muted mt-1 leading-relaxed"
                >
                  {message}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="shrink-0 text-brand-muted hover:text-brand-black transition-colors"
                aria-label="Tutup dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                ref={cancelRef}
                variant="secondary"
                size="sm"
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={danger ? "danger" : "primary"}
                size="sm"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

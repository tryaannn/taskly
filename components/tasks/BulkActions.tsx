"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, CheckCheck } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface BulkActionsProps {
  completedCount: number;
  onDeleteCompleted: () => void;
}

export function BulkActions({
  completedCount,
  onDeleteCompleted,
}: BulkActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <AnimatePresence>
        {completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between bg-brand-surface border border-brand-border rounded-xl px-4 py-2.5"
          >
            <div className="flex items-center gap-2 text-sm text-brand-muted">
              <CheckCheck className="h-4 w-4 text-brand-success" />
              <span>
                <span className="font-semibold text-brand-black">
                  {completedCount}
                </span>{" "}
                tugas selesai
              </span>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-danger hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus semua
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={showConfirm}
        title="Hapus semua tugas selesai?"
        message={`Sebanyak ${completedCount} tugas yang sudah selesai akan dihapus secara permanen.`}
        confirmLabel="Hapus semua"
        danger
        onConfirm={() => {
          setShowConfirm(false);
          onDeleteCompleted();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

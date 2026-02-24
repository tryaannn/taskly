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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between rounded-xl px-4 py-2.5 border border-(--border-default) bg-(--bg-card)"
          >
            <div className="flex items-center gap-2.5 text-sm text-(--text-secondary)">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCheck className="h-3.5 w-3.5 text-brand-success" />
              </div>
              <span>
                <span className="font-semibold text-(--text-primary)">
                  {completedCount}
                </span>{" "}
                tugas selesai
              </span>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-danger hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
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

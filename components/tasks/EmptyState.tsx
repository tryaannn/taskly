"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";

interface EmptyStateProps {
  onAdd: () => void;
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export function EmptyState({
  onAdd,
  isFiltered = false,
  onClearFilter,
}: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mb-4 h-14 w-14 rounded-full bg-brand-surface flex items-center justify-center"
        >
          <Search className="h-7 w-7 text-brand-muted" />
        </motion.div>
        <h3 className="text-base font-semibold text-brand-black mb-1">
          Tidak ada hasil
        </h3>
        <p className="text-sm text-brand-muted mb-5">
          Coba ubah filter atau kata kunci pencarian.
        </p>
        <Button variant="secondary" size="sm" onClick={onClearFilter}>
          Reset filter
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="mb-6"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="14"
            y="10"
            width="52"
            height="64"
            rx="6"
            fill="#F8F9FA"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          <rect x="24" y="24" width="32" height="4" rx="2" fill="#E5E7EB" />
          <rect x="24" y="34" width="24" height="4" rx="2" fill="#E5E7EB" />
          <rect x="24" y="44" width="28" height="4" rx="2" fill="#E5E7EB" />
          <circle cx="20" cy="26" r="3" fill="#E5E7EB" />
          <circle cx="20" cy="36" r="3" fill="#E5E7EB" />
          <circle cx="20" cy="46" r="3" fill="#E5E7EB" />
          <rect
            x="28"
            y="4"
            width="24"
            height="12"
            rx="4"
            fill="white"
            stroke="#E5E7EB"
            strokeWidth="2"
          />
          <rect x="34" y="8" width="12" height="4" rx="2" fill="#D1D5DB" />
        </svg>
      </motion.div>

      <h3 className="text-lg font-semibold text-brand-black mb-1">
        Belum ada tugas
      </h3>
      <p className="text-sm text-brand-muted mb-6">Mulai tambahkan sesuatu!</p>

      <Button onClick={onAdd} size="md">
        + Tambah Tugas Pertama
      </Button>
    </div>
  );
}

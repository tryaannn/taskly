"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Search, SlidersHorizontal } from "lucide-react";

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
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mb-4 h-14 w-14 rounded-2xl bg-(--bg-surface) border border-(--border-default) flex items-center justify-center"
        >
          <SlidersHorizontal className="h-6 w-6 text-(--text-secondary)" />
        </motion.div>
        <h3 className="text-base font-semibold text-(--text-primary) mb-1">
          Tidak ada hasil
        </h3>
        <p className="text-sm text-(--text-secondary) mb-5 max-w-xs">
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
        className="mb-6 animate-float"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="pg"
              x1="0"
              y1="0"
              x2="96"
              y2="96"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient
              id="dg"
              x1="0"
              y1="0"
              x2="96"
              y2="96"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          {/* Main clipboard body */}
          <rect
            x="16"
            y="14"
            width="64"
            height="74"
            rx="8"
            fill="url(#pg)"
            stroke="#e5e7eb"
            strokeWidth="1.5"
          />

          {/* Clip at top */}
          <rect
            x="34"
            y="6"
            width="28"
            height="14"
            rx="5"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1.5"
          />
          <rect x="40" y="10" width="16" height="6" rx="3" fill="#dbeafe" />

          {/* Lines / tasks */}
          <rect
            x="26"
            y="32"
            width="12"
            height="5"
            rx="2.5"
            fill="url(#dg)"
            opacity="0.7"
          />
          <rect x="42" y="32" width="30" height="5" rx="2.5" fill="#e5e7eb" />

          <rect x="26" y="44" width="12" height="5" rx="2.5" fill="#e5e7eb" />
          <rect x="42" y="44" width="22" height="5" rx="2.5" fill="#e5e7eb" />

          <rect x="26" y="56" width="12" height="5" rx="2.5" fill="#e5e7eb" />
          <rect x="42" y="56" width="26" height="5" rx="2.5" fill="#e5e7eb" />

          {/* Plus badge */}
          <circle cx="72" cy="72" r="14" fill="url(#dg)" />
          <line
            x1="72"
            y1="66"
            x2="72"
            y2="78"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="66"
            y1="72"
            x2="78"
            y2="72"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-(--text-primary) mb-1">
          Belum ada tugas
        </h3>
        <p className="text-sm text-(--text-secondary) mb-6">
          Mulai tambahkan sesuatu untuk dilacak!
        </p>
        <Button onClick={onAdd} size="md">
          + Tambah Tugas Pertama
        </Button>
      </motion.div>
    </div>
  );
}

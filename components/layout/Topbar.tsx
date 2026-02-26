"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  LogOut,
  Search,
  ChevronDown,
  Settings,
  X,
  User,
  Mail,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AuthSession } from "@/types";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface TopbarProps {
  session: AuthSession;
  search: string;
  onSearchChange: (v: string) => void;
  onLogout: () => void;
}

export function Topbar({
  session,
  search,
  onSearchChange,
  onLogout,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close settings panel on Escape
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [settingsOpen]);

  const initials = getInitials(session.name);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 h-16",
          "glass border-b border-(--border-default)",
          "flex items-center px-4 sm:px-6 gap-4"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative h-7 w-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-violet-600 shadow-sm">
            <span className="text-white font-black text-xs tracking-tight">
              T
            </span>
          </div>
          <span className="text-base font-bold tracking-tight text-(--text-primary) hidden sm:block">
            Taskly
          </span>
        </div>

        {/* Search — desktop */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block">
          <motion.div
            animate={{
              boxShadow: searchFocused
                ? "0 0 0 3px rgba(37,99,235,0.15)"
                : "0 0 0 0px transparent",
            }}
            transition={{ duration: 0.18 }}
            className={cn(
              "relative rounded-lg transition-colors duration-150",
              searchFocused
                ? "ring-1 ring-brand-blue"
                : "ring-1 ring-(--border-default)"
            )}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--text-secondary)" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Cari tugas..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-(--bg-card) text-sm text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none transition-all"
            />
          </motion.div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setDropdownOpen(false);
              }}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg transition-colors",
                notifOpen
                  ? "bg-(--bg-surface) text-(--text-primary)"
                  : "hover:bg-(--bg-surface) text-(--text-secondary)"
              )}
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "absolute right-0 top-11 w-72 z-50",
                    "glass rounded-xl border border-(--border-default) shadow-xl overflow-hidden"
                  )}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-default)">
                    <span className="text-sm font-semibold text-(--text-primary)">
                      Notifikasi
                    </span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                      aria-label="Tutup notifikasi"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-(--bg-surface) border border-(--border-default) flex items-center justify-center">
                      <Bell className="h-4 w-4 text-(--text-secondary)" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--text-primary)">
                        Belum ada notifikasi
                      </p>
                      <p className="text-xs text-(--text-secondary) mt-0.5">
                        Kamu sudah up-to-date!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => {
                setDropdownOpen((v) => !v);
                setNotifOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-xl transition-colors",
                "hover:bg-(--bg-surface)"
              )}
            >
              {/* Avatar */}
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-blue to-violet-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm">
                {initials}
              </div>
              <span className="hidden md:block text-sm font-medium text-(--text-primary) max-w-[8rem] truncate">
                {session.name}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-(--text-secondary) transition-transform duration-200",
                  dropdownOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "absolute right-0 top-11 w-56 z-50",
                    "glass rounded-xl border border-(--border-default) shadow-xl overflow-hidden"
                  )}
                >
                  {/* User header */}
                  <div className="px-4 py-3 border-b border-(--border-default) flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-blue to-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-(--text-primary) truncate">
                        {session.name}
                      </p>
                      <p className="text-xs text-(--text-secondary) truncate">
                        {session.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-surface) hover:text-(--text-primary) transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Pengaturan
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-brand-danger hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Keluar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Settings Side Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setSettingsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="settings-panel"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-(--bg-card) border-l border-(--border-default) shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-default)">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-(--text-secondary)" />
                  <h2 className="text-base font-semibold text-(--text-primary)">
                    Pengaturan
                  </h2>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-(--bg-surface) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                  aria-label="Tutup pengaturan"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Account */}
                <section className="space-y-3">
                  <p className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Akun
                  </p>
                  <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) divide-y divide-(--border-default)">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="h-8 w-8 rounded-lg bg-(--bg-card) border border-(--border-default) flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5 text-(--text-secondary)" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-(--text-secondary) uppercase font-semibold tracking-wide">
                          Nama
                        </p>
                        <p className="text-sm text-(--text-primary) font-medium truncate">
                          {session.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="h-8 w-8 rounded-lg bg-(--bg-card) border border-(--border-default) flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-(--text-secondary)" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-(--text-secondary) uppercase font-semibold tracking-wide">
                          Email
                        </p>
                        <p className="text-sm text-(--text-primary) font-medium truncate">
                          {session.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Appearance */}
                <section className="space-y-3">
                  <p className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Tampilan
                  </p>
                  <div className="rounded-xl border border-(--border-default) bg-(--bg-surface)">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-(--bg-card) border border-(--border-default) flex items-center justify-center shrink-0">
                          <Moon className="h-3.5 w-3.5 text-(--text-secondary)" />
                        </div>
                        <div>
                          <p className="text-sm text-(--text-primary) font-medium">
                            Mode Gelap
                          </p>
                          <p className="text-xs text-(--text-secondary)">
                            Ubah tema tampilan
                          </p>
                        </div>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>
                </section>

                {/* About */}
                <section className="space-y-3">
                  <p className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Tentang
                  </p>
                  <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded-md bg-gradient-to-br from-brand-blue to-violet-600 flex items-center justify-center">
                        <span className="text-white font-black text-[10px]">T</span>
                      </div>
                      <p className="text-sm font-semibold text-(--text-primary)">Taskly</p>
                    </div>
                    <p className="text-xs text-(--text-secondary)">
                      Aplikasi manajemen tugas produktif berbasis cloud.
                    </p>
                    <p className="text-[10px] text-(--text-secondary) mt-1.5 font-mono">
                      v1.0.0
                    </p>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-(--border-default)">
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium text-brand-danger hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-red-200 dark:border-red-900"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar dari akun
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

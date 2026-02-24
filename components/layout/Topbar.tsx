"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Search, ChevronDown, Settings } from "lucide-react";
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
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const initials = getInitials(session.name);

  return (
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

        <button
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-(--bg-surface) transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-(--text-secondary)" />
        </button>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
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
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-surface) transition-colors">
                    <Settings className="h-3.5 w-3.5 text-(--text-secondary)" />
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
  );
}

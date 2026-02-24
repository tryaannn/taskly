"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Search, ChevronDown } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-brand-border flex items-center px-6 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="h-2 w-2 rounded-full bg-brand-blue" />
        <span className="text-lg font-bold tracking-tight text-brand-black font-sans">
          Taskly
        </span>
      </div>

      {/* Search — desktop */}
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-brand-border bg-brand-surface text-sm text-brand-black placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Dark mode toggle */}
        <ThemeToggle />

        {/* Bell */}
        <button
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-brand-surface transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5 text-brand-muted" />
        </button>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg hover:bg-brand-surface transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-brand-black text-white flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(session.name)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-brand-black max-w-30 truncate">
              {session.name}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-brand-muted transition-transform duration-150",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white border border-brand-border rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2.5 border-b border-brand-border">
                <p className="text-sm font-medium text-brand-black truncate">
                  {session.name}
                </p>
                <p className="text-xs text-brand-muted truncate">
                  {session.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-danger hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

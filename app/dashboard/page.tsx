"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/hooks/useToast";
import { useKeyboard } from "@/hooks/useKeyboard";
import { Topbar } from "@/components/layout/Topbar";
import { StatsCard } from "@/components/ui/StatsCard";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { FilterBar } from "@/components/tasks/FilterBar";
import { TaskList } from "@/components/tasks/TaskList";
import { BulkActions } from "@/components/tasks/BulkActions";
import { ToastContainer } from "@/components/ui/Toast";
import { getGreeting, getFullDate } from "@/lib/utils";
import type { Priority } from "@/types";
import type { AddTaskOptions } from "@/lib/tasks";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { session, loading, handleLogout } = useAuth();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    filteredTasks,
    stats,
    counts,
    categories,
    filter,
    setFilter,
    sort,
    setSort,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    addTask,
    deleteTask,
    deleteCompleted,
    toggleTask,
    editTask,
  } = useTasks(session?.userId);

  // Keyboard shortcuts
  useKeyboard({
    n: () => inputRef.current?.focus(),
    escape: () => {
      if (search) setSearch("");
      setCategoryFilter("");
      setFilter("all");
    },
  });

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [session, loading, router]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-brand-muted">Memuat...</span>
        </div>
      </div>
    );
  }

  const handleAdd = (opts: AddTaskOptions) => {
    addTask(opts);
    addToast("\u2705 Tugas berhasil ditambahkan");
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    addToast("\uD83D\uDDD1\uFE0F Tugas dihapus", "info");
  };

  const handleToggle = (id: string) => {
    toggleTask(id);
    addToast("\u2714\uFE0F Status tugas diperbarui", "success");
  };

  const handleEdit = (
    id: string,
    text: string,
    priority: Priority,
    dueDate?: string,
    category?: string
  ) => {
    editTask(id, text, priority, dueDate, category);
    addToast("\u270F\uFE0F Tugas diperbarui", "success");
  };

  const handleDeleteCompleted = () => {
    const n = deleteCompleted();
    addToast(`\uD83D\uDDD1\uFE0F ${n} tugas selesai dihapus`, "info");
  };

  const focusInput = () => inputRef.current?.focus();

  const activeCount = stats.active;
  const greeting = getGreeting();
  const fullDate = getFullDate();

  return (
    <div className="min-h-screen bg-white">
      <Topbar
        session={session}
        search={search}
        onSearchChange={setSearch}
        onLogout={handleLogout}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Header */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-1"
        >
          <motion.p variants={fadeUp} className="text-sm text-brand-muted">
            Selamat {greeting},
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-3xl font-bold text-brand-black"
          >
            {session.name.split(" ")[0]}{" "}
            <span className="text-brand-blue">👋</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-sm text-brand-muted">
            {fullDate}
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="text-sm text-brand-black font-medium pt-1"
          >
            {activeCount === 0
              ? "Semua tugas selesai! Luar biasa 🎉"
              : `Kamu punya ${activeCount} tugas yang perlu diselesaikan.`}
            {stats.overdue > 0 && (
              <span className="text-brand-danger ml-1">
                ({stats.overdue} terlambat!)
              </span>
            )}
          </motion.p>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex gap-3 flex-wrap sm:flex-nowrap"
        >
          <StatsCard
            label="Total Tugas"
            value={stats.total}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <StatsCard
            label="Selesai"
            value={stats.completed}
            icon={<CheckCircle className="h-5 w-5" />}
            colorClass="text-brand-success"
          />
          <StatsCard
            label="Aktif"
            value={stats.active}
            icon={<Clock className="h-5 w-5" />}
            colorClass="text-brand-blue"
          />
          <StatsCard
            label="Prioritas Tinggi"
            value={stats.highPriority}
            icon={<AlertCircle className="h-5 w-5" />}
            colorClass="text-brand-danger"
          />
          <StatsCard
            label="Terlambat"
            value={stats.overdue}
            icon={<AlertTriangle className="h-5 w-5" />}
            colorClass="text-brand-warning"
          />
        </motion.section>

        {/* Add Task */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <AddTaskForm
            onAdd={handleAdd}
            categories={categories}
            inputRef={inputRef}
          />
        </motion.section>

        {/* Filter Bar */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <FilterBar
            filter={filter}
            sort={sort}
            counts={counts}
            categories={categories}
            categoryFilter={categoryFilter}
            onFilterChange={setFilter}
            onSortChange={setSort}
            onCategoryChange={setCategoryFilter}
          />
        </motion.section>

        {/* Bulk actions */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <BulkActions
            completedCount={stats.completed}
            onDeleteCompleted={handleDeleteCompleted}
          />
        </motion.section>

        {/* Task List */}
        <section>
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddFirst={focusInput}
            isFiltered={filter !== "all" || !!search || !!categoryFilter}
            onClearFilter={() => {
              setFilter("all");
              setSearch("");
              setCategoryFilter("");
            }}
          />
        </section>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

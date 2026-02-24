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
  hidden: { opacity: 0, y: 14 },
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
    loading: tasksLoading,
  } = useTasks(session?.userId);

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
      <div className="min-h-screen flex items-center justify-center bg-(--bg-page)">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="h-12 w-12 rounded-full border-2 border-(--border-default)" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-brand-blue animate-spin" />
          </div>
          <span className="text-sm font-medium text-(--text-secondary)">
            Memuat...
          </span>
        </div>
      </div>
    );
  }

  const handleAdd = async (opts: AddTaskOptions) => {
    await addTask(opts);
    addToast("Tugas berhasil ditambahkan", "success");
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    addToast("Tugas dihapus", "info");
  };

  const handleToggle = async (id: string) => {
    await toggleTask(id);
    addToast("Status tugas diperbarui", "success");
  };

  const handleEdit = async (
    id: string,
    text: string,
    priority: Priority,
    dueDate?: string,
    category?: string
  ) => {
    await editTask(id, text, priority, dueDate, category);
    addToast("Tugas diperbarui", "success");
  };

  const handleDeleteCompleted = async () => {
    const n = await deleteCompleted();
    addToast(`${n} tugas selesai dihapus`, "info");
  };

  const focusInput = () => inputRef.current?.focus();

  const activeCount = stats.active;
  const completionPct =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const greeting = getGreeting();
  const fullDate = getFullDate();
  const firstName = session.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <Topbar
        session={session}
        search={search}
        onSearchChange={setSearch}
        onLogout={handleLogout}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero Header */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-1"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm text-(--text-secondary)"
          >
            {greeting},
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-3xl font-bold text-(--text-primary) flex items-center gap-2"
          >
            <span className="gradient-text">{firstName}</span>
            <span>👋</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-xs text-(--text-secondary)"
          >
            {fullDate}
          </motion.p>

          {/* Summary + progress */}
          <motion.div variants={fadeUp} className="pt-2 space-y-2">
            <p className="text-sm text-(--text-secondary) font-medium">
              {activeCount === 0
                ? "Semua tugas selesai! Luar biasa 🎉"
                : `${activeCount} tugas perlu diselesaikan.`}
              {stats.overdue > 0 && (
                <span className="text-brand-danger ml-1.5 font-semibold">
                  {stats.overdue} terlambat!
                </span>
              )}
            </p>
            {stats.total > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-(--border-default) overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full bg-linear-to-r from-brand-blue to-violet-500"
                  />
                </div>
                <p className="text-[11px] text-(--text-secondary)">
                  {completionPct}% selesai
                </p>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 sm:flex gap-2.5 sm:flex-nowrap"
        >
          <StatsCard
            label="Total"
            value={stats.total}
            icon={<ClipboardList className="h-4 w-4" />}
            iconBgClass="bg-gray-100 dark:bg-white/10"
          />
          <StatsCard
            label="Selesai"
            value={stats.completed}
            icon={<CheckCircle className="h-4 w-4" />}
            colorClass="text-brand-success"
            iconBgClass="bg-emerald-50 dark:bg-emerald-950/40"
          />
          <StatsCard
            label="Aktif"
            value={stats.active}
            icon={<Clock className="h-4 w-4" />}
            colorClass="text-brand-blue"
            iconBgClass="bg-blue-50 dark:bg-blue-950/40"
          />
          <StatsCard
            label="Prioritas"
            value={stats.highPriority}
            icon={<AlertCircle className="h-4 w-4" />}
            colorClass="text-brand-danger"
            iconBgClass="bg-red-50 dark:bg-red-950/40"
          />
          <StatsCard
            label="Terlambat"
            value={stats.overdue}
            icon={<AlertTriangle className="h-4 w-4" />}
            colorClass="text-brand-warning"
            iconBgClass="bg-amber-50 dark:bg-amber-950/40"
          />
        </motion.section>

        {/* Add Task */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
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
          transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.45 }}
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

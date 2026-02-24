export function cn(
  ...classes: (string | undefined | null | false | 0 | 0n)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/** Cryptographically secure ID — uses crypto.randomUUID() with a fallback */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without randomUUID
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

/**
 * Hash a string using SHA-256 (browser SubtleCrypto).
 * Returns hex digest string. Must be awaited.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDueDate(isoString: string): {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueSoon: boolean;
} {
  const due = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round(
    (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isDueSoon = diffDays > 0 && diffDays <= 2;

  let label: string;
  if (isOverdue) {
    label = `Terlambat ${Math.abs(diffDays)}h`;
  } else if (isDueToday) {
    label = "Hari ini";
  } else if (diffDays === 1) {
    label = "Besok";
  } else {
    label = formatDate(isoString);
  }

  return { label, isOverdue, isDueToday, isDueSoon };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "pagi";
  if (hour < 15) return "siang";
  if (hour < 18) return "sore";
  return "malam";
}

export function getFullDate(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function isOverdue(dueDate: string | undefined): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
}

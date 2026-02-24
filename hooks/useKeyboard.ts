import { useEffect, useCallback } from "react";

type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

/**
 * Register keyboard shortcuts.
 * Keys are modifier-prefixed strings like "n", "escape", "ctrl+k".
 * Handlers are NOT called when focus is inside an input/textarea/select.
 */
export function useKeyboard(shortcuts: ShortcutMap, active = true) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!active) return;

      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      const key = buildKey(e);

      // Always allow Escape even inside inputs
      if (key !== "escape" && isEditable) return;

      const fn = shortcuts[key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, ...Object.keys(shortcuts), ...Object.values(shortcuts)]
  );

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}

function buildKey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push("ctrl");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  parts.push(e.key.toLowerCase());
  return parts.join("+");
}

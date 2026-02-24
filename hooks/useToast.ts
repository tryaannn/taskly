"use client";

import { useState, useCallback } from "react";
import type { ToastMessage } from "@/types";
import { generateId } from "@/lib/utils";

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastMessage["type"] = "success") => {
      const id = generateId();
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        return next.slice(-3); // max 3
      });
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

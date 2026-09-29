"use client";

import { useSyncExternalStore } from "react";

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

let current: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Show a short message at the bottom of the screen, optionally with an action like "Undo". */
export function showToast(message: string, action?: Toast["action"]) {
  clearTimeout(timer);
  current = { id: Date.now(), message, action };
  emit();
  timer = setTimeout(dismissToast, action ? 5000 : 2500);
}

export function dismissToast() {
  clearTimeout(timer);
  current = null;
  emit();
}

export function useToast(): Toast | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}

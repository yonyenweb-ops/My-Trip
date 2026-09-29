"use client";

import { useSyncExternalStore } from "react";
import { THEME_COLORS, THEME_KEY } from "./theme-script";

/** "system" follows the phone's light/dark setting. The default is "light". */
export type Theme = "light" | "dark" | "system";

const listeners = new Set<() => void>();

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  const root = document.documentElement;
  root.dataset.theme = theme;
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = dark ? THEME_COLORS.dark : THEME_COLORS.light;
  listeners.forEach((l) => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => (document.documentElement.dataset.theme as Theme) || "light",
    () => "light",
  );
}

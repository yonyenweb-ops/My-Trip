"use client";

import { setTheme, useTheme, type Theme } from "@/lib/theme";
import { AutoIcon, MoonIcon, SunIcon } from "./Icons";

const OPTIONS: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "Auto", Icon: AutoIcon },
];

/** Light / Dark / Auto (follow the phone) appearance switch. */
export function ThemeSwitcher() {
  const theme = useTheme();
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-1 rounded-2xl bg-soft p-1">
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors ${
              selected ? "bg-card text-brand-text shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { dismissToast, useToast } from "@/lib/toast";
import { CheckIcon } from "./Icons";

export function Toaster() {
  const toast = useToast();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(9.5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center md:inset-x-auto md:right-8 md:bottom-8"
    >
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-slate-900 py-2 pr-2 pl-4 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
        >
          <CheckIcon size={18} className="shrink-0 text-emerald-400 dark:text-emerald-600" />
          <span className="min-w-0 flex-1 py-1.5">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                dismissToast();
              }}
              className="min-h-9 rounded-xl px-3 font-semibold text-emerald-300 hover:bg-white/10 dark:text-emerald-700 dark:hover:bg-black/5"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

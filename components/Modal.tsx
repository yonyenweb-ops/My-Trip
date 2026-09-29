"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "./Icons";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Stop the page behind the sheet from scrolling.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-line bg-card px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

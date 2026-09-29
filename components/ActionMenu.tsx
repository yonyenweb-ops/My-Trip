"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { MoreIcon } from "./Icons";

export type MenuItem = {
  label: string;
  Icon?: ComponentType<{ size?: number }>;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
};

/** A ⋮ button that opens a small menu of actions. */
export function ActionMenu({ items, label = "More actions" }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass = (danger?: boolean) =>
    `flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold transition-colors ${
      danger ? "text-danger hover:bg-danger-soft" : "text-ink hover:bg-soft"
    }`;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors ${
          open ? "bg-soft text-ink" : "bg-card text-muted hover:bg-soft hover:text-ink"
        }`}
      >
        <MoreIcon size={20} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-13 right-0 z-50 w-60 rounded-2xl border border-line bg-card p-1.5 shadow-xl shadow-black/10"
        >
          {items.map(({ label, Icon, href, onClick, danger }) => {
            const content = (
              <>
                {Icon && <Icon size={19} />}
                {label}
              </>
            );
            return (
              <div key={label} className={danger ? "mt-1 border-t border-line pt-1" : ""}>
                {href ? (
                  <Link href={href} role="menuitem" className={itemClass(danger)} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className={itemClass(danger)}
                    onClick={() => {
                      setOpen(false);
                      onClick?.();
                    }}
                  >
                    {content}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

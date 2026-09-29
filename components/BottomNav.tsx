"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavActive } from "./NavLinks";

/** Phone navigation, pinned to the bottom for one-handed use. Hidden on tablet/desktop. */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isNavActive(href, path);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
                  active ? "text-brand-text" : "text-muted"
                }`}
              >
                <span className={`flex h-7 w-14 items-center justify-center rounded-full ${active ? "bg-brand-soft" : ""}`}>
                  <Icon size={21} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusIcon } from "./Icons";
import { NAV_ITEMS, isNavActive } from "./NavLinks";
import { ThemeSwitcher } from "./ThemeSwitcher";

/** Tablet/desktop navigation on the left. Hidden on phones. */
export function SideNav() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-card px-4 py-6 md:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={36} height={36} className="h-9 w-9 rounded-xl" />
        <span className="text-lg font-bold tracking-tight">Trip Money</span>
      </Link>

      <Link href="/trips/new" className="btn-primary mb-6">
        <PlusIcon size={18} /> New Trip
      </Link>

      <nav>
        <ul className="space-y-1">
          {NAV_ITEMS.filter((i) => i.href !== "/trips/new").map(({ href, label, Icon }) => {
            const active = isNavActive(href, path);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 items-center gap-3 rounded-xl px-3 font-semibold transition-colors ${
                    active ? "bg-brand-soft text-brand-text" : "text-muted hover:bg-soft hover:text-ink"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto space-y-3">
        <div>
          <div className="mb-2 px-2 text-xs font-semibold tracking-wide text-faint uppercase">Appearance</div>
          <ThemeSwitcher />
        </div>
        <p className="px-2 text-xs leading-relaxed text-faint">Your trips are saved on this device only.</p>
      </div>
    </aside>
  );
}

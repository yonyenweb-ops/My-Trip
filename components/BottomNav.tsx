"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/trips", label: "My Trips", icon: "🧳" },
  { href: "/trips/new", label: "New Trip", icon: "➕" },
];

export function BottomNav() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/trips" ? path === "/trips" || (path.startsWith("/trips/") && path !== "/trips/new") : path === href;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-3">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                  active ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import { HomeIcon, PlusIcon, TripsIcon } from "./Icons";

export const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/trips", label: "My Trips", Icon: TripsIcon },
  { href: "/trips/new", label: "New Trip", Icon: PlusIcon },
];

/** "My Trips" stays highlighted on any trip page except the new-trip form. */
export function isNavActive(href: string, path: string): boolean {
  if (href === "/trips") return path === "/trips" || (path.startsWith("/trips/") && path !== "/trips/new");
  return path === href;
}

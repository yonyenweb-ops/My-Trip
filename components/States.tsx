import Link from "next/link";

/** Placeholder shapes while localStorage is read, so the page doesn't jump. */
export function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Loading" role="status">
      <div className="h-8 w-48 rounded-xl bg-soft" />
      <div className="h-44 rounded-3xl bg-soft" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-3xl bg-soft" />
        <div className="h-20 rounded-3xl bg-soft" />
      </div>
    </div>
  );
}

export function TripNotFound() {
  return (
    <div className="py-16 text-center">
      <p className="mb-4 text-lg font-semibold">Trip not found</p>
      <Link href="/trips" className="btn-secondary">
        Back to My Trips
      </Link>
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="btn-ghost -ml-3 mb-2">
      <span aria-hidden>←</span> {label}
    </Link>
  );
}

import Link from "next/link";

export function Loading() {
  return <p className="py-20 text-center text-slate-400">Loading…</p>;
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

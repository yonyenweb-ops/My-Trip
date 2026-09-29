"use client";

import Link from "next/link";
import { Loading } from "@/components/States";
import { TripCard } from "@/components/TripCard";
import { tripExpenses } from "@/lib/calc";
import { useAppData } from "@/lib/storage";

export default function TripsPage() {
  const data = useAppData();
  if (!data) return <Loading />;

  // Active trips first, then newest first.
  const trips = [...data.trips].sort(
    (a, b) => (a.status === b.status ? b.createdAt.localeCompare(a.createdAt) : a.status === "active" ? -1 : 1),
  );

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <Link href="/trips/new" className="btn-primary">
          + New Trip
        </Link>
      </header>

      {trips.length === 0 ? (
        <p className="rounded-3xl bg-white py-12 text-center text-slate-500">No trips yet. Create your first one!</p>
      ) : (
        <ul className="space-y-3">
          {trips.map((t) => (
            <li key={t.id}>
              <TripCard trip={t} expenses={tripExpenses(data, t.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loading, TripNotFound } from "@/components/States";
import { TripSummary } from "@/components/TripSummary";
import { useTrip } from "@/lib/useTrip";

export default function TripSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const state = useTrip(id);

  if (state.loading) return <Loading />;
  const { trip, expenses } = state;
  if (!trip) return <TripNotFound />;

  return (
    <div className="space-y-5">
      <Link href={`/trips/${trip.id}`} className="inline-block py-1 text-sm font-semibold text-slate-500">
        ← Trip details
      </Link>
      <TripSummary trip={trip} expenses={expenses} />
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/trips/${trip.id}`} className="btn-secondary">
          All Expenses
        </Link>
        <Link href="/trips/new" className="btn-primary">
          + New Trip
        </Link>
      </div>
    </div>
  );
}

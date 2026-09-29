"use client";

import Link from "next/link";
import { PlusIcon } from "@/components/Icons";
import { Loading } from "@/components/States";
import { TripCard } from "@/components/TripCard";
import { tripExpenses } from "@/lib/calc";
import { useAppData } from "@/lib/storage";
import type { AppData, Trip } from "@/lib/types";

function TripGrid({ title, trips, data }: { title: string; trips: Trip[]; data: AppData }) {
  if (trips.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
        {title} <span className="text-faint">· {trips.length}</span>
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {trips.map((t) => (
          <li key={t.id}>
            <TripCard trip={t} expenses={tripExpenses(data, t.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function TripsPage() {
  const data = useAppData();
  if (!data) return <Loading />;

  const newestFirst = [...data.trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const active = newestFirst.filter((t) => t.status === "active");
  const completed = newestFirst.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Trips</h1>
        <Link href="/trips/new" className="btn-primary md:hidden">
          <PlusIcon size={18} /> New Trip
        </Link>
      </header>

      {data.trips.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="text-5xl" aria-hidden>
            🗺️
          </span>
          <p className="mt-4 text-lg font-semibold">No trips yet</p>
          <p className="mt-1 text-muted">Create your first trip to start tracking.</p>
          <Link href="/trips/new" className="btn-primary mt-6">
            <PlusIcon size={18} /> New Trip
          </Link>
        </div>
      ) : (
        <>
          <TripGrid title="Active" trips={active} data={data} />
          <TripGrid title="Completed" trips={completed} data={data} />
        </>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { ExpenseList } from "@/components/ExpenseList";
import { Loading } from "@/components/States";
import { TripOverview } from "@/components/TripOverview";
import { currentTrip, tripExpenses } from "@/lib/calc";
import { formatDateRange } from "@/lib/dates";
import { useAppData } from "@/lib/storage";

export default function DashboardPage() {
  const data = useAppData();
  if (!data) return <Loading />;

  const trip = currentTrip(data);
  if (!trip) {
    return (
      <div className="py-16 text-center">
        <div className="text-6xl" aria-hidden>
          🧳
        </div>
        <h1 className="mt-4 text-2xl font-bold">No active trip</h1>
        <p className="mt-2 text-slate-500">Create a trip, enter your starting money, and start recording expenses.</p>
        <Link href="/trips/new" className="btn-primary mt-6 h-14 w-full text-lg">
          + New Trip
        </Link>
        {data.trips.length > 0 && (
          <Link href="/trips" className="btn-secondary mt-3 w-full">
            View past trips
          </Link>
        )}
      </div>
    );
  }

  const expenses = tripExpenses(data, trip.id);
  const otherActive = data.trips.filter((t) => t.status === "active" && t.id !== trip.id).length;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">Current trip</p>
          <h1 className="truncate text-2xl font-bold">{trip.name}</h1>
          <p className="text-sm text-slate-500">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <Link href={`/trips/${trip.id}`} className="shrink-0 py-2 text-sm font-semibold text-emerald-700">
          Details →
        </Link>
      </header>

      <TripOverview trip={trip} expenses={expenses} />

      <AddExpenseButton tripId={trip.id} />

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-semibold">Recent expenses</h2>
          {expenses.length > 5 && (
            <Link href={`/trips/${trip.id}`} className="text-sm font-semibold text-emerald-700">
              See all {expenses.length}
            </Link>
          )}
        </div>
        <ExpenseList expenses={expenses} editable limit={5} />
      </section>

      {otherActive > 0 && (
        <p className="text-center text-sm text-slate-500">
          You have {otherActive} other active {otherActive === 1 ? "trip" : "trips"}.{" "}
          <Link href="/trips" className="font-semibold text-emerald-700">
            View all
          </Link>
        </p>
      )}
    </div>
  );
}

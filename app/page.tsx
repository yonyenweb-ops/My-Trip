"use client";

import Link from "next/link";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { ExpenseList } from "@/components/ExpenseList";
import { PlusIcon } from "@/components/Icons";
import { Loading } from "@/components/States";
import { TripOverview } from "@/components/TripOverview";
import { currentTrip, tripExpenses } from "@/lib/calc";
import { formatDateRange } from "@/lib/dates";
import { useAppData } from "@/lib/storage";

const RECENT = 6;

export default function DashboardPage() {
  const data = useAppData();
  if (!data) return <Loading />;

  const trip = currentTrip(data);
  if (!trip) {
    return (
      <div className="mx-auto max-w-md py-12 text-center md:py-20">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-brand-soft text-5xl" aria-hidden>
          🧳
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">No active trip</h1>
        <p className="mt-2 text-muted">Create a trip, enter your starting money, and start recording expenses.</p>
        <Link href="/trips/new" className="btn-primary mt-8 h-14 w-full text-lg">
          <PlusIcon size={22} /> New Trip
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
    <>
      <header className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">Current trip</p>
          <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">{trip.name}</h1>
          <p className="text-sm text-muted">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <Link href={`/trips/${trip.id}`} className="btn-ghost -mr-2 shrink-0 text-brand-text">
          Details →
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="lg:sticky lg:top-8">
          <TripOverview trip={trip} expenses={expenses} action={<AddExpenseButton tripId={trip.id} variant="inline" />} />
        </div>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="section-title">Recent expenses</h2>
            {expenses.length > RECENT && (
              <Link href={`/trips/${trip.id}`} className="text-sm font-semibold text-brand-text">
                See all {expenses.length}
              </Link>
            )}
          </div>
          <ExpenseList expenses={expenses} editable limit={RECENT} />

          {otherActive > 0 && (
            <p className="mt-6 text-center text-sm text-muted">
              You have {otherActive} other active {otherActive === 1 ? "trip" : "trips"}.{" "}
              <Link href="/trips" className="font-semibold text-brand-text">
                View all
              </Link>
            </p>
          )}
        </section>
      </div>

      {/* Leaves room so the floating button never covers the last expense on phones. */}
      <div className="h-20 md:hidden" aria-hidden />
      <AddExpenseButton tripId={trip.id} variant="floating" />
    </>
  );
}

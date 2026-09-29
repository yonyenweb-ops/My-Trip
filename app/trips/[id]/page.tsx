"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExpenseList } from "@/components/ExpenseList";
import { Loading, TripNotFound } from "@/components/States";
import { StatusBadge } from "@/components/TripCard";
import { TripOverview } from "@/components/TripOverview";
import { formatDateRange } from "@/lib/dates";
import { closeTrip, deleteTrip, reopenTrip } from "@/lib/storage";
import { useTrip } from "@/lib/useTrip";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const state = useTrip(id);
  const [confirm, setConfirm] = useState<"close" | "delete" | null>(null);

  if (state.loading) return <Loading />;
  const { trip, expenses } = state;
  if (!trip) return <TripNotFound />;
  const active = trip.status === "active";

  return (
    <div className="space-y-5">
      <Link href="/trips" className="inline-block py-1 text-sm font-semibold text-slate-500">
        ← My Trips
      </Link>

      <header>
        <div className="flex items-center gap-2">
          <h1 className="min-w-0 truncate text-2xl font-bold">{trip.name}</h1>
          <StatusBadge status={trip.status} />
        </div>
        <p className="text-sm text-slate-500">{formatDateRange(trip.startDate, trip.endDate)}</p>
        {trip.note && <p className="mt-2 whitespace-pre-line text-slate-600">{trip.note}</p>}
      </header>

      <TripOverview trip={trip} expenses={expenses} />

      {active ? (
        <AddExpenseButton tripId={trip.id} />
      ) : (
        <Link href={`/trips/${trip.id}/summary`} className="btn-primary h-14 w-full text-lg">
          View Trip Summary
        </Link>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Expense history</h2>
        <ExpenseList expenses={expenses} editable={active} />
        {!active && expenses.length > 0 && (
          <p className="mt-2 text-center text-xs text-slate-400">Reopen the trip to edit expenses.</p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 pt-2">
        {active ? (
          <button type="button" onClick={() => setConfirm("close")} className="btn-secondary">
            Close Trip
          </button>
        ) : (
          <button type="button" onClick={() => reopenTrip(trip.id)} className="btn-secondary">
            Reopen Trip
          </button>
        )}
        <button type="button" onClick={() => setConfirm("delete")} className="btn-danger-outline">
          Delete Trip
        </button>
      </section>

      {confirm === "close" && (
        <ConfirmDialog
          title="Close this trip?"
          message="The trip will be marked as completed and you'll see the final summary. You can reopen it later if needed."
          confirmLabel="Close Trip"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            closeTrip(trip.id);
            router.push(`/trips/${trip.id}/summary`);
          }}
        />
      )}
      {confirm === "delete" && (
        <ConfirmDialog
          title="Delete this trip?"
          message={`"${trip.name}" and all ${expenses.length} of its expenses will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            router.replace("/trips");
            deleteTrip(trip.id);
          }}
        />
      )}
    </div>
  );
}

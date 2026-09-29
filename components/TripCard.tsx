import Link from "next/link";
import { tripStats } from "@/lib/calc";
import { formatDateRange } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Expense, Trip } from "@/lib/types";

export function StatusBadge({ status }: { status: Trip["status"] }) {
  return status === "active" ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Active</span>
  ) : (
    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">Completed</span>
  );
}

export function TripCard({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const s = tripStats(trip, expenses);
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block rounded-3xl border border-slate-200 bg-white p-4 active:bg-slate-50 hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{trip.name}</div>
          <div className="text-sm text-slate-500">{formatDateRange(trip.startDate, trip.endDate)}</div>
        </div>
        <StatusBadge status={trip.status} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm tabular-nums">
        <div>
          <dt className="text-slate-500">Budget</dt>
          <dd className="font-semibold">{formatMoney(trip.startingAmount)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Spent</dt>
          <dd className="font-semibold">{formatMoney(s.spent)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Remaining</dt>
          <dd className={`font-semibold ${s.overBudget ? "text-red-600" : "text-emerald-700"}`}>{formatMoney(s.remaining)}</dd>
        </div>
      </dl>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${s.overBudget ? "bg-red-600" : "bg-emerald-600"}`}
          style={{ width: `${Math.min(100, s.percent)}%` }}
        />
      </div>
    </Link>
  );
}

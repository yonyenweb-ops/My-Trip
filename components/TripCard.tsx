import Link from "next/link";
import { tripStats } from "@/lib/calc";
import { formatDateRange } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Expense, Trip } from "@/lib/types";
import { ChevronRightIcon } from "./Icons";

export function StatusBadge({ status }: { status: Trip["status"] }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-text">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      Active
    </span>
  ) : (
    <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold text-muted">Completed</span>
  );
}

export function TripCard({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const s = tripStats(trip, expenses);
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="card group flex h-full flex-col p-4 transition hover:border-brand/40 hover:shadow-sm active:scale-[0.99] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-bold">{trip.name}</div>
          <div className="text-sm text-muted">{formatDateRange(trip.startDate, trip.endDate)}</div>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-muted">{s.overBudget ? "Over budget" : "Remaining"}</div>
          <div className={`text-2xl font-bold tabular-nums ${s.overBudget ? "text-danger" : ""}`}>{formatMoney(s.remaining)}</div>
        </div>
        <ChevronRightIcon size={20} className="mb-1 text-faint transition group-hover:translate-x-0.5" />
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft">
        <div
          className={`h-full rounded-full ${s.overBudget ? "bg-danger" : "bg-brand"}`}
          style={{ width: `${Math.min(100, s.percent)}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted tabular-nums">
        <span>Spent {formatMoney(s.spent)}</span>
        <span>Budget {formatMoney(trip.startingAmount)}</span>
      </div>
    </Link>
  );
}

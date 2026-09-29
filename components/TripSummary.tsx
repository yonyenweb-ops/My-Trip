import { spendingByCategory, tripStats } from "@/lib/calc";
import { getCategory } from "@/lib/categories";
import { formatDate, formatDateRange, todayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Expense, Trip } from "@/lib/types";

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${className}`}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function TripSummary({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const s = tripStats(trip, expenses);
  const byCategory = spendingByCategory(expenses);
  const completed = trip.status === "completed";

  return (
    <article className="space-y-4">
      <header className="text-center">
        <p className="text-sm font-semibold tracking-widest text-slate-400">TRIP SUMMARY</p>
        <h1 className="mt-1 text-2xl font-bold">{trip.name}</h1>
        <p className="text-sm text-slate-500">{formatDateRange(trip.startDate, trip.endDate)}</p>
      </header>

      <dl className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white px-4">
        <Row label="Starting Money" value={formatMoney(trip.startingAmount)} />
        <Row label="Total Spent" value={formatMoney(s.spent)} />
        <Row
          label="Remaining"
          value={formatMoney(s.remaining)}
          className={`text-lg ${s.overBudget ? "text-red-600" : "text-emerald-700"}`}
        />
        <Row label="Total Expenses" value={String(s.count)} />
        <Row label="Budget Used" value={`${s.percent.toFixed(2)}%`} />
      </dl>

      {s.overBudget ? (
        <div className="rounded-2xl bg-red-600 p-4 text-center text-lg font-bold text-white" role="alert">
          ⚠️ OVER BUDGET BY {formatMoney(-s.remaining)}
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-50 p-4 text-center font-semibold text-emerald-800">
          You finished with {formatMoney(s.remaining)} left 🎉
        </div>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Spending by category</h2>
        {byCategory.length === 0 ? (
          <p className="rounded-2xl bg-white py-6 text-center text-slate-500">No expenses recorded</p>
        ) : (
          <ul className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            {byCategory.map(({ category, total }) => {
              const c = getCategory(category);
              const share = s.spent > 0 ? (total / s.spent) * 100 : 0;
              return (
                <li key={category}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span>
                      <span aria-hidden>{c.emoji}</span> {c.name}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatMoney(total)} <span className="text-xs font-normal text-slate-400">{share.toFixed(0)}%</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-500" style={{ width: `${share}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-center text-sm font-semibold text-slate-500">
        Status: {completed ? `Trip completed${trip.closedAt ? ` on ${formatDate(todayDate(new Date(trip.closedAt)))}` : ""}` : "Trip in progress"}
      </p>
    </article>
  );
}

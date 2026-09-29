import { spendingByCategory, tripStats } from "@/lib/calc";
import { getCategory } from "@/lib/categories";
import { formatDate, formatDateRange, todayDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Expense, Trip } from "@/lib/types";

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-3 ${className}`}>
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/** Plain-text version of the summary, for sharing to chat apps. */
export function summaryText(trip: Trip, expenses: Expense[]): string {
  const s = tripStats(trip, expenses);
  const lines = [
    `🧳 ${trip.name}`,
    formatDateRange(trip.startDate, trip.endDate),
    "",
    `Starting money: ${formatMoney(trip.startingAmount)}`,
    `Total spent: ${formatMoney(s.spent)} (${s.count} expenses)`,
    s.overBudget ? `⚠️ Over budget by ${formatMoney(-s.remaining)}` : `Remaining: ${formatMoney(s.remaining)}`,
    `Budget used: ${s.percent.toFixed(2)}%`,
  ];
  const byCategory = spendingByCategory(expenses);
  if (byCategory.length) {
    lines.push("", "By category:");
    for (const { category, total } of byCategory) lines.push(`${getCategory(category).emoji} ${category}: ${formatMoney(total)}`);
  }
  return lines.join("\n");
}

export function TripSummary({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const s = tripStats(trip, expenses);
  const byCategory = spendingByCategory(expenses);
  const completed = trip.status === "completed";

  return (
    <article className="space-y-5">
      <header className="text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-faint">TRIP SUMMARY</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{trip.name}</h1>
        <p className="mt-1 text-sm text-muted">{formatDateRange(trip.startDate, trip.endDate)}</p>
      </header>

      <div
        className={`rounded-[28px] bg-linear-to-br p-6 text-center text-white ${
          s.overBudget ? "from-red-600 to-rose-700" : "from-emerald-600 to-teal-700"
        }`}
      >
        <div className="text-sm font-semibold text-white/85">{s.overBudget ? "⚠️ OVER BUDGET BY" : "Money left"}</div>
        <div className="mt-1 text-5xl font-bold tracking-tight tabular-nums">{formatMoney(Math.abs(s.remaining))}</div>
        <div className="mt-2 text-sm text-white/90">
          {s.overBudget ? `Remaining: ${formatMoney(s.remaining)}` : "You stayed within your budget 🎉"}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <dl className="card divide-y divide-line px-5">
          <Row label="Starting Money" value={formatMoney(trip.startingAmount)} />
          <Row label="Total Spent" value={formatMoney(s.spent)} />
          <Row
            label="Remaining"
            value={formatMoney(s.remaining)}
            className={s.overBudget ? "text-danger" : "text-brand-text"}
          />
          <Row label="Total Expenses" value={String(s.count)} />
          <Row label="Budget Used" value={`${s.percent.toFixed(2)}%`} />
          <Row
            label="Status"
            value={
              completed
                ? `Trip completed${trip.closedAt ? ` · ${formatDate(todayDate(new Date(trip.closedAt)))}` : ""}`
                : "In progress"
            }
          />
        </dl>

        <section className="card p-5">
          <h2 className="section-title mb-4">Spending by category</h2>
          {byCategory.length === 0 ? (
            <p className="py-4 text-center text-muted">No expenses recorded</p>
          ) : (
            <ul className="space-y-4">
              {byCategory.map(({ category, total }) => {
                const c = getCategory(category);
                const share = s.spent > 0 ? (total / s.spent) * 100 : 0;
                return (
                  <li key={category}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">
                        <span aria-hidden>{c.emoji}</span> {c.name}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatMoney(total)} <span className="text-xs font-normal text-faint">{share.toFixed(0)}%</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-soft">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${share}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}

import type { ReactNode } from "react";
import { daysLeft, spentToday, tripStats } from "@/lib/calc";
import { formatMoney } from "@/lib/money";
import type { Expense, Trip } from "@/lib/types";
import { BudgetProgress } from "./BudgetProgress";
import { MoneyCard } from "./MoneyCard";

type Props = {
  trip: Trip;
  expenses: Expense[];
  action?: ReactNode; // e.g. the Add Expense button, shown inside the hero on larger screens
};

/** The hero "money left" card + stat tiles, shared by the dashboard and trip page. */
export function TripOverview({ trip, expenses, action }: Props) {
  const s = tripStats(trip, expenses);
  const today = spentToday(expenses);
  const days = daysLeft(trip);
  const perDay = days && s.remaining > 0 ? Math.floor(s.remaining / days) : null;

  return (
    <section className="space-y-3" aria-label="Budget">
      <div
        className={`rounded-[28px] bg-linear-to-br p-5 text-white shadow-sm sm:p-6 ${
          s.overBudget ? "from-red-600 to-rose-700" : "from-emerald-600 to-teal-700"
        }`}
        role={s.overBudget ? "alert" : undefined}
      >
        <div className="text-sm font-semibold text-white/90">{s.overBudget ? "⚠️ Budget exceeded" : "Money left"}</div>
        <div className="mt-1 mb-4 text-5xl font-bold tracking-tight tabular-nums sm:text-6xl" style={{ overflowWrap: "anywhere" }}>
          {formatMoney(s.remaining)}
        </div>
        <BudgetProgress spent={s.spent} budget={trip.startingAmount} percent={s.percent} />
        <p className={`mt-3 text-sm text-white/95 ${s.overBudget ? "rounded-xl bg-black/15 px-3 py-2 font-semibold" : "font-medium"}`}>
          {s.overBudget
            ? `You have exceeded your trip budget by ${formatMoney(-s.remaining)}`
            : `You have ${formatMoney(s.remaining)} remaining.`}
        </p>
        {action && <div className="mt-5 hidden md:block">{action}</div>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MoneyCard label="Starting Money" cents={trip.startingAmount} />
        <MoneyCard label="Total Spent" cents={s.spent} hint={`${s.count} ${s.count === 1 ? "expense" : "expenses"}`} />
        {trip.status === "active" && <MoneyCard label="Spent today" cents={today} />}
        {perDay !== null && (
          <MoneyCard label="Per day left" cents={perDay} hint={`${days} ${days === 1 ? "day" : "days"} to go`} />
        )}
      </div>
    </section>
  );
}

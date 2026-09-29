import { tripStats } from "@/lib/calc";
import type { Expense, Trip } from "@/lib/types";
import { BudgetProgress, BudgetStatus } from "./BudgetProgress";
import { MoneyCard } from "./MoneyCard";

/** The three money cards + progress + status, shared by the dashboard and trip page. */
export function TripOverview({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const s = tripStats(trip, expenses);
  return (
    <section className="space-y-3">
      <MoneyCard label="Remaining" cents={s.remaining} tone={s.overBudget ? "bad" : "good"} large />
      <div className="grid grid-cols-2 gap-3">
        <MoneyCard label="Starting Money" cents={trip.startingAmount} />
        <MoneyCard label="Total Spent" cents={s.spent} />
      </div>
      <BudgetProgress spent={s.spent} budget={trip.startingAmount} percent={s.percent} />
      <BudgetStatus remaining={s.remaining} />
      <p className="text-sm text-slate-500">
        Number of expenses: <span className="font-semibold text-slate-700">{s.count}</span>
      </p>
    </section>
  );
}

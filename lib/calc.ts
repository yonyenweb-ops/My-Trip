import type { AppData, Expense, Trip } from "./types";

// Totals are always derived from the expense list, never stored,
// so editing or deleting an expense recalculates everything automatically.

/** Expenses for a trip, newest first. */
export function tripExpenses(data: AppData, tripId: string): Expense[] {
  return data.expenses
    .filter((e) => e.tripId === tripId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function tripStats(trip: Trip, expenses: Expense[]) {
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = trip.startingAmount - spent;
  const percent = trip.startingAmount > 0 ? (spent / trip.startingAmount) * 100 : 0;
  return { spent, remaining, percent, count: expenses.length, overBudget: remaining < 0 };
}

export function spendingByCategory(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  return [...totals].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

/** The trip the dashboard shows: the most recently created active trip. */
export function currentTrip(data: AppData): Trip | undefined {
  return data.trips
    .filter((t) => t.status === "active")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

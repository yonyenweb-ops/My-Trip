import { daysBetween, todayDate } from "./dates";
import type { Currency } from "./money";
import type { AppData, Expense, Trip } from "./types";

// Totals are always derived from the expense list, never stored,
// so editing or deleting an expense recalculates everything automatically.

/** Expenses for a trip, newest first. */
export function tripExpenses(data: AppData, tripId: string): Expense[] {
  return data.expenses
    .filter((e) => e.tripId === tripId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

const sum = (expenses: Expense[]) => expenses.reduce((total, e) => total + e.amount, 0);

export function tripStats(trip: Trip, expenses: Expense[]) {
  const spent = sum(expenses);
  const remaining = trip.startingAmount - spent;
  const percent = trip.startingAmount > 0 ? (spent / trip.startingAmount) * 100 : 0;
  return { spent, remaining, percent, count: expenses.length, overBudget: remaining < 0 };
}

export function spentToday(expenses: Expense[], today = todayDate()): number {
  return sum(expenses.filter((e) => e.date.startsWith(today)));
}

/**
 * Days left in an active trip, counting today, or null when the trip has
 * no end date, is closed, or has already ended.
 */
export function daysLeft(trip: Trip, today = todayDate()): number | null {
  if (!trip.endDate || trip.status !== "active" || today > trip.endDate) return null;
  const from = today < trip.startDate ? trip.startDate : today;
  return daysBetween(from, trip.endDate) + 1;
}

/** Expenses grouped by calendar day (newest day first) with each day's total. */
export function groupByDay(expenses: Expense[]) {
  const groups: { day: string; total: number; items: Expense[] }[] = [];
  for (const e of expenses) {
    const day = e.date.slice(0, 10);
    let group = groups.at(-1);
    if (!group || group.day !== day) groups.push((group = { day, total: 0, items: [] }));
    group.items.push(e);
    group.total += e.amount;
  }
  return groups;
}

export function spendingByCategory(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  return [...totals].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}

const DEFAULT_BUDGETS: Record<Currency, number[]> = {
  USD: [50, 100, 200, 300, 500],
  KHR: [100000, 200000, 400000, 800000, 1000000],
};

/**
 * Quick amounts for a trip's starting money: the user's past budgets first
 * (newest trip first), then round defaults. Dollars or whole riel, max 6 each.
 */
export function budgetSuggestions(trips: Trip[], excludeId?: string): Record<Currency, number[]> {
  const past = trips.filter((t) => t.id !== excludeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pick = (recent: number[], defaults: number[]) => [...new Set([...recent.slice(0, 3), ...defaults])].slice(0, 6);
  return {
    USD: pick(past.filter((t) => !t.original).map((t) => t.startingAmount / 100), DEFAULT_BUDGETS.USD),
    KHR: pick(past.flatMap((t) => (t.original ? [t.original.amount] : [])), DEFAULT_BUDGETS.KHR),
  };
}

/** The trip the dashboard shows: the most recently created active trip. */
export function currentTrip(data: AppData): Trip | undefined {
  return data.trips
    .filter((t) => t.status === "active")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

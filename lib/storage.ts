"use client";

import { useSyncExternalStore } from "react";
import type { AppData, Expense, Trip } from "./types";

const STORAGE_KEY = "trip-money-manager";
const EMPTY: AppData = { trips: [], expenses: [] };

let cache: AppData | null = null;
const listeners = new Set<() => void>();

function read(): AppData {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    cache = parsed && Array.isArray(parsed.trips) && Array.isArray(parsed.expenses) ? parsed : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache as AppData;
}

function write(next: AppData) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    alert("Could not save to this browser's storage. Your latest change may be lost after refresh.");
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other open tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** App data from localStorage. `null` during server render / before hydration. */
export function useAppData(): AppData | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

const now = () => new Date().toISOString();
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

// ---- Trips ----

export type TripInput = Pick<Trip, "name" | "startingAmount" | "original" | "startDate" | "endDate" | "note">;

export function createTrip(input: TripInput): string {
  const data = read();
  const trip: Trip = { ...input, id: newId(), status: "active", createdAt: now(), updatedAt: now() };
  write({ ...data, trips: [...data.trips, trip] });
  return trip.id;
}

function patchTrip(id: string, patch: Partial<Trip>) {
  const data = read();
  write({
    ...data,
    trips: data.trips.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)),
  });
}

export const updateTrip = (id: string, input: TripInput) => patchTrip(id, input);
export const closeTrip = (id: string) => patchTrip(id, { status: "completed", closedAt: now() });
export const reopenTrip = (id: string) => patchTrip(id, { status: "active", closedAt: undefined });

export function deleteTrip(id: string) {
  const data = read();
  write({
    trips: data.trips.filter((t) => t.id !== id),
    expenses: data.expenses.filter((e) => e.tripId !== id),
  });
}

// ---- Expenses ----

export type ExpenseInput = Pick<Expense, "amount" | "category" | "description" | "date" | "original">;

export function addExpense(tripId: string, input: ExpenseInput): string {
  const data = read();
  const expense: Expense = { ...input, id: newId(), tripId, createdAt: now(), updatedAt: now() };
  write({ ...data, expenses: [...data.expenses, expense] });
  return expense.id;
}

/** Put back an expense exactly as it was (used by "Undo" after deleting). */
export function restoreExpense(expense: Expense) {
  const data = read();
  if (data.expenses.some((e) => e.id === expense.id)) return;
  write({ ...data, expenses: [...data.expenses, expense] });
}

export function updateExpense(id: string, input: ExpenseInput) {
  const data = read();
  write({
    ...data,
    expenses: data.expenses.map((e) => (e.id === id ? { ...e, ...input, updatedAt: now() } : e)),
  });
}

export function deleteExpense(id: string) {
  const data = read();
  write({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
}

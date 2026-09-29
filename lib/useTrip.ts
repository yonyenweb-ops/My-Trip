"use client";

import { tripExpenses } from "./calc";
import { useAppData } from "./storage";

/** Loads one trip and its expenses (newest first). `loading` is true until localStorage is read. */
export function useTrip(id: string) {
  const data = useAppData();
  if (!data) return { loading: true as const };
  const trip = data.trips.find((t) => t.id === id);
  return { loading: false as const, trip, expenses: trip ? tripExpenses(data, trip.id) : [] };
}

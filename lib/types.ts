// All money amounts are stored as integer cents ($210.54 -> 21054).

export type TripStatus = "active" | "completed";

export interface Trip {
  id: string;
  name: string;
  startingAmount: number;
  // Set when the starting money was entered in riel; `startingAmount` holds the converted cents.
  original?: { currency: "KHR"; amount: number; rate: number };
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  note?: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DDTHH:mm (local time)
  // Set when the expense was entered in riel; `amount` holds the converted cents.
  original?: { currency: "KHR"; amount: number; rate: number };
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  trips: Trip[];
  expenses: Expense[];
}

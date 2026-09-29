/**
 * Parse user input like "10", "2.5", "$210.54", "1,200" into cents.
 * Returns null for anything invalid, zero, or negative ("abc", "0", "-10", "1.234").
 */
export function parseAmount(input: string): number | null {
  const s = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(s)) return null;
  const [whole, frac = ""] = s.split(".");
  const cents = Number(whole || "0") * 100 + Number((frac + "00").slice(0, 2));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, "0")}`;
}

// ---- Khmer riel ----

/** Fixed exchange rate used to convert riel expenses into dollars. */
export const KHR_PER_USD = 4000;

/** Parse whole riel like "2000" or "10,000". Returns null for invalid, zero, or negative. */
export function parseRiel(input: string): number | null {
  const s = input.trim().replace(/[៛,\s]/g, "");
  if (!/^\d+$/.test(s)) return null;
  const riel = Number(s);
  return Number.isSafeInteger(riel) && riel > 0 ? riel : null;
}

/** 2000៛ -> 50 cents ($0.50). */
export function rielToCents(riel: number, rate = KHR_PER_USD): number {
  return Math.round((riel * 100) / rate);
}

export function formatRiel(riel: number): string {
  return `${riel.toLocaleString("en-US")}៛`;
}

/** Cents -> plain input value, e.g. 1050 -> "10.50". */
export function centsToInput(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function todayDate(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nowTime(d = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" as local time (not UTC). */
export function parseLocal(value: string): Date {
  const [date, time = "00:00"] = value.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h || 0, min || 0);
}

export function splitDateTime(value: string): { date: string; time: string } {
  const [date, time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

export const formatDay = (value: string) =>
  parseLocal(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const formatDate = (value: string) =>
  parseLocal(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const formatTime = (value: string) =>
  parseLocal(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export function formatDateRange(start: string, end?: string): string {
  return end && end !== start ? `${formatDate(start)} – ${formatDate(end)}` : formatDate(start);
}

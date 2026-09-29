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

/** "Today", "Yesterday", or e.g. "Mon, Sep 28" for a YYYY-MM-DD day. */
export function dayLabel(day: string, now = new Date()): string {
  const today = todayDate(now);
  const yesterday = todayDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";
  const d = parseLocal(day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseLocal(to).getTime() - parseLocal(from).getTime()) / 86_400_000);
}

/** "Aug 10 – Aug 12, 2026"; the year is repeated only when the dates are in different years. */
export function formatDateRange(start: string, end?: string): string {
  if (!end || end === start) return formatDate(start);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${sameYear ? formatDay(start) : formatDate(start)} – ${formatDate(end)}`;
}

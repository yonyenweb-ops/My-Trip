import { formatMoney } from "@/lib/money";

type Props = {
  label: string;
  cents: number;
  tone?: "default" | "good" | "bad";
  large?: boolean;
};

const TONES = {
  default: "bg-white text-slate-900 border-slate-200",
  good: "bg-emerald-600 text-white border-emerald-600",
  bad: "bg-red-600 text-white border-red-600",
};

export function MoneyCard({ label, cents, tone = "default", large }: Props) {
  return (
    <div className={`rounded-3xl border p-4 ${TONES[tone]}`}>
      <div className={`text-sm font-medium ${tone === "default" ? "text-slate-500" : "text-white/85"}`}>{label}</div>
      <div
        className={`mt-1 font-bold tracking-tight tabular-nums ${large ? "text-5xl" : "text-2xl"}`}
        style={{ overflowWrap: "anywhere" }}
      >
        {formatMoney(cents)}
      </div>
    </div>
  );
}

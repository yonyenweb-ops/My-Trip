import { formatMoney } from "@/lib/money";

type Props = { spent: number; budget: number; percent: number };

export function BudgetProgress({ spent, budget, percent }: Props) {
  const over = spent > budget;
  const bar = over ? "bg-red-600" : percent >= 80 ? "bg-amber-500" : "bg-emerald-600";
  return (
    <div>
      <div
        className="h-3 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget spent"
      >
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <div className="mt-1.5 text-sm text-slate-500 tabular-nums">{percent.toFixed(1)}% spent</div>
    </div>
  );
}

/** Plain-language status line under the numbers. */
export function BudgetStatus({ remaining }: { remaining: number }) {
  if (remaining < 0) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
        <div className="font-bold">⚠️ Budget exceeded</div>
        <div className="mt-0.5">You have exceeded your trip budget by {formatMoney(-remaining)}</div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-emerald-50 p-4 font-medium text-emerald-800">
      You have {formatMoney(remaining)} remaining.
    </div>
  );
}

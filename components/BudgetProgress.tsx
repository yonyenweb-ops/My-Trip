import { formatMoney } from "@/lib/money";

type Props = { spent: number; budget: number; percent: number };

/** Progress bar drawn on the colored hero card (white on translucent white). */
export function BudgetProgress({ spent, budget, percent }: Props) {
  return (
    <div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-white/25"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget spent"
      >
        <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <div className="mt-2 flex justify-between gap-3 text-sm text-white/85 tabular-nums">
        <span>{percent.toFixed(1)}% spent</span>
        <span>
          {formatMoney(spent)} of {formatMoney(budget)}
        </span>
      </div>
    </div>
  );
}

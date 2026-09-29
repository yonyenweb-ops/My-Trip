import { formatMoney } from "@/lib/money";

type Props = {
  label: string;
  cents: number;
  hint?: string;
  tone?: "default" | "bad";
};

/** Small stat tile: a label and an easy-to-read amount. */
export function MoneyCard({ label, cents, hint, tone = "default" }: Props) {
  return (
    <div className="card px-4 py-3 sm:p-4">
      <div className="text-[13px] font-medium text-muted sm:text-sm">{label}</div>
      <div
        className={`mt-0.5 text-xl font-bold tracking-tight tabular-nums sm:mt-1 sm:text-2xl ${tone === "bad" ? "text-danger" : ""}`}
        style={{ overflowWrap: "anywhere" }}
      >
        {formatMoney(cents)}
      </div>
      {hint && <div className="mt-0.5 text-xs text-faint">{hint}</div>}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { formatMoney, formatRiel, parseMoneyInput, type Currency } from "@/lib/money";

type Props = {
  id: string;
  label: string;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  value: string;
  onChange: (v: string) => void;
  /** Tap-to-fill amounts, in dollars or whole riel. */
  suggestions: Record<Currency, number[]>;
  rate: number;
  error?: string;
  autoFocus?: boolean;
  size?: "lg" | "md";
};

function chipLabel(currency: Currency, v: number) {
  if (currency === "KHR") return formatRiel(v);
  return Number.isInteger(v) ? `$${v.toLocaleString("en-US")}` : formatMoney(Math.round(v * 100));
}

/** Amount field with a $ Dollar / ៛ Riel switch, quick-amount chips and live riel → dollar conversion. */
export function MoneyInput({
  id,
  label,
  currency,
  onCurrencyChange,
  value,
  onChange,
  suggestions,
  rate,
  error,
  autoFocus,
  size = "lg",
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const { riel, cents } = parseMoneyInput(currency, value, rate);
  const helpId = `${id}-help`;

  function switchCurrency(next: Currency) {
    if (next === currency) return;
    onCurrencyChange(next);
    onChange("");
    ref.current?.focus();
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="label mb-0">
          {label}
        </label>
        <div role="group" aria-label="Currency" className="flex rounded-xl bg-soft p-1 text-sm font-semibold">
          {(["USD", "KHR"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => switchCurrency(c)}
              aria-pressed={currency === c}
              className={`min-h-9 rounded-lg px-3 transition-colors ${
                currency === c ? "bg-card text-brand-text shadow-sm" : "text-muted"
              }`}
            >
              {c === "USD" ? "$ Dollar" : "៛ Riel"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <span
          className={`pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-bold text-faint ${
            size === "lg" ? "text-3xl" : "text-2xl"
          }`}
        >
          {currency === "USD" ? "$" : "៛"}
        </span>
        <input
          id={id}
          ref={ref}
          inputMode={currency === "USD" ? "decimal" : "numeric"}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={currency === "USD" ? "0.00" : "0"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={currency === "KHR" ? helpId : undefined}
          className={`input font-bold tabular-nums ${size === "lg" ? "h-16 pl-11 text-3xl" : "h-14 pl-10 text-2xl"}`}
        />
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Quick amounts">
        {suggestions[currency].map((v) => {
          const selected = value === String(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(String(v))}
              aria-pressed={selected}
              className={`min-h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold tabular-nums transition-colors ${
                selected
                  ? "border-brand bg-brand-soft text-brand-text"
                  : "border-line bg-card text-muted hover:border-brand hover:text-brand-text"
              }`}
            >
              {chipLabel(currency, v)}
            </button>
          );
        })}
      </div>

      {currency === "KHR" && (
        <p id={helpId} className="mt-1 text-sm text-muted" aria-live="polite">
          {riel !== null && cents !== null ? (
            <>
              {formatRiel(riel)} = <span className="font-bold text-brand-text">{formatMoney(cents)}</span>
              <span className="text-faint"> · $1 = {formatRiel(rate)}</span>
            </>
          ) : (
            <span className="text-faint">Converts to dollars at $1 = {formatRiel(rate)}</span>
          )}
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

"use client";

import { useRef, useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/categories";
import { nowTime, splitDateTime, todayDate } from "@/lib/dates";
import {
  KHR_PER_USD,
  centsToInput,
  formatMoney,
  formatRiel,
  parseAmount,
  parseRiel,
  rielToCents,
} from "@/lib/money";
import { addExpense, updateExpense } from "@/lib/storage";
import type { Expense } from "@/lib/types";

type Props = {
  tripId: string;
  expense?: Expense; // when set, the form edits this expense
  onDone: () => void;
};

type Errors = Partial<Record<"amount" | "category" | "date", string>>;

export function ExpenseForm({ tripId, expense, onDone }: Props) {
  const initial = expense ? splitDateTime(expense.date) : { date: todayDate(), time: nowTime() };
  const [currency, setCurrency] = useState<"USD" | "KHR">(expense?.original ? "KHR" : "USD");
  const [amount, setAmount] = useState(
    expense ? (expense.original ? String(expense.original.amount) : centsToInput(expense.amount)) : "",
  );
  const amountRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(expense?.category ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [errors, setErrors] = useState<Errors>({});

  // Riel keeps the rate it was saved with; new riel entries use today's fixed rate.
  const rate = expense?.original?.rate ?? KHR_PER_USD;
  const riel = currency === "KHR" ? parseRiel(amount) : null;
  const cents = currency === "KHR" ? (riel === null ? null : rielToCents(riel, rate) || null) : parseAmount(amount);

  function switchCurrency(next: "USD" | "KHR") {
    if (next === currency) return;
    setCurrency(next);
    setAmount("");
    setErrors((e) => ({ ...e, amount: undefined }));
    amountRef.current?.focus();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (cents === null) {
      next.amount =
        currency === "KHR"
          ? riel === null
            ? "Enter riel as a whole number, like 2000"
            : "Amount is too small (less than $0.01)"
          : "Enter an amount greater than 0, like 10 or 2.50";
    }
    if (!category) next.category = "Pick a category";
    if (!date) next.date = "Date is required";
    setErrors(next);
    if (cents === null || Object.keys(next).length) return;

    const input = {
      amount: cents,
      category,
      description: description.trim(),
      date: `${date}T${time || "00:00"}`,
      original: riel !== null ? { currency: "KHR" as const, amount: riel, rate } : undefined,
    };
    if (expense) updateExpense(expense.id, input);
    else addExpense(tripId, input);
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="amount" className="label mb-0">
            Amount
          </label>
          <div role="group" aria-label="Currency" className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            {(["USD", "KHR"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => switchCurrency(c)}
                aria-pressed={currency === c}
                className={`min-h-9 rounded-lg px-3 ${currency === c ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}
              >
                {c === "USD" ? "$ Dollar" : "៛ Riel"}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">
            {currency === "USD" ? "$" : "៛"}
          </span>
          <input
            id="amount"
            ref={amountRef}
            inputMode={currency === "USD" ? "decimal" : "numeric"}
            autoComplete="off"
            autoFocus
            placeholder={currency === "USD" ? "0.00" : "0"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!!errors.amount}
            className="input h-16 pl-10 text-3xl font-bold tabular-nums"
          />
        </div>
        {currency === "KHR" && (
          <p className="mt-1.5 text-sm text-slate-500" aria-live="polite">
            {riel !== null && cents !== null ? (
              <>
                {formatRiel(riel)} = <span className="font-bold text-emerald-700">{formatMoney(cents)}</span>
              </>
            ) : (
              "Enter riel, it converts to dollars"
            )}{" "}
            <span className="text-slate-400">· $1 = {formatRiel(rate)}</span>
          </p>
        )}
        {errors.amount && <p className="error">{errors.amount}</p>}
      </div>

      <fieldset>
        <legend className="label">Category</legend>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => {
            const selected = category === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                aria-pressed={selected}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl border px-1 py-2 text-[11px] font-medium leading-tight ${
                  selected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {c.emoji}
                </span>
                {c.name}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="error">{errors.category}</p>}
      </fieldset>

      <div>
        <label htmlFor="description" className="label">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="description"
          placeholder="e.g. Dinner, Tuk tuk"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className="label">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.date}
            className="input"
          />
          {errors.date && <p className="error">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="time" className="label">
            Time
          </label>
          <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input" />
        </div>
      </div>

      <button type="submit" className="btn-primary w-full text-lg">
        {expense ? "Save Changes" : "Add Expense"}
      </button>
    </form>
  );
}

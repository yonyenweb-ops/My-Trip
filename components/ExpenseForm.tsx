"use client";

import { useRef, useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/categories";
import { dayLabel, formatTime, nowTime, splitDateTime, todayDate } from "@/lib/dates";
import {
  KHR_PER_USD,
  centsToInput,
  formatMoney,
  formatRiel,
  parseAmount,
  parseRiel,
  rielToCents,
} from "@/lib/money";
import { addExpense, deleteExpense, updateExpense } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import type { Expense } from "@/lib/types";
import { CalendarIcon, TrashIcon } from "./Icons";

type Props = {
  tripId: string;
  expense?: Expense; // when set, the form edits this expense
  onDone: () => void;
  onDelete?: () => void; // edit mode: ask to delete this expense
};

type Currency = "USD" | "KHR";
type Errors = Partial<Record<"amount" | "category" | "date", string>>;

const QUICK: Record<Currency, number[]> = {
  USD: [1, 2, 5, 10, 20],
  KHR: [1000, 2000, 5000, 10000, 20000],
};

export function ExpenseForm({ tripId, expense, onDone, onDelete }: Props) {
  const initial = expense ? splitDateTime(expense.date) : { date: todayDate(), time: nowTime() };
  const [currency, setCurrency] = useState<Currency>(expense?.original ? "KHR" : "USD");
  const [amount, setAmount] = useState(
    expense ? (expense.original ? String(expense.original.amount) : centsToInput(expense.amount)) : "",
  );
  const [category, setCategory] = useState(expense?.category ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [editingDate, setEditingDate] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const amountRef = useRef<HTMLInputElement>(null);

  // Riel keeps the rate it was saved with; new riel entries use today's fixed rate.
  const rate = expense?.original?.rate ?? KHR_PER_USD;
  const riel = currency === "KHR" ? parseRiel(amount) : null;
  const cents = currency === "KHR" ? (riel === null ? null : rielToCents(riel, rate) || null) : parseAmount(amount);

  function switchCurrency(next: Currency) {
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
    if (!date) {
      next.date = "Date is required";
      setEditingDate(true);
    }
    setErrors(next);
    if (cents === null || Object.keys(next).length) return;

    const input = {
      amount: cents,
      category,
      description: description.trim(),
      date: `${date}T${time || "00:00"}`,
      original: riel !== null ? { currency: "KHR" as const, amount: riel, rate } : undefined,
    };
    if (expense) {
      updateExpense(expense.id, input);
      showToast("Changes saved");
    } else {
      const id = addExpense(tripId, input);
      showToast(`Added ${input.description || category} −${formatMoney(cents)}`, {
        label: "Undo",
        onClick: () => deleteExpense(id),
      });
    }
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {/* Amount */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label htmlFor="amount" className="label mb-0">
            Amount
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
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-3xl font-bold text-faint">
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
            aria-describedby={currency === "KHR" ? "amount-help" : undefined}
            className="input h-16 pl-11 text-3xl font-bold tabular-nums"
          />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Quick amounts">
          {QUICK[currency].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setAmount(String(v));
                setErrors((e) => ({ ...e, amount: undefined }));
              }}
              className="min-h-9 shrink-0 rounded-full border border-line bg-card px-3.5 text-sm font-semibold text-muted tabular-nums hover:border-brand hover:text-brand-text"
            >
              {currency === "USD" ? `$${v}` : formatRiel(v)}
            </button>
          ))}
        </div>
        {currency === "KHR" && (
          <p id="amount-help" className="mt-1 text-sm text-muted" aria-live="polite">
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
        {errors.amount && <p className="error">{errors.amount}</p>}
      </div>

      {/* Category */}
      <fieldset>
        <legend className="label">Category</legend>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => {
            const selected = category === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setCategory(c.name);
                  setErrors((e) => ({ ...e, category: undefined }));
                }}
                aria-pressed={selected}
                className={`flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 text-[11px] leading-tight font-semibold transition-colors ${
                  selected
                    ? "border-brand bg-brand-soft text-brand-text ring-2 ring-brand"
                    : "border-line bg-card text-muted hover:bg-soft"
                }`}
              >
                <span className="text-[22px] leading-none" aria-hidden>
                  {c.emoji}
                </span>
                {c.name}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="error">{errors.category}</p>}
      </fieldset>

      {/* Description */}
      <div>
        <label htmlFor="description" className="label">
          Description <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          id="description"
          placeholder="e.g. Dinner, Tuk tuk"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
        />
      </div>

      {/* Date & time: collapsed to one line, since it's usually "now" */}
      {editingDate ? (
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
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-2.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            <CalendarIcon size={18} className="text-muted" />
            {date ? dayLabel(date) : "No date"}
            {time && `, ${formatTime(`${date}T${time}`)}`}
          </span>
          <button type="button" onClick={() => setEditingDate(true)} className="btn-ghost -mr-2 text-brand-text">
            Change
          </button>
        </div>
      )}

      <button type="submit" className="btn-primary h-14 w-full text-lg">
        {expense ? "Save Changes" : "Add Expense"}
      </button>

      {expense && onDelete && (
        <button type="button" onClick={onDelete} className="btn-danger-outline w-full">
          <TrashIcon size={18} /> Delete expense
        </button>
      )}
    </form>
  );
}

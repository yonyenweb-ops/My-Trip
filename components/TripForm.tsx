"use client";

import { useState, type FormEvent } from "react";
import { todayDate } from "@/lib/dates";
import { KHR_PER_USD, centsToInput, moneyInputError, parseMoneyInput, type Currency } from "@/lib/money";
import type { TripInput } from "@/lib/storage";
import type { Trip } from "@/lib/types";
import { MoneyInput } from "./MoneyInput";

type Errors = Partial<Record<"name" | "amount" | "startDate" | "endDate", string>>;

type Props = {
  trip?: Trip; // when set, the form edits this trip
  submitLabel: string;
  /** Quick amounts for the starting money (past budgets + round numbers). */
  suggestions: Record<Currency, number[]>;
  onSubmit: (input: TripInput) => void;
};

/** Create/edit trip form. Render only in the browser so "today" uses the phone's time zone. */
export function TripForm({ trip, submitLabel, suggestions, onSubmit }: Props) {
  const [name, setName] = useState(trip?.name ?? "");
  const [currency, setCurrency] = useState<Currency>(trip?.original ? "KHR" : "USD");
  const [amount, setAmount] = useState<string>(
    trip ? (trip.original ? String(trip.original.amount) : centsToInput(trip.startingAmount)) : "",
  );
  const [startDate, setStartDate] = useState(trip?.startDate ?? todayDate());
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  const [note, setNote] = useState(trip?.note ?? "");
  const [errors, setErrors] = useState<Errors>({});

  // A riel budget keeps the rate it was saved with; new riel budgets use today's fixed rate.
  const rate = trip?.original?.rate ?? KHR_PER_USD;
  const { riel, cents } = parseMoneyInput(currency, amount, rate);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Trip name is required";
    if (cents === null) next.amount = moneyInputError(currency, riel, "210.54");
    if (!startDate) next.startDate = "Start date is required";
    if (endDate && startDate && endDate < startDate) next.endDate = "End date can't be before the start date";
    setErrors(next);
    if (cents === null || Object.keys(next).length) return;

    onSubmit({
      name: name.trim(),
      startingAmount: cents,
      original: riel !== null ? { currency: "KHR", amount: riel, rate } : undefined,
      startDate,
      endDate: endDate || undefined,
      note: note.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-5 sm:p-6">
      <div>
        <label htmlFor="name" className="label">
          Trip Name
        </label>
        <input
          id="name"
          autoFocus={!trip}
          placeholder="e.g. Siem Reap Trip"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          className="input"
        />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      <MoneyInput
        id="amount"
        label="Starting Money"
        currency={currency}
        onCurrencyChange={setCurrency}
        value={amount}
        onChange={(v) => {
          setAmount(v);
          setErrors((e) => ({ ...e, amount: undefined }));
        }}
        suggestions={suggestions}
        rate={rate}
        error={errors.amount}
        size="md"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start" className="label">
            Start Date
          </label>
          <input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-invalid={!!errors.startDate}
            className="input"
          />
          {errors.startDate && <p className="error">{errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="end" className="label">
            End Date <span className="font-normal text-faint">(optional)</span>
          </label>
          <input
            id="end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            aria-invalid={!!errors.endDate}
            className="input"
          />
          {errors.endDate && <p className="error">{errors.endDate}</p>}
        </div>
      </div>
      {!errors.endDate && (
        <p className="-mt-3 text-xs text-faint">Add an end date to see how much you can spend per day.</p>
      )}

      <div>
        <label htmlFor="note" className="label">
          Note <span className="font-normal text-faint">(optional)</span>
        </label>
        <textarea
          id="note"
          rows={2}
          placeholder="Anything to remember about this trip"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input h-auto py-3"
        />
      </div>

      <button type="submit" className="btn-primary h-14 w-full text-lg">
        {submitLabel}
      </button>
    </form>
  );
}

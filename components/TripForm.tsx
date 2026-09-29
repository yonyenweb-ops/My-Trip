"use client";

import { useState, type FormEvent } from "react";
import { todayDate } from "@/lib/dates";
import { centsToInput, parseAmount } from "@/lib/money";
import type { TripInput } from "@/lib/storage";
import type { Trip } from "@/lib/types";

type Errors = Partial<Record<"name" | "amount" | "startDate" | "endDate", string>>;

type Props = {
  trip?: Trip; // when set, the form edits this trip
  submitLabel: string;
  onSubmit: (input: TripInput) => void;
};

/** Create/edit trip form. Render only in the browser so "today" uses the phone's time zone. */
export function TripForm({ trip, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(trip?.name ?? "");
  const [amount, setAmount] = useState(trip ? centsToInput(trip.startingAmount) : "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? todayDate());
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  const [note, setNote] = useState(trip?.note ?? "");
  const [errors, setErrors] = useState<Errors>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const cents = parseAmount(amount);
    const next: Errors = {};
    if (!name.trim()) next.name = "Trip name is required";
    if (cents === null) next.amount = "Enter an amount greater than 0, like 210.54";
    if (!startDate) next.startDate = "Start date is required";
    if (endDate && startDate && endDate < startDate) next.endDate = "End date can't be before the start date";
    setErrors(next);
    if (cents === null || Object.keys(next).length) return;

    onSubmit({
      name: name.trim(),
      startingAmount: cents,
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

      <div>
        <label htmlFor="amount" className="label">
          Starting Money
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-2xl font-bold text-faint">
            $
          </span>
          <input
            id="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!!errors.amount}
            className="input h-14 pl-10 text-2xl font-bold tabular-nums"
          />
        </div>
        {errors.amount && <p className="error">{errors.amount}</p>}
      </div>

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

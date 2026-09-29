"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loading } from "@/components/States";
import { todayDate } from "@/lib/dates";
import { parseAmount } from "@/lib/money";
import { createTrip, useAppData } from "@/lib/storage";

type Errors = Partial<Record<"name" | "amount" | "startDate" | "endDate", string>>;

function NewTripForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(todayDate());
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
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

    createTrip({
      name: name.trim(),
      startingAmount: cents,
      startDate,
      endDate: endDate || undefined,
      note: note.trim() || undefined,
    });
    router.push("/");
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="label">
          Trip Name
        </label>
        <input
          id="name"
          autoFocus
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
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
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
            className="input h-14 pl-9 text-2xl font-bold tabular-nums"
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
            End Date <span className="font-normal text-slate-400">(optional)</span>
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

      <div>
        <label htmlFor="note" className="label">
          Note <span className="font-normal text-slate-400">(optional)</span>
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
        Create Trip
      </button>
    </form>
  );
}

export default function NewTripPage() {
  // Wait until we're in the browser so "today" uses the phone's time zone, not the server's.
  const data = useAppData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">New Trip</h1>
      {data ? <NewTripForm /> : <Loading />}
    </div>
  );
}

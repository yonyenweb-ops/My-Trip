"use client";

import { useState } from "react";
import { groupByDay } from "@/lib/calc";
import { dayLabel } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { deleteExpense, restoreExpense } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import type { Expense } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseItem } from "./ExpenseItem";
import { Modal } from "./Modal";

type Props = {
  expenses: Expense[]; // already sorted newest first
  editable: boolean;
  limit?: number;
};

/** Keep only the first `limit` expenses, but leave each day's total covering the whole day. */
function limitGroups(groups: ReturnType<typeof groupByDay>, limit?: number) {
  if (!limit) return groups;
  const out: typeof groups = [];
  let left = limit;
  for (const g of groups) {
    if (left <= 0) break;
    out.push({ ...g, items: g.items.slice(0, left) });
    left -= g.items.length;
  }
  return out;
}

/** Expense history grouped by day, with each day's total. Tap an expense to edit or delete it. */
export function ExpenseList({ expenses, editable, limit }: Props) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const groups = limitGroups(groupByDay(expenses), limit);

  if (expenses.length === 0) {
    return (
      <div className="card flex flex-col items-center px-6 py-10 text-center">
        <span className="text-4xl" aria-hidden>
          🧾
        </span>
        <p className="mt-3 font-semibold">No expenses yet</p>
        <p className="mt-1 text-sm text-muted">
          {editable ? "Tap Add Expense each time you pay for something." : "Nothing was recorded for this trip."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.day} aria-label={dayLabel(g.day)}>
            <div className="mb-1 flex items-baseline justify-between px-1 text-sm">
              <h3 className="font-semibold text-muted">{dayLabel(g.day)}</h3>
              <span className="font-semibold text-muted tabular-nums">−{formatMoney(g.total)}</span>
            </div>
            <ul className="card p-1.5">
              {g.items.map((e) => (
                <ExpenseItem key={e.id} expense={e} onOpen={editable ? () => setEditing(e) : undefined} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {editing && (
        <Modal title="Edit Expense" onClose={() => setEditing(null)}>
          <ExpenseForm
            tripId={editing.tripId}
            expense={editing}
            onDone={() => setEditing(null)}
            onDelete={() => {
              setDeleting(editing);
              setEditing(null);
            }}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete expense?"
          message={`${deleting.description || deleting.category} (${formatMoney(deleting.amount)}) will be removed and your remaining money will be recalculated.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            const removed = deleting;
            deleteExpense(removed.id);
            setDeleting(null);
            showToast("Expense deleted", { label: "Undo", onClick: () => restoreExpense(removed) });
          }}
        />
      )}
    </>
  );
}

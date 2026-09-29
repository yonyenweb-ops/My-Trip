"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { deleteExpense } from "@/lib/storage";
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

export function ExpenseList({ expenses, editable, limit }: Props) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const shown = limit ? expenses.slice(0, limit) : expenses;

  if (expenses.length === 0) {
    return <p className="rounded-2xl bg-white py-8 text-center text-slate-500">No expenses yet</p>;
  }

  return (
    <>
      <ul className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white px-4">
        {shown.map((e) => (
          <ExpenseItem
            key={e.id}
            expense={e}
            onEdit={editable ? () => setEditing(e) : undefined}
            onDelete={editable ? () => setDeleting(e) : undefined}
          />
        ))}
      </ul>

      {editing && (
        <Modal title="Edit Expense" onClose={() => setEditing(null)}>
          <ExpenseForm tripId={editing.tripId} expense={editing} onDone={() => setEditing(null)} />
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
            deleteExpense(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}

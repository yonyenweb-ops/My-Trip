"use client";

import { useState } from "react";
import { ExpenseForm } from "./ExpenseForm";
import { Modal } from "./Modal";

/** The big main action: opens the expense form in a bottom sheet. */
export function AddExpenseButton({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary h-16 w-full text-xl">
        + Add Expense
      </button>
      {open && (
        <Modal title="Add Expense" onClose={() => setOpen(false)}>
          <ExpenseForm tripId={tripId} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}

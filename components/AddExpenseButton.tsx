"use client";

import { useState } from "react";
import { ExpenseForm } from "./ExpenseForm";
import { PlusIcon } from "./Icons";
import { Modal } from "./Modal";

type Props = {
  tripId: string;
  /** "floating": pinned above the phone's bottom menu. "inline": a normal button (tablet/desktop). */
  variant: "floating" | "inline";
};

/** The main action: opens the expense form. */
export function AddExpenseButton({ tripId, variant }: Props) {
  const [open, setOpen] = useState(false);

  const button =
    variant === "floating" ? (
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary pointer-events-auto mx-auto h-14 w-full max-w-xl rounded-full text-lg shadow-lg shadow-emerald-900/20"
        >
          <PlusIcon size={22} /> Add Expense
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
      >
        <PlusIcon size={20} /> Add Expense
      </button>
    );

  return (
    <>
      {button}
      {open && (
        <Modal title="Add Expense" onClose={() => setOpen(false)}>
          <ExpenseForm tripId={tripId} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}

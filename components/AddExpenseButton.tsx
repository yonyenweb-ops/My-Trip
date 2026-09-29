"use client";

import { useState } from "react";
import { startVoice, stopVoice } from "@/lib/voice-session";
import { ExpenseForm } from "./ExpenseForm";
import { MicIcon, PlusIcon } from "./Icons";
import { Modal } from "./Modal";

type Props = {
  tripId: string;
  /** "floating": pinned above the phone's bottom menu. "inline": a normal button (tablet/desktop). */
  variant: "floating" | "inline";
};

/** The main action: opens the expense form, or starts listening with the 🎤 button. */
export function AddExpenseButton({ tripId, variant }: Props) {
  const [open, setOpen] = useState<"type" | "voice" | null>(null);

  // Listening must start inside the tap itself (browser rule), then the form opens and fills in.
  const speak = () => {
    startVoice();
    setOpen("voice");
  };
  // Closing the form also stops listening and clears what was heard.
  const close = () => {
    stopVoice();
    setOpen(null);
  };

  const buttons =
    variant === "floating" ? (
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 px-4 md:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-xl gap-2">
          <button
            type="button"
            onClick={() => setOpen("type")}
            className="btn-primary h-14 flex-1 rounded-full text-lg shadow-lg shadow-emerald-900/20"
          >
            <PlusIcon size={22} /> Add Expense
          </button>
          <button
            type="button"
            onClick={speak}
            aria-label="Add expense by voice"
            className="btn-primary h-14 w-14 shrink-0 rounded-full px-0 shadow-lg shadow-emerald-900/20"
          >
            <MicIcon size={22} />
          </button>
        </div>
      </div>
    ) : (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen("type")}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
        >
          <PlusIcon size={20} /> Add Expense
        </button>
        <button
          type="button"
          onClick={speak}
          aria-label="Add expense by voice"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98]"
        >
          <MicIcon size={20} />
        </button>
      </div>
    );

  return (
    <>
      {buttons}
      {open && (
        <Modal title="Add Expense" onClose={close}>
          <ExpenseForm tripId={tripId} onDone={close} startedWithVoice={open === "voice"} />
        </Modal>
      )}
    </>
  );
}

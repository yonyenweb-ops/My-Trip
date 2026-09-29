"use client";

import { Modal } from "./Modal";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: Props) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-6 text-slate-600">{message}</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={danger ? "btn-danger" : "btn-primary"}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

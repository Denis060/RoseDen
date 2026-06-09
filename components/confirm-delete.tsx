"use client";

import { ReactNode, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui";

type Props = {
  itemName: string;
  itemType: string;
  onDelete: () => Promise<void>;
  className?: string;
  children?: ReactNode;
};

export function ConfirmDelete({ itemName, itemType, onDelete, className, children }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    setDeleting(true);
    setError("");
    try {
      await onDelete();
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not delete this ${itemType}.`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-label={`Delete ${itemName}`}>{children || <Trash2 size={17} />}</button>
      {open && <Modal title={`Delete ${itemType}?`} onClose={() => !deleting && setOpen(false)}>
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="shrink-0 text-red-700" />
            <div><p className="font-bold text-red-900">{itemName}</p><p className="mt-1 text-sm leading-5 text-red-800/75">This permanently removes the record. This action cannot be undone.</p></div>
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={deleting} onClick={() => setOpen(false)} className="h-12 rounded-xl border border-black/10 bg-white font-semibold text-wine">Keep it</button>
            <button type="button" disabled={deleting} onClick={confirmDelete} className="h-12 rounded-xl bg-red-700 font-semibold text-white disabled:opacity-45">{deleting ? "Deleting..." : "Delete"}</button>
          </div>
        </div>
      </Modal>}
    </>
  );
}


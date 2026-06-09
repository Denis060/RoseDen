"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Plus, X } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: () => void }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div><h1 className="font-display text-3xl font-semibold text-wine">{title}</h1><p className="mt-1 text-sm text-black/55">{subtitle}</p></div>
      {action && <button onClick={action} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-burgundy text-white shadow-soft" aria-label={`Add ${title.toLowerCase()}`}><Plus /></button>}
    </div>
  );
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex max-w-[100vw] items-end justify-center overflow-x-hidden bg-black/45 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full min-w-0 max-w-lg overflow-x-hidden overflow-y-auto rounded-t-[28px] bg-cream p-5 shadow-2xl sm:rounded-[28px]">
        <div className="mb-5 flex min-w-0 items-center justify-between gap-3"><h2 className="min-w-0 font-display text-2xl font-semibold text-wine">{title}</h2><button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/5"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Form({ children, onSubmit, submitLabel = "Save", submitDisabled = false }: { children: ReactNode; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitLabel?: string; submitDisabled?: boolean }) {
  return <form onSubmit={onSubmit} className="space-y-4">{children}<button disabled={submitDisabled} className="h-13 w-full rounded-2xl bg-burgundy px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">{submitLabel}</button></form>;
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block min-w-0 text-sm font-medium text-ink">{label}<input {...props} className="mt-1.5 h-12 min-w-0 w-full rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15" /></label>;
}

export function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-ink">{label}<select {...props} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-gold">{children}</select></label>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-burgundy/25 px-6 py-10 text-center text-sm text-black/50">{children}</div>;
}

export function useModal() {
  const [open, setOpen] = useState(false);
  return { open, show: () => setOpen(true), hide: () => setOpen(false) };
}

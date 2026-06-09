"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 text-ink">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-700"><AlertTriangle /></span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-wine">RoseDen could not open this page</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">Check your internet connection and try again. Your saved business records are not deleted.</p>
        <button onClick={reset} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-burgundy font-semibold text-white"><RefreshCcw size={18} />Try again</button>
        <a href="/admin" className="mt-3 flex h-12 items-center justify-center rounded-xl border border-burgundy/15 font-semibold text-burgundy">Return to dashboard</a>
      </div>
    </main>
  );
}

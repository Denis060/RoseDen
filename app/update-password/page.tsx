"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Field } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("Opening secure password reset...");

  useEffect(() => {
    let active = true;
    async function checkSession() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setReady(Boolean(data.session));
      setMessage(data.session ? "" : "This reset link is invalid or has expired. Request a new one.");
    }
    checkSession();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));
    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setComplete(true);
      setMessage("Your password has been updated.");
    }
    setBusy(false);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-soft">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-burgundy font-display text-2xl font-bold text-white">R</div>
          <h1 className="mt-4 font-display text-3xl font-bold text-wine">Choose a new password</h1>
          <p className="mt-2 text-sm text-black/50">RoseDen OS staff account recovery</p>
        </div>
        {complete ? (
          <div className="mt-6 text-center">
            <CheckCircle2 className="mx-auto text-emerald-700" size={38} />
            <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>
            <Link href="/login" className="mt-4 flex h-12 items-center justify-center rounded-xl bg-burgundy font-semibold text-white">Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field name="password" label="New password" type="password" autoComplete="new-password" minLength={8} disabled={!ready} required />
            <Field name="confirmPassword" label="Confirm new password" type="password" autoComplete="new-password" minLength={8} disabled={!ready} required />
            {message && <p className="rounded-xl bg-gold/10 p-3 text-sm text-wine">{message}</p>}
            <button disabled={!ready || busy} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-burgundy px-5 py-4 font-semibold text-white disabled:opacity-50">
              {busy && <LoaderCircle size={18} className="animate-spin" />}
              {busy ? "Updating password..." : "Update password"}
            </button>
            {!ready && <Link href="/login" className="block text-center text-xs font-semibold text-burgundy">Request another reset link</Link>}
          </form>
        )}
      </div>
    </main>
  );
}

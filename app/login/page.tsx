"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Field } from "@/components/ui";

function LoginForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("Signing in...");
    if (!supabase) {
      setMessage("Add Supabase keys to enable sign-in.");
      setBusy(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    let result;
    try {
      result = await supabase.auth.signInWithPassword({ email, password });
    } catch {
      setMessage("The connection stopped during sign-in. Check your internet and tap Sign in again.");
      setBusy(false);
      return;
    }
    if (result.error) {
      setMessage(result.error.message === "Invalid login credentials"
        ? "The email or password does not match. Tap Show password and check every character."
        : result.error.message);
      setBusy(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setMessage("Sign-in was accepted, but the browser did not save the session. Refresh and try once more.");
      setBusy(false);
      return;
    }

    setMessage("Signed in. Opening RoseDen OS...");
    const destination = params.get("next")?.startsWith("/admin") ? params.get("next")! : "/admin";
    window.location.replace(destination);
  }

  async function sendRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    setBusy(true);
    setMessage("Sending password reset link...");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setMessage(error
      ? error.message
      : "Check your email for the RoseDen password reset link.");
    setBusy(false);
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-cream px-4 py-10">
      <div className="mx-auto w-full max-w-sm min-w-0 rounded-[28px] bg-white p-6 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-burgundy">← Back to website</Link>
        <div className="mb-7 mt-5 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-burgundy font-display text-2xl font-bold text-white">R</div><h1 className="mt-4 font-display text-3xl font-bold text-wine">RoseDen OS</h1><p className="mt-1 text-sm text-black/50">Private staff sign in</p></div>
        <form onSubmit={recoveryMode ? sendRecovery : handleAuth} className="min-w-0 space-y-4">
          <Field name="email" label="Email" type="email" defaultValue="joinriseafrica@gmail.com" required />
          {!recoveryMode && <div>
            <Field name="password" label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-burgundy">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}{showPassword ? "Hide password" : "Show password"}
            </button>
          </div>}
          {message && <p className="rounded-xl bg-gold/10 p-3 text-sm text-wine">{message}</p>}
          <button type="submit" disabled={busy} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-burgundy px-5 py-4 font-semibold text-white disabled:opacity-60">
            {busy && <LoaderCircle size={18} className="animate-spin" />}
            {busy ? "Please wait..." : recoveryMode ? "Email reset link" : "Sign in to Admin"}
          </button>
          <button type="button" onClick={() => { setRecoveryMode((current) => !current); setMessage(""); }} className="w-full text-center text-xs font-semibold text-burgundy">
            {recoveryMode ? "Return to sign in" : "Forgot password?"}
          </button>
          <p className="text-center text-xs leading-5 text-black/45">Need an account? Ask a RoseDen administrator to add you in Staff &amp; Access.</p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

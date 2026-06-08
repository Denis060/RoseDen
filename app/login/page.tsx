"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Field } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    const result = await supabase.auth.signInWithPassword({ email, password });
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
    router.replace(params.get("next")?.startsWith("/admin") ? params.get("next")! : "/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto max-w-sm rounded-[28px] bg-white p-6 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-burgundy">← Back to website</Link>
        <div className="mb-7 mt-5 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-burgundy font-display text-2xl font-bold text-white">R</div><h1 className="mt-4 font-display text-3xl font-bold text-wine">RoseDen OS</h1><p className="mt-1 text-sm text-black/50">Private staff sign in</p></div>
        <form onSubmit={handleAuth} className="space-y-4">
          <Field name="email" label="Email" type="email" defaultValue="joinriseafrica@gmail.com" required />
          <div>
            <Field name="password" label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-burgundy">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}{showPassword ? "Hide password" : "Show password"}
            </button>
          </div>
          {message && <p className="rounded-xl bg-gold/10 p-3 text-sm text-wine">{message}</p>}
          <button type="submit" disabled={busy} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-burgundy px-5 py-4 font-semibold text-white disabled:opacity-60">
            {busy && <LoaderCircle size={18} className="animate-spin" />}
            {busy ? "Signing in..." : "Sign in to Admin"}
          </button>
          <p className="text-center text-xs leading-5 text-black/45">Need a new staff account? Ask the admin to create it in Supabase.</p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

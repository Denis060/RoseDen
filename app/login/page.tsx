"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Field } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const authMode = submitter?.value === "signup" ? "signup" : "login";
    setBusy(true);
    setMessage("");
    if (!supabase) {
      setMessage("Add Supabase keys to enable sign-in.");
      setBusy(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: "RoseDen Admin" } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (authMode === "signup" && !result.data.session) setMessage("Account created. Check your email, then return here to sign in.");
    else router.replace(params.get("next")?.startsWith("/admin") ? params.get("next")! : "/admin");
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto max-w-sm rounded-[28px] bg-white p-6 shadow-soft">
        <Link href="/" className="text-sm font-semibold text-burgundy">← Back to website</Link>
        <div className="mb-7 mt-5 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-burgundy font-display text-2xl font-bold text-white">R</div><h1 className="mt-4 font-display text-3xl font-bold text-wine">RoseDen OS</h1><p className="mt-1 text-sm text-black/50">Private staff sign in</p></div>
        <form onSubmit={handleAuth} className="space-y-4">
          <Field name="email" label="Email" type="email" defaultValue="joinriseafrica@gmail.com" required />
          <Field name="password" label="Password" type="password" required />
          {message && <p className="rounded-xl bg-gold/10 p-3 text-sm text-wine">{message}</p>}
          <button disabled={busy} value="login" className="h-13 w-full rounded-2xl bg-burgundy px-5 py-4 font-semibold text-white disabled:opacity-60">Sign in</button>
          <button disabled={busy} value="signup" className="h-12 w-full rounded-2xl border border-burgundy/20 bg-white px-5 font-semibold text-burgundy disabled:opacity-60">Create account</button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

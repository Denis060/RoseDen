"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const authMode = submitter?.value === "signup" ? "signup" : "login";
    setBusy(true);
    setMessage("");
    if (!supabase) {
      setMessage("Demo mode is active. Add Supabase keys to enable sign-in.");
      setBusy(false);
      setTimeout(() => router.push("/"), 700);
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
    else if (authMode === "signup" && !result.data.session) setMessage("Account created. Check your email to confirm sign-in, then come back here.");
    else router.push("/");
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-[28px] bg-white p-6 shadow-soft">
      <div className="mb-7 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-burgundy font-display text-2xl font-bold text-white">R</div><h1 className="mt-4 font-display text-3xl font-bold text-wine">Welcome back</h1><p className="mt-1 text-sm text-black/50">Sign in to RoseDen OS</p></div>
      <form onSubmit={handleAuth} className="space-y-4">
        <Field name="email" label="Email" type="email" defaultValue="joinriseafrica@gmail.com" required />
        <Field name="password" label="Password" type="password" required />
        {message && <p className="rounded-xl bg-gold/10 p-3 text-sm text-wine">{message}</p>}
        <button disabled={busy} value="login" className="h-13 w-full rounded-2xl bg-burgundy px-5 py-4 font-semibold text-white disabled:opacity-60">Sign in</button>
        <button disabled={busy} value="signup" className="h-12 w-full rounded-2xl border border-burgundy/20 bg-white px-5 font-semibold text-burgundy disabled:opacity-60">Create account</button>
      </form>
    </div>
  );
}

"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck, UserCog, UserRoundCheck, UserRoundX, UsersRound } from "lucide-react";
import { AdminOnly } from "@/components/admin-only";
import { Field, Form, Modal, PageHeader, Select, useModal } from "@/components/ui";
import { supabase } from "@/lib/supabase";

type StaffMember = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
  disabled: boolean;
  last_sign_in_at: string | null;
  is_current_user: boolean;
};

function StaffManagement() {
  const createModal = useModal();
  const editModal = useModal();
  const passwordModal = useModal();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const accessToken = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const token = await accessToken();
    if (!token) {
      setMessage("Your session has expired. Please sign in again.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/admin/staff", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load staff accounts.");
      setMembers(result.members as StaffMember[]);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not load staff accounts.");
    }
    setLoading(false);
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  function edit(member: StaffMember) {
    setSelected(member);
    setMessage("");
    editModal.show();
  }

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");

    const token = await accessToken();
    if (!token) {
      setMessage("Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: String(form.get("fullName")),
          email: String(form.get("email")),
          password: String(form.get("password")),
          role: String(form.get("role")),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "The staff account could not be created.");
      } else {
        createModal.hide();
        await load();
        setMessage(`${result.member.full_name} can now sign in with the starting password.`);
      }
    } catch {
      setMessage("The staff account could not be created. Check your connection and try again.");
    }
    setSaving(false);
  }

  async function changeAccount(
    payload: { action: "reset_password"; password: string } | { action: "set_disabled"; disabled: boolean }
  ) {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const token = await accessToken();
    if (!token) {
      setMessage("Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }
    try {
      const response = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: selected.id, ...payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this account.");
      passwordModal.hide();
      editModal.hide();
      await load();
      setMessage(result.message);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not update this account.");
    }
    setSaving(false);
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await changeAccount({
      action: "reset_password",
      password: String(form.get("password")),
    });
  }

  async function updateStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !selected) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    const { error } = await supabase.rpc("set_staff_access", {
      target_user_id: selected.id,
      new_full_name: String(form.get("fullName")),
      new_role: String(form.get("role")),
    });
    if (error) {
      setMessage(error.message);
    } else {
      editModal.hide();
      await load();
    }
    setSaving(false);
  }

  return (
    <div>
      <PageHeader title="Staff & Access" subtitle="Add staff and choose what each person can access." />
      <button
        onClick={() => { setMessage(""); createModal.show(); }}
        className="mb-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-burgundy font-semibold text-white shadow-soft"
      >
        <Plus size={20} /> Add staff member
      </button>

      {loading && <div className="rounded-2xl bg-white p-6 text-center text-sm text-black/50">Loading staff...</div>}
      {!loading && message && <div className="mb-4 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-wine">{message}</div>}

      <div className="space-y-3">
        {members.map((member) => (
          <article key={member.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${member.role === "admin" ? "bg-gold/20 text-burgundy" : "bg-burgundy/10 text-burgundy"}`}>
              {member.role === "admin" ? <ShieldCheck size={21} /> : <UsersRound size={21} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{member.full_name || "Name not set"}</p>
              <p className="truncate text-xs text-black/45">{member.email}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="text-gold">{member.role}</span>
                <span className={member.disabled ? "text-red-600" : "text-emerald-700"}>{member.disabled ? "Login disabled" : "Active"}</span>
              </div>
            </div>
            <button onClick={() => edit(member)} className="grid h-11 w-11 place-items-center rounded-xl border border-burgundy/15 text-burgundy" aria-label={`Edit ${member.email}`}><UserCog size={19} /></button>
          </article>
        ))}
      </div>

      {createModal.open && (
        <Modal title="Add staff member" onClose={createModal.hide}>
          <Form onSubmit={createStaff} submitLabel={saving ? "Creating account..." : "Create staff account"} submitDisabled={saving}>
            <Field name="fullName" label="Full name" autoComplete="name" required />
            <Field name="email" label="Email address" type="email" autoComplete="off" inputMode="email" required />
            <Field name="password" label="Starting password" type="password" autoComplete="new-password" minLength={8} required />
            <Select name="role" label="Access level" defaultValue="staff">
              <option value="staff">Staff - daily operations</option>
              <option value="admin">Admin - full access</option>
            </Select>
            <div className="rounded-xl bg-white p-3 text-xs leading-5 text-black/55">
              Share the email and starting password privately. The new staff member can sign in immediately.
            </div>
            {message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}
          </Form>
        </Modal>
      )}

      {editModal.open && selected && (
        <Modal title="Edit staff access" onClose={editModal.hide}>
          <Form onSubmit={updateStaff} submitLabel={saving ? "Saving access..." : "Save access"} submitDisabled={saving}>
            <div className="rounded-xl bg-white p-3 text-sm text-black/55">{selected.email}</div>
            <Field name="fullName" label="Staff name" defaultValue={selected.full_name} required />
            <Select name="role" label="Access level" defaultValue={selected.role}>
              <option value="staff">Staff - daily operations</option>
              <option value="admin">Admin - full access</option>
            </Select>
            <div className="rounded-xl bg-cream p-3 text-xs leading-5 text-black/55">
              Staff can manage customers, orders, payments, order status, and expenses. Admins also manage inventory, buying trips, reports, website settings, activity history, deletions, and staff access.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { editModal.hide(); passwordModal.show(); }} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-burgundy/15 bg-white px-3 text-xs font-semibold text-burgundy"><KeyRound size={17} />Reset password</button>
              <button
                type="button"
                disabled={saving || (selected.is_current_user && !selected.disabled)}
                onClick={() => changeAccount({ action: "set_disabled", disabled: !selected.disabled })}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${selected.disabled ? "bg-emerald-700 text-white" : "bg-red-700 text-white"}`}
              >
                {selected.disabled ? <UserRoundCheck size={17} /> : <UserRoundX size={17} />}
                {selected.disabled ? "Restore login" : "Disable login"}
              </button>
            </div>
            {selected.is_current_user && !selected.disabled && <p className="text-center text-[11px] text-black/45">You cannot disable the account you are currently using.</p>}
            {message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}
          </Form>
        </Modal>
      )}

      {passwordModal.open && selected && (
        <Modal title="Set temporary password" onClose={passwordModal.hide}>
          <Form onSubmit={resetPassword} submitLabel={saving ? "Updating password..." : "Update password"} submitDisabled={saving}>
            <div className="rounded-xl bg-white p-3 text-sm text-black/55">{selected.full_name}<span className="mt-1 block text-xs">{selected.email}</span></div>
            <Field name="password" label="New temporary password" type="password" autoComplete="new-password" minLength={8} required />
            <p className="rounded-xl bg-gold/10 p-3 text-xs leading-5 text-wine">Tell the staff member this password privately. Their old password will stop working immediately.</p>
            {message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}
          </Form>
        </Modal>
      )}
    </div>
  );
}

export default function StaffPage() {
  return <AdminOnly><StaffManagement /></AdminOnly>;
}

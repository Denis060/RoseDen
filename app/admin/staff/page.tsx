"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { AdminOnly } from "@/components/admin-only";
import { Field, Form, Modal, PageHeader, Select, useModal } from "@/components/ui";
import { supabase } from "@/lib/supabase";

type StaffMember = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "staff";
  created_at: string;
};

function StaffManagement() {
  const modal = useModal();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("list_staff_members");
    if (error) {
      setMessage(["PGRST202", "42883"].includes(error.code)
        ? "Run migration 011_staff_roles_and_permissions.sql to enable staff management."
        : error.message);
    } else {
      setMembers((data || []) as StaffMember[]);
      setMessage("");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function edit(member: StaffMember) {
    setSelected(member);
    setMessage("");
    modal.show();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
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
      modal.hide();
      await load();
    }
    setSaving(false);
  }

  return (
    <div>
      <PageHeader title="Staff & Access" subtitle="Keep daily work simple while protecting sensitive controls." />
      <div className="mb-6 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-wine">
        <p className="font-semibold">Adding a new staff member</p>
        <p className="mt-1 text-xs leading-5 text-black/55">Create their email and temporary password in Supabase Authentication → Users. They will appear here automatically as Staff.</p>
      </div>

      {loading && <div className="rounded-2xl bg-white p-6 text-center text-sm text-black/50">Loading staff...</div>}
      {!loading && message && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{message}</div>}

      <div className="space-y-3">
        {members.map((member) => (
          <article key={member.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${member.role === "admin" ? "bg-gold/20 text-burgundy" : "bg-burgundy/10 text-burgundy"}`}>
              {member.role === "admin" ? <ShieldCheck size={21} /> : <UsersRound size={21} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{member.full_name || "Name not set"}</p>
              <p className="truncate text-xs text-black/45">{member.email}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gold">{member.role}</p>
            </div>
            <button onClick={() => edit(member)} className="grid h-11 w-11 place-items-center rounded-xl border border-burgundy/15 text-burgundy" aria-label={`Edit ${member.email}`}><UserCog size={19} /></button>
          </article>
        ))}
      </div>

      {modal.open && selected && (
        <Modal title="Edit staff access" onClose={modal.hide}>
          <Form onSubmit={submit} submitLabel={saving ? "Saving access..." : "Save access"} submitDisabled={saving}>
            <div className="rounded-xl bg-white p-3 text-sm text-black/55">{selected.email}</div>
            <Field name="fullName" label="Staff name" defaultValue={selected.full_name} required />
            <Select name="role" label="Access level" defaultValue={selected.role}>
              <option value="staff">Staff - daily operations</option>
              <option value="admin">Admin - full access</option>
            </Select>
            <div className="rounded-xl bg-cream p-3 text-xs leading-5 text-black/55">
              Staff can manage customers, orders, payments, order status, and expenses. Admins also manage inventory, buying trips, reports, website settings, activity history, deletions, and staff access.
            </div>
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


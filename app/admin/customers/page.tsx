"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { MapPin, Phone, Ruler, Trash2 } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Empty, Field, Form, Modal, PageHeader, useModal } from "@/components/ui";
import { money } from "@/lib/format";

export default function CustomersPage() {
  const { data, addCustomer, remove } = useData();
  const modal = useModal();
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const customers = data.customers.filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(query.toLowerCase()));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await addCustomer({
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        address: String(form.get("address")),
        notes: String(form.get("notes")),
        measurements: {
          bust: Number(form.get("bust")),
          waist: Number(form.get("waist")),
          hips: Number(form.get("hips")),
          shoulder: Number(form.get("shoulder")),
          height: Number(form.get("height")),
        },
      });
      modal.hide();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${data.customers.length} people in your RoseDen circle`} action={modal.show} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or phone" className="mb-5 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none focus:border-gold" />
      <div className="space-y-3">
        {customers.length === 0 && <Empty>No customers found.</Empty>}
        {customers.map((customer) => {
          const orders = data.orders.filter((order) => order.customerId === customer.id);
          const spent = orders.reduce((sum, order) => sum + order.paid, 0);
          return (
            <article key={customer.id} className="rounded-2xl bg-white p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-burgundy/10 font-display text-xl font-bold text-burgundy">{customer.name[0]}</div>
                <div className="min-w-0 flex-1"><h2 className="font-semibold">{customer.name}</h2><p className="mt-1 flex items-center gap-1 text-xs text-black/50"><Phone size={13} />{customer.phone}</p><p className="mt-1 flex items-center gap-1 text-xs text-black/50"><MapPin size={13} />{customer.address}</p></div>
                <button onClick={() => remove("customers", customer.id)} className="p-2 text-black/25" aria-label="Delete customer"><Trash2 size={17} /></button>
              </div>
              <div className="mt-4 grid grid-cols-3 border-t border-black/5 pt-3 text-center"><div><p className="text-xs text-black/45">Orders</p><p className="font-bold text-burgundy">{orders.length}</p></div><div><p className="text-xs text-black/45">Paid</p><p className="font-bold text-burgundy">{money(spent)}</p></div><div><p className="flex items-center justify-center gap-1 text-xs text-black/45"><Ruler size={12} />Bust</p><p className="font-bold text-burgundy">{customer.measurements?.bust || "-"} in</p></div></div>
              <Link href={`/admin/customers/${customer.id}`} className="mt-3 flex h-11 items-center justify-center rounded-xl border border-burgundy/15 font-semibold text-burgundy">Open customer details</Link>
            </article>
          );
        })}
      </div>
      {modal.open && <Modal title="Add customer" onClose={modal.hide}><Form onSubmit={submit} submitLabel={saving ? "Saving customer..." : "Save customer"} submitDisabled={saving}><Field name="name" label="Full name" required /><Field name="phone" label="Phone / WhatsApp" required /><Field name="address" label="Address / location" /><Field name="notes" label="Notes" /><div className="grid grid-cols-2 gap-3"><Field name="bust" label="Bust (inches)" type="number" step="0.1" /><Field name="waist" label="Waist" type="number" step="0.1" /><Field name="hips" label="Hips" type="number" step="0.1" /><Field name="shoulder" label="Shoulder" type="number" step="0.1" /><Field name="height" label="Height" type="number" step="0.1" /></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}</Form></Modal>}
    </div>
  );
}

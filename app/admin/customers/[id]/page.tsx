"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Cake, MapPin, Pencil, Phone, Ruler } from "lucide-react";
import { useParams } from "next/navigation";
import { useData } from "@/components/data-provider";
import { FollowUpHistory } from "@/components/follow-up-history";
import { WhatsAppFollowUp } from "@/components/whatsapp-follow-up";
import { Empty, Field, Form, Modal, useModal } from "@/components/ui";
import { money, shortDate } from "@/lib/format";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, updateCustomer } = useData();
  const modal = useModal();
  const [error, setError] = useState("");
  const [historyKey, setHistoryKey] = useState(0);
  const customer = data.customers.find((entry) => entry.id === params.id);

  if (!customer) {
    return <div><Link href="/admin/customers" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Customers</Link><Empty>Customer not found.</Empty></div>;
  }

  const orders = data.orders.filter((order) => order.customerId === customer.id);
  const paid = orders.reduce((sum, order) => sum + order.paid, 0);
  const balance = orders.reduce((sum, order) => sum + Math.max(0, order.total - order.paid), 0);
  const balanceOrder = orders.find((order) => order.total > order.paid && order.status !== "cancelled");
  const measurements = customer.measurements;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await updateCustomer(customer!.id, {
        name: String(form.get("name")), phone: String(form.get("phone")), address: String(form.get("address")), notes: String(form.get("notes")), birthday: String(form.get("birthday")) || undefined,
        measurements: { bust: Number(form.get("bust")), waist: Number(form.get("waist")), hips: Number(form.get("hips")), shoulder: Number(form.get("shoulder")), height: Number(form.get("height")) },
      });
      modal.hide();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this customer.");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Customers</Link>
        <div className="flex items-start justify-between gap-3"><div><h1 className="font-display text-3xl font-semibold text-wine">{customer.name}</h1><p className="mt-2 flex items-center gap-2 text-sm text-black/55"><Phone size={15} />{customer.phone}</p><p className="mt-1 flex items-center gap-2 text-sm text-black/55"><MapPin size={15} />{customer.address || "No location saved"}</p>{customer.birthday && <p className="mt-1 flex items-center gap-2 text-sm text-black/55"><Cake size={15} />{new Date(`${customer.birthday}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>}</div><button onClick={modal.show} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-burgundy text-white" aria-label="Edit customer"><Pencil size={19} /></button></div>
      </div>

      <section className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-4 text-center shadow-soft"><div><p className="text-xs text-black/45">Orders</p><p className="mt-1 font-bold text-burgundy">{orders.length}</p></div><div><p className="text-xs text-black/45">Paid</p><p className="mt-1 font-bold text-emerald-700">{money(paid)}</p></div><div><p className="text-xs text-black/45">Balance</p><p className="mt-1 font-bold text-burgundy">{money(balance)}</p></div></section>

      <section className="rounded-2xl bg-white p-4 shadow-soft"><h2 className="font-display text-xl font-semibold text-wine">Stay connected</h2><p className="mt-1 text-xs text-black/45">Review the message before WhatsApp opens.</p><WhatsAppFollowUp customer={customer} order={balanceOrder} type={balanceOrder ? "balance" : "general"} label={balanceOrder ? "Send balance reminder" : "Message on WhatsApp"} onLogged={() => setHistoryKey((value) => value + 1)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white" /></section>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-wine"><Ruler size={19} className="text-gold" />Measurements</h2>
        <div className="mt-4 grid grid-cols-5 gap-2 text-center">{(["bust", "waist", "hips", "shoulder", "height"] as const).map((key) => <div key={key}><p className="text-[10px] capitalize text-black/45">{key}</p><p className="mt-1 text-sm font-bold text-burgundy">{measurements?.[key] || "-"}</p></div>)}</div>
        {customer.notes && <p className="mt-4 rounded-xl bg-cream p-3 text-sm text-black/65">{customer.notes}</p>}
      </section>

      <section><h2 className="font-display text-xl font-semibold text-wine">Order history</h2><div className="mt-3 space-y-3">{orders.length === 0 && <Empty>No orders for this customer yet.</Empty>}{orders.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-2xl bg-white p-4 shadow-soft"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{order.description}</p><p className="mt-1 text-xs capitalize text-black/45">{order.status} - {shortDate(order.createdAt)}</p></div><p className="font-bold text-burgundy">{money(order.total)}</p></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, order.total ? (order.paid / order.total) * 100 : 0)}%` }} /></div></Link>)}</div></section>

      <section className="rounded-2xl bg-white p-4 shadow-soft"><h2 className="font-display text-xl font-semibold text-wine">Follow-up history</h2><div className="mt-3"><FollowUpHistory customerId={customer.id} refreshKey={historyKey} /></div></section>

      {modal.open && <Modal title="Edit customer" onClose={modal.hide}><Form onSubmit={submit} submitLabel="Save customer"><Field name="name" label="Full name" defaultValue={customer.name} required /><Field name="phone" label="Phone / WhatsApp" defaultValue={customer.phone} required /><Field name="address" label="Address / location" defaultValue={customer.address} /><Field name="birthday" label="Birthday (optional)" type="date" defaultValue={customer.birthday || ""} /><Field name="notes" label="Notes" defaultValue={customer.notes} /><div className="grid grid-cols-2 gap-3"><Field name="bust" label="Bust (inches)" type="number" step="0.1" defaultValue={measurements?.bust || ""} /><Field name="waist" label="Waist" type="number" step="0.1" defaultValue={measurements?.waist || ""} /><Field name="hips" label="Hips" type="number" step="0.1" defaultValue={measurements?.hips || ""} /><Field name="shoulder" label="Shoulder" type="number" step="0.1" defaultValue={measurements?.shoulder || ""} /><Field name="height" label="Height" type="number" step="0.1" defaultValue={measurements?.height || ""} /></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}</Form></Modal>}
    </div>
  );
}

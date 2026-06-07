"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CalendarDays, CreditCard, MapPin, Package, Pencil, Phone, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useData } from "@/components/data-provider";
import { Empty, Field, Form, Modal, Select, useModal } from "@/components/ui";
import { money, shortDate } from "@/lib/format";
import { OrderStatus, OrderType, SalesChannel } from "@/lib/types";

const statuses: OrderStatus[] = ["pending", "in progress", "ready", "delivered", "cancelled"];
const channels: SalesChannel[] = ["WhatsApp Status", "Facebook", "TikTok", "Instagram", "Referral", "Walk-in", "Existing Customer", "Website"];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, updateOrder, addPayment } = useData();
  const editModal = useModal();
  const paymentModal = useModal();
  const [error, setError] = useState("");
  const order = data.orders.find((entry) => entry.id === params.id);

  if (!order) {
    return <div><Link href="/orders" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Orders</Link><Empty>Order not found.</Empty></div>;
  }

  const customer = data.customers.find((entry) => entry.id === order.customerId);
  const product = data.inventory.find((entry) => entry.id === order.inventoryId);
  const balance = Math.max(0, order.total - order.paid);

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await updateOrder(order!.id, {
        customerId: String(form.get("customerId")),
        description: String(form.get("description")),
        type: String(form.get("type")) as OrderType,
        total: Number(form.get("total")),
        cost: Number(form.get("cost")),
        dueDate: String(form.get("dueDate")),
        status: String(form.get("status")) as OrderStatus,
        notes: String(form.get("notes")),
        inventoryId: String(form.get("inventoryId")) || undefined,
        quantity: Number(form.get("quantity")) || 1,
        channel: String(form.get("channel")) as SalesChannel,
        color: String(form.get("color")),
        size: String(form.get("size")),
        deliveryPlan: String(form.get("deliveryPlan")) as "pickup" | "delivery",
      });
      editModal.hide();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this order.");
    }
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    if (amount <= 0 || amount > balance) {
      setError(`Enter an amount between NLe 0.01 and ${money(balance)}.`);
      return;
    }
    try {
      await addPayment(order!.id, { amount, method: String(form.get("method")), notes: String(form.get("notes")) });
      paymentModal.hide();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add this payment.");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/orders" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Orders</Link>
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-gold">{order.type} - {order.channel}</p><h1 className="mt-1 font-display text-3xl font-semibold text-wine">{order.description}</h1><p className="mt-2 text-sm capitalize text-black/50">{order.status}</p></div>
          <button onClick={editModal.show} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-burgundy text-white" aria-label="Edit order"><Pencil size={19} /></button>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-xs text-black/45">Total</p><p className="mt-1 font-bold">{money(order.total)}</p></div>
          <div><p className="text-xs text-black/45">Paid</p><p className="mt-1 font-bold text-emerald-700">{money(order.paid)}</p></div>
          <div><p className="text-xs text-black/45">Balance</p><p className="mt-1 font-bold text-burgundy">{money(balance)}</p></div>
        </div>
        {balance > 0 && <button onClick={paymentModal.show} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold font-semibold text-wine"><CreditCard size={18} />Add payment</button>}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="font-display text-xl font-semibold text-wine">Order details</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex gap-3"><UserRound className="mt-0.5 text-gold" size={18} /><div><p className="font-semibold">{customer?.name || "Walk-in customer"}</p>{customer && <><p className="mt-1 flex items-center gap-1 text-xs text-black/50"><Phone size={12} />{customer.phone}</p><p className="mt-1 flex items-center gap-1 text-xs text-black/50"><MapPin size={12} />{customer.address}</p></>}</div></div>
          <div className="flex gap-3"><Package className="mt-0.5 text-gold" size={18} /><div><p className="font-semibold">{product?.name || order.description}</p><p className="mt-1 text-xs text-black/50">{order.quantity} item(s) - {order.color || "No color"} - {order.size || "No size"}</p></div></div>
          <div className="flex gap-3"><CalendarDays className="mt-0.5 text-gold" size={18} /><div><p className="font-semibold capitalize">{order.deliveryPlan}</p><p className="mt-1 text-xs text-black/50">Due {shortDate(order.dueDate)}</p></div></div>
          {order.notes && <p className="rounded-xl bg-cream p-3 text-black/65">{order.notes}</p>}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="font-display text-xl font-semibold text-wine">Payment history</h2>
        <div className="mt-3 space-y-2">
          {order.payments.length === 0 && <p className="text-sm text-black/45">No payments recorded yet.</p>}
          {order.payments.map((payment) => <div key={payment.id} className="flex items-center justify-between rounded-xl bg-cream p-3"><div><p className="text-sm font-semibold capitalize">{payment.method}</p><p className="text-xs text-black/45">{shortDate(payment.paidAt)}{payment.notes ? ` - ${payment.notes}` : ""}</p></div><p className="font-bold text-emerald-700">{money(payment.amount)}</p></div>)}
        </div>
      </section>

      {editModal.open && <Modal title="Edit order" onClose={editModal.hide}><Form onSubmit={submitEdit} submitLabel="Save changes">
        <Select name="customerId" label="Customer" defaultValue={order.customerId}><option value="">Walk-in customer</option>{data.customers.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</Select>
        <Select name="inventoryId" label="Inventory product" defaultValue={order.inventoryId || ""}><option value="">Not linked to inventory</option>{data.inventory.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({entry.availableQuantity} available)</option>)}</Select>
        <Field name="description" label="Description" defaultValue={order.description} required />
        <div className="grid grid-cols-2 gap-3"><Select name="type" label="Type" defaultValue={order.type}><option value="tailoring">Tailoring</option><option value="ready-made">Ready-made</option><option value="original">RoseDen Original</option></Select><Select name="status" label="Status" defaultValue={order.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></div>
        <div className="grid grid-cols-3 gap-3"><Field name="quantity" label="Qty" type="number" min="1" defaultValue={order.quantity} required /><Field name="color" label="Color" defaultValue={order.color} /><Field name="size" label="Size" defaultValue={order.size} /></div>
        <div className="grid grid-cols-2 gap-3"><Field name="total" label="Total (NLe)" type="number" min="0" step="0.01" defaultValue={order.total} required /><Field name="cost" label="Cost (NLe)" type="number" min="0" step="0.01" defaultValue={order.cost} /></div>
        <Select name="channel" label="Marketing channel" defaultValue={order.channel}>{channels.map((channel) => <option key={channel}>{channel}</option>)}</Select>
        <div className="grid grid-cols-2 gap-3"><Select name="deliveryPlan" label="Plan" defaultValue={order.deliveryPlan}><option value="pickup">Pickup</option><option value="delivery">Delivery</option></Select><Field name="dueDate" label="Due date" type="date" defaultValue={order.dueDate} /></div>
        <Field name="notes" label="Notes" defaultValue={order.notes} />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      </Form></Modal>}

      {paymentModal.open && <Modal title="Add payment" onClose={paymentModal.hide}><Form onSubmit={submitPayment} submitLabel="Record payment">
        <div className="rounded-xl bg-gold/10 p-3 text-sm">Outstanding balance: <strong>{money(balance)}</strong></div>
        <Field name="amount" label="Amount received (NLe)" type="number" min="0.01" max={balance} step="0.01" required />
        <Select name="method" label="Payment method"><option>cash</option><option>Orange Money</option><option>Afrimoney</option><option>bank transfer</option><option>card</option><option>other</option></Select>
        <Field name="notes" label="Payment note" placeholder="Deposit, final balance..." />
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      </Form></Modal>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useData } from "@/components/data-provider";
import { ReceiptActions } from "@/components/receipt-actions";
import { Empty } from "@/components/ui";
import { money, shortDate } from "@/lib/format";

export default function ReceiptPage() {
  const params = useParams<{ id: string }>();
  const { data } = useData();
  const order = data.orders.find((entry) => entry.id === params.id);

  if (!order) {
    return <Empty>Receipt not found.</Empty>;
  }

  const customer = data.customers.find((entry) => entry.id === order.customerId);
  const balance = Math.max(0, order.total - order.paid);
  const receiptNumber = `RD-${order.id.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const message = [
    "RoseDen Atelier receipt",
    `Receipt: ${receiptNumber}`,
    `Customer: ${customer?.name || "Walk-in customer"}`,
    `Item: ${order.description}`,
    `Total: ${money(order.total)}`,
    `Paid: ${money(order.paid)}`,
    `Balance: ${money(balance)}`,
    "Thank you for choosing RoseDen Atelier.",
  ].join("\n");

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy print:hidden">
        <ArrowLeft size={18} />Back to order
      </Link>

      <ReceiptActions whatsappText={message} phone={customer?.phone} />

      <article className="rounded-2xl bg-white p-5 shadow-soft print:rounded-none print:p-0 print:shadow-none">
        <header className="border-b border-gold/30 pb-5 text-center">
          <p className="font-display text-3xl font-bold text-burgundy">RoseDen Atelier</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Tailored · Curated · Original</p>
          <p className="mt-4 text-sm font-semibold text-wine">Payment Receipt</p>
          <p className="mt-1 text-xs text-black/45">{receiptNumber}</p>
        </header>

        <section className="grid grid-cols-2 gap-4 border-b border-black/10 py-5 text-sm">
          <div><p className="text-xs text-black/45">Customer</p><p className="mt-1 font-semibold">{customer?.name || "Walk-in customer"}</p><p className="text-xs text-black/50">{customer?.phone}</p></div>
          <div className="text-right"><p className="text-xs text-black/45">Order date</p><p className="mt-1 font-semibold">{shortDate(order.createdAt)}</p><p className="text-xs capitalize text-black/50">{order.status}</p></div>
        </section>

        <section className="border-b border-black/10 py-5">
          <div className="flex items-start justify-between gap-4">
            <div><p className="font-semibold">{order.description}</p><p className="mt-1 text-xs text-black/50">{order.quantity} item(s) · {order.color || "No color"} · {order.size || "No size"}</p></div>
            <p className="shrink-0 font-bold">{money(order.total)}</p>
          </div>
        </section>

        <section className="space-y-2 py-5 text-sm">
          <div className="flex justify-between"><span className="text-black/55">Total</span><strong>{money(order.total)}</strong></div>
          <div className="flex justify-between"><span className="text-black/55">Amount paid</span><strong className="text-emerald-700">{money(order.paid)}</strong></div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-base"><span>Balance owed</span><strong className="text-burgundy">{money(balance)}</strong></div>
        </section>

        {order.payments.length > 0 && (
          <section className="border-t border-black/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Payment history</p>
            <div className="mt-3 space-y-2">
              {order.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between text-xs">
                  <span>{shortDate(payment.paidAt)} · {payment.method}</span>
                  <strong>{money(payment.amount)}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-7 border-t border-gold/30 pt-5 text-center text-xs text-black/50">
          <p className="font-semibold text-burgundy">Thank you for choosing RoseDen Atelier.</p>
          <p className="mt-1">Makeni, Bombali District, Sierra Leone</p>
        </footer>
      </article>
    </div>
  );
}


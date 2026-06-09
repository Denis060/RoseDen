"use client";

import { Suspense, useEffect, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useData } from "@/components/data-provider";
import { OrderEntryForm } from "@/components/order-entry-form";
import { Modal, PageHeader, useModal } from "@/components/ui";
import { money, shortDate } from "@/lib/format";
import { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = ["pending", "in progress", "ready", "delivered", "cancelled"];

function OrdersContent() {
  const { data, isAdmin, updateOrderStatus, remove } = useData();
  const modal = useModal();
  const params = useSearchParams();
  const quickSocial = params.get("status") === "1";
  const initialProductId = params.get("product") || undefined;
  const inquiryId = params.get("inquiry") || undefined;
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (params.get("new") === "1" || quickSocial || initialProductId) modal.show();
  }, [initialProductId, params, quickSocial]);

  function closeForm() {
    modal.hide();
    setFormKey((current) => current + 1);
    window.history.replaceState({}, "", "/admin/orders");
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${data.orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length} active orders`} action={modal.show} />
      <div className="space-y-3">
        {data.orders.map((order) => {
          const balance = order.total - order.paid;
          return (
            <article key={order.id} className="rounded-2xl bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold">{order.type} · {order.channel}</p>
                  <h2 className="mt-1 truncate font-semibold">{order.description}</h2>
                  <p className="mt-1 text-xs text-black/45">{data.customers.find((customer) => customer.id === order.customerId)?.name || "Walk-in customer"} · {order.size || "No size"} · {order.color || "No color"}</p>
                </div>
                {isAdmin && <button onClick={() => remove("orders", order.id)} className="p-2 text-black/25"><Trash2 size={17} /></button>}
              </div>
              <div className="mt-4 grid grid-cols-3 border-y border-black/5 py-3">
                <div><p className="text-[11px] text-black/40">Total</p><p className="text-sm font-bold">{money(order.total)}</p></div>
                <div><p className="text-[11px] text-black/40">Paid</p><p className="text-sm font-bold text-emerald-700">{money(order.paid)}</p></div>
                <div><p className="text-[11px] text-black/40">Balance</p><p className="text-sm font-bold text-burgundy">{money(balance)}</p></div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="flex items-center gap-1 text-xs text-black/45"><CalendarDays size={14} />{order.deliveryPlan} · {shortDate(order.dueDate)}</p>
                <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)} className="h-10 rounded-xl bg-burgundy/10 px-3 text-xs font-bold capitalize text-burgundy">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
              </div>
              <Link href={`/admin/orders/${order.id}`} className="mt-3 flex h-11 items-center justify-center rounded-xl border border-burgundy/15 font-semibold text-burgundy">Open order details</Link>
            </article>
          );
        })}
      </div>

      {modal.open && (
        <Modal title={quickSocial ? "Record social order" : initialProductId ? "Convert inquiry to order" : "New order"} onClose={closeForm}>
          <OrderEntryForm key={formKey} quickSocial={quickSocial} initialProductId={initialProductId} inquiryId={inquiryId} onSaved={closeForm} />
        </Modal>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return <Suspense><OrdersContent /></Suspense>;
}

"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Search, Sparkles, Trash2, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useData } from "@/components/data-provider";
import { Field, Form, Modal, PageHeader, Select, useModal } from "@/components/ui";
import { money, shortDate } from "@/lib/format";
import { OrderStatus, OrderType, SalesChannel } from "@/lib/types";

const statuses: OrderStatus[] = ["pending", "in progress", "ready", "delivered", "cancelled"];
const channels: SalesChannel[] = ["WhatsApp Status", "Facebook", "TikTok", "Instagram", "Referral", "Walk-in", "Existing Customer", "Website"];

function OrdersContent() {
  const { data, addOrder, addStatusOrder, updateOrderStatus, remove } = useData();
  const modal = useModal();
  const params = useSearchParams();
  const quickSocial = params.get("status") === "1";
  const [customerQuery, setCustomerQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState("");
  const [cost, setCost] = useState("");
  const [formError, setFormError] = useState("");
  useEffect(() => { if (params.get("new") === "1" || quickSocial) modal.show(); }, [params, quickSocial]);

  const customerMatches = useMemo(() => {
    const query = `${customerQuery} ${phone}`.trim().toLowerCase();
    if (!query || selectedCustomerId) return [];
    const phoneDigits = phone.replace(/\D/g, "");
    return data.customers.filter((customer) =>
      (customerQuery.trim().length > 0 && customer.name.toLowerCase().includes(customerQuery.toLowerCase())) ||
      (phoneDigits.length >= 3 && customer.phone.replace(/\D/g, "").includes(phoneDigits))
    ).slice(0, 4);
  }, [customerQuery, phone, selectedCustomerId, data.customers]);

  const productMatches = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (!query || selectedInventoryId) return [];
    return data.inventory.filter((item) =>
      item.quantity > 0 &&
      item.status !== "cancelled" &&
      `${item.name} ${item.category} ${item.color} ${item.size}`.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [productQuery, selectedInventoryId, data.inventory]);

  const selectedCustomer = data.customers.find((customer) => customer.id === selectedCustomerId);
  const selectedProduct = data.inventory.find((item) => item.id === selectedInventoryId);
  const customerOrders = selectedCustomer ? data.orders.filter((order) => order.customerId === selectedCustomer.id) : [];
  const customerBalance = customerOrders.reduce((sum, order) => sum + Math.max(0, order.total - order.paid), 0);

  function chooseCustomer(customerId: string) {
    const customer = data.customers.find((entry) => entry.id === customerId);
    if (!customer) return;
    setSelectedCustomerId(customer.id);
    setCustomerQuery(customer.name);
    setPhone(customer.phone);
  }

  function chooseProduct(inventoryId: string) {
    const item = data.inventory.find((entry) => entry.id === inventoryId);
    if (!item) return;
    setSelectedInventoryId(item.id);
    setProductQuery(item.name);
    setDescription(item.name);
    setColor(item.color);
    setSize(item.size);
    setQuantity(1);
    setTotal(String(item.sellingPrice));
    setCost(String(item.costPrice));
    setFormError("");
  }

  function changeQuantity(next: number) {
    const safeQuantity = Math.max(1, next);
    setQuantity(safeQuantity);
    if (selectedProduct) {
      setTotal(String(selectedProduct.sellingPrice * safeQuantity));
      setCost(String(selectedProduct.costPrice * safeQuantity));
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const inventoryId = quickSocial ? selectedInventoryId : String(f.get("inventoryId") || "");
    const inventory = data.inventory.find((item) => item.id === inventoryId);
    if (quickSocial && !inventory) {
      setFormError("Choose an existing product from the suggestions. Add genuinely new products in Inventory first.");
      return;
    }
    if (inventory && Number(f.get("quantity") || 1) > inventory.quantity) {
      setFormError(`Only ${inventory.quantity} ${inventory.name} currently available.`);
      return;
    }
    const order = {
      description: String(f.get("description")) || inventory?.name || "",
      type: String(f.get("type")) as OrderType,
      total: Number(f.get("total")),
      paid: Number(f.get("paid")),
      cost: Number(f.get("cost")) || (inventory?.costPrice || 0) * Number(f.get("quantity") || 1),
      dueDate: String(f.get("dueDate")),
      status: String(f.get("status")) as OrderStatus,
      notes: String(f.get("notes")),
      inventoryId: inventoryId || undefined,
      quantity: Number(f.get("quantity") || 1),
      channel: String(f.get("channel")) as SalesChannel,
      color: String(f.get("color")) || inventory?.color || "",
      size: String(f.get("size")) || inventory?.size || "",
      deliveryPlan: String(f.get("deliveryPlan")) as "pickup" | "delivery",
    };

    if (quickSocial) {
      addStatusOrder({ id: selectedCustomerId || undefined, name: String(f.get("customerName")), phone: String(f.get("phone")) }, order);
    } else {
      addOrder({ ...order, customerId: String(f.get("customerId")) });
    }
    modal.hide();
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold">{order.type} • {order.channel}</p>
                  <h2 className="mt-1 truncate font-semibold">{order.description}</h2>
                  <p className="mt-1 text-xs text-black/45">{data.customers.find((customer) => customer.id === order.customerId)?.name || "Walk-in customer"} • {order.size || "No size"} • {order.color || "No color"}</p>
                </div>
                <button onClick={() => remove("orders", order.id)} className="p-2 text-black/25"><Trash2 size={17} /></button>
              </div>
              <div className="mt-4 grid grid-cols-3 border-y border-black/5 py-3">
                <div><p className="text-[11px] text-black/40">Total</p><p className="text-sm font-bold">{money(order.total)}</p></div>
                <div><p className="text-[11px] text-black/40">Paid</p><p className="text-sm font-bold text-emerald-700">{money(order.paid)}</p></div>
                <div><p className="text-[11px] text-black/40">Balance</p><p className="text-sm font-bold text-burgundy">{money(balance)}</p></div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="flex items-center gap-1 text-xs text-black/45"><CalendarDays size={14} />{order.deliveryPlan} • {shortDate(order.dueDate)}</p>
                <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)} className="h-10 rounded-xl bg-burgundy/10 px-3 text-xs font-bold capitalize text-burgundy">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
              </div>
              <Link href={`/admin/orders/${order.id}`} className="mt-3 flex h-11 items-center justify-center rounded-xl border border-burgundy/15 font-semibold text-burgundy">Open order details</Link>
            </article>
          );
        })}
      </div>

      {modal.open && (
        <Modal title={quickSocial ? "Record status/social order" : "New sale or order"} onClose={modal.hide}>
          <Form onSubmit={submit} submitLabel={quickSocial ? "Reserve product" : "Record order"}>
            {quickSocial ? (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-ink">Find customer by name or phone</label>
                  <div className="mt-1.5 flex items-center rounded-xl border border-black/10 bg-white px-3 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15"><Search size={17} className="text-black/35" /><input name="customerName" value={customerQuery} onChange={(event) => { setCustomerQuery(event.target.value); setSelectedCustomerId(""); }} placeholder="Start typing a customer name" className="h-12 min-w-0 flex-1 bg-transparent px-2 outline-none" required /></div>
                  {customerMatches.length > 0 && <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">{customerMatches.map((customer) => <button key={customer.id} type="button" onClick={() => chooseCustomer(customer.id)} className="flex w-full items-center gap-3 border-b border-black/5 p-3 text-left last:border-0"><span className="grid h-9 w-9 place-items-center rounded-full bg-burgundy/10 font-bold text-burgundy">{customer.name[0]}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{customer.name}</strong><small className="text-black/45">{customer.phone}</small></span><Check size={16} className="text-gold" /></button>)}</div>}
                </div>
                <Field name="phone" label="Phone / WhatsApp" value={phone} onChange={(event) => {
                  const value = event.target.value;
                  setPhone(value);
                  const digits = value.replace(/\D/g, "").slice(-8);
                  const match = digits.length >= 6 ? data.customers.find((customer) => customer.phone.replace(/\D/g, "").slice(-8) === digits) : undefined;
                  if (match) chooseCustomer(match.id);
                  else setSelectedCustomerId("");
                }} placeholder="+232…" required />
                {selectedCustomer && <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700"><UserRound size={19} /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-emerald-900">Existing customer found</p><p className="text-xs text-emerald-800/70">{customerOrders.length} previous orders • {money(customerBalance)} outstanding</p></div></div>}
              </>
            ) : (
              <Select name="customerId" label="Customer" required><option value="">Select customer</option>{data.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</Select>
            )}
            <Select name="channel" label="Where did the customer find it?" defaultValue={quickSocial ? "WhatsApp Status" : "Walk-in"}>{channels.map((channel) => <option key={channel}>{channel}</option>)}</Select>
            {quickSocial ? <div className="relative"><label className="block text-sm font-medium text-ink">Find product</label><div className="mt-1.5 flex items-center rounded-xl border border-black/10 bg-white px-3 focus-within:border-gold"><Search size={17} className="text-black/35" /><input value={productQuery} onChange={(event) => { setProductQuery(event.target.value); setSelectedInventoryId(""); }} placeholder="Type product, color, size…" className="h-12 min-w-0 flex-1 bg-transparent px-2 outline-none" required /></div>{productMatches.length > 0 && <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">{productMatches.map((item) => <button key={item.id} type="button" onClick={() => chooseProduct(item.id)} className="flex w-full items-center gap-3 border-b border-black/5 p-3 text-left last:border-0"><span className="grid h-10 w-10 place-items-center rounded-lg bg-gold/10 text-xs font-bold text-gold">{item.quantity}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.name}</strong><small className="text-black/45">{item.color} • {item.size} • {money(item.sellingPrice)}</small></span></button>)}</div>}{selectedProduct && <div className="mt-2 flex items-center justify-between rounded-xl bg-gold/10 p-3 text-xs"><span><strong className="block text-sm text-wine">{selectedProduct.quantity} in stock</strong>{selectedProduct.supplier}</span><span className="font-bold text-burgundy">{money(selectedProduct.sellingPrice)}</span></div>}</div> : <Select name="inventoryId" label="Product"><option value="">Not linked to inventory</option>{data.inventory.filter((item) => item.quantity > 0 && item.status !== "cancelled").map((item) => <option key={item.id} value={item.id}>{item.name} ({item.quantity} left)</option>)}</Select>}
            <Field name="description" label="Item description" value={quickSocial ? description : undefined} onChange={quickSocial ? (event) => setDescription(event.target.value) : undefined} required={!quickSocial} />
            <Select name="type" label="Order type" defaultValue={quickSocial ? "ready-made" : "tailoring"}><option value="tailoring">Tailoring order</option><option value="ready-made">Ready-made sale</option><option value="original">RoseDen Original</option></Select>
            <div className="grid grid-cols-3 gap-3"><Field name="color" label="Color" value={quickSocial ? color : undefined} onChange={quickSocial ? (event) => setColor(event.target.value) : undefined} /><Field name="size" label="Size" value={quickSocial ? size : undefined} onChange={quickSocial ? (event) => setSize(event.target.value) : undefined} /><Field name="quantity" label="Qty" type="number" min="1" max={quickSocial ? selectedProduct?.quantity : undefined} value={quickSocial ? quantity : undefined} defaultValue={quickSocial ? undefined : "1"} onChange={quickSocial ? (event) => changeQuantity(Number(event.target.value)) : undefined} required /></div>
            <div className="grid grid-cols-2 gap-3"><Field name="total" label="Total price (NLe)" type="number" value={quickSocial ? total : undefined} onChange={quickSocial ? (event) => setTotal(event.target.value) : undefined} required /><Field name="paid" label="Deposit / paid" type="number" defaultValue="0" required /><Field name="cost" label="Estimated cost" type="number" value={quickSocial ? cost : undefined} onChange={quickSocial ? (event) => setCost(event.target.value) : undefined} /><Field name="dueDate" label="Pickup / delivery date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></div>
            <div className="grid grid-cols-2 gap-3"><Select name="deliveryPlan" label="Plan"><option value="pickup">Pickup</option><option value="delivery">Delivery</option></Select><Select name="status" label="Order status"><option value="pending">Pending</option><option value="in progress">In progress</option><option value="ready">Ready</option></Select></div>
            <Field name="notes" label="Delivery details / notes" />
            {formError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{formError}</p>}
            {quickSocial && <p className="flex items-center gap-2 rounded-xl bg-gold/10 p-3 text-xs text-wine"><Sparkles size={16} />Known customers and products are reused automatically. Stock and balances update when you save.</p>}
          </Form>
        </Modal>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return <Suspense><OrdersContent /></Suspense>;
}

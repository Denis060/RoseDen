"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Minus, Package, Plus, Search, UserRound, X } from "lucide-react";
import { useData } from "@/components/data-provider";
import { money } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { OrderStatus, OrderType, SalesChannel } from "@/lib/types";

const channels: SalesChannel[] = ["WhatsApp Status", "Facebook", "TikTok", "Instagram", "Referral", "Walk-in", "Existing Customer", "Website"];

type Props = {
  quickSocial: boolean;
  initialProductId?: string;
  inquiryId?: string;
  onSaved: () => void;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sourceTypeToOrderType(sourceType?: string): OrderType {
  if (sourceType === "original") return "original";
  if (sourceType === "tailoring-sample") return "tailoring";
  return "ready-made";
}

export function OrderEntryForm({ quickSocial, initialProductId, inquiryId, onSaved }: Props) {
  const { data, addOrder, addStatusOrder } = useData();
  const [customerQuery, setCustomerQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [walkIn, setWalkIn] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [customItem, setCustomItem] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OrderType>(quickSocial ? "ready-made" : "tailoring");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [paid, setPaid] = useState(0);
  const [dueDate, setDueDate] = useState(today());
  const [deliveryPlan, setDeliveryPlan] = useState<"pickup" | "delivery">("pickup");
  const [channel, setChannel] = useState<SalesChannel>(quickSocial ? "WhatsApp Status" : "Walk-in");
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedCustomer = data.customers.find((customer) => customer.id === selectedCustomerId);
  const selectedProduct = data.inventory.find((item) => item.id === selectedInventoryId);
  const total = unitPrice * quantity;
  const cost = unitCost * quantity;
  const balance = Math.max(0, total - paid);

  const customerMatches = useMemo(() => {
    if (walkIn || selectedCustomerId) return [];
    const nameQuery = customerQuery.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "");
    if (!nameQuery && phoneDigits.length < 3) return [];
    return data.customers.filter((customer) =>
      (nameQuery && customer.name.toLowerCase().includes(nameQuery)) ||
      (phoneDigits.length >= 3 && customer.phone.replace(/\D/g, "").includes(phoneDigits))
    ).slice(0, 5);
  }, [customerQuery, data.customers, phone, selectedCustomerId, walkIn]);

  const productMatches = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (customItem || selectedInventoryId || !query) return [];
    return data.inventory.filter((item) =>
      item.quantity > 0 &&
      item.status !== "cancelled" &&
      `${item.name} ${item.category} ${item.color} ${item.size} ${(item.colors || []).join(" ")} ${(item.sizes || []).join(" ")}`.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [customItem, data.inventory, productQuery, selectedInventoryId]);

  const customerOrders = selectedCustomer ? data.orders.filter((order) => order.customerId === selectedCustomer.id) : [];
  const customerBalance = customerOrders.reduce((sum, order) => sum + Math.max(0, order.total - order.paid), 0);

  function chooseCustomer(customerId: string) {
    const customer = data.customers.find((entry) => entry.id === customerId);
    if (!customer) return;
    setWalkIn(false);
    setSelectedCustomerId(customer.id);
    setCustomerQuery(customer.name);
    setPhone(customer.phone);
    setFormError("");
  }

  function clearCustomer() {
    setSelectedCustomerId("");
    setCustomerQuery("");
    setPhone("");
  }

  function chooseProduct(inventoryId: string) {
    const item = data.inventory.find((entry) => entry.id === inventoryId);
    if (!item) return;
    setCustomItem(false);
    setSelectedInventoryId(item.id);
    setProductQuery(item.name);
    setDescription(item.name);
    setType(sourceTypeToOrderType(item.sourceType));
    setColor(item.colors?.[0] || item.color || "");
    setSize(item.sizes?.[0] || item.size || "");
    setQuantity(1);
    setUnitPrice(item.sellingPrice);
    setUnitCost(item.costPrice);
    setFormError("");
  }

  function clearProduct() {
    setSelectedInventoryId("");
    setProductQuery("");
    setDescription("");
    setColor("");
    setSize("");
    setQuantity(1);
    setUnitPrice(0);
    setUnitCost(0);
  }

  useEffect(() => {
    if (initialProductId && !selectedInventoryId && data.inventory.length > 0) {
      chooseProduct(initialProductId);
      setChannel("Website");
    }
  // chooseProduct intentionally reads the latest inventory after data loads.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.inventory, initialProductId, selectedInventoryId]);

  function changeQuantity(next: number) {
    const maximum = selectedProduct?.quantity || 999;
    setQuantity(Math.min(maximum, Math.max(1, next)));
  }

  function useWalkIn() {
    setWalkIn(true);
    clearCustomer();
  }

  function useCustomItem() {
    setCustomItem(true);
    clearProduct();
    setType("tailoring");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!walkIn && (!customerQuery.trim() || !phone.trim())) {
      setFormError("Choose an existing customer, enter a new customer, or select Walk-in.");
      return;
    }
    if (!customItem && !selectedProduct) {
      setFormError("Choose a product from inventory or select Tailoring / custom item.");
      return;
    }
    if (!description.trim()) {
      setFormError("Enter the item or tailoring description.");
      return;
    }
    if (selectedProduct && quantity > selectedProduct.quantity) {
      setFormError(`Only ${selectedProduct.quantity} ${selectedProduct.name} currently available.`);
      return;
    }
    if (total <= 0) {
      setFormError("Enter a selling price greater than zero.");
      return;
    }
    if (paid > total) {
      setFormError("Amount paid cannot be greater than the order total.");
      return;
    }

    const order = {
      description: description.trim(),
      type,
      total,
      paid,
      cost,
      dueDate,
      status,
      notes: notes.trim(),
      inventoryId: selectedProduct?.id,
      quantity,
      channel,
      color,
      size,
      deliveryPlan,
    };

    setSaving(true);
    setFormError("");
    try {
      if (walkIn) {
        await addOrder({ ...order, customerId: "" });
      } else {
        await addStatusOrder({
          id: selectedCustomerId || undefined,
          name: customerQuery.trim(),
          phone: phone.trim(),
        }, order);
      }
      if (inquiryId && supabase) {
        await supabase.from("product_inquiries").update({ status: "converted" }).eq("id", inquiryId);
      }
      onSaved();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not save this order. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="min-w-0 space-y-5 overflow-x-hidden">
      <section className="min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-wine">1. Customer</h3>
          <button type="button" onClick={useWalkIn} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${walkIn ? "bg-burgundy text-white" : "bg-white text-burgundy"}`}>Walk-in</button>
        </div>
        {walkIn ? (
          <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <UserRound className="text-gold" />
            <div className="flex-1"><p className="font-semibold text-wine">Walk-in customer</p><p className="text-xs text-black/50">No customer record needed.</p></div>
            <button type="button" onClick={() => setWalkIn(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white"><X size={16} /></button>
          </div>
        ) : (
          <div className="relative space-y-2">
            <div className="flex items-center rounded-xl border border-black/10 bg-white px-3 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15">
              <Search size={17} className="text-black/35" />
              <input value={customerQuery} onChange={(event) => { setCustomerQuery(event.target.value); setSelectedCustomerId(""); }} placeholder="Type customer name" className="h-12 min-w-0 flex-1 bg-transparent px-2 outline-none" />
              {customerQuery && <button type="button" onClick={clearCustomer}><X size={16} className="text-black/35" /></button>}
            </div>
            <input value={phone} onChange={(event) => {
              const value = event.target.value;
              setPhone(value);
              const digits = value.replace(/\D/g, "").slice(-8);
              const match = digits.length >= 6 ? data.customers.find((customer) => customer.phone.replace(/\D/g, "").slice(-8) === digits) : undefined;
              if (match) chooseCustomer(match.id);
              else setSelectedCustomerId("");
            }} placeholder="Phone / WhatsApp number" className="h-12 w-full rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-gold" />
            {customerMatches.length > 0 && <div className="absolute inset-x-0 top-12 z-30 mt-1 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">{customerMatches.map((customer) => <button key={customer.id} type="button" onClick={() => chooseCustomer(customer.id)} className="flex w-full items-center gap-3 border-b border-black/5 p-3 text-left last:border-0"><span className="grid h-9 w-9 place-items-center rounded-full bg-burgundy/10 font-bold text-burgundy">{customer.name[0]}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{customer.name}</strong><small className="text-black/45">{customer.phone}</small></span><Check size={16} className="text-gold" /></button>)}</div>}
          </div>
        )}
        {selectedCustomer && <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><UserRound size={19} className="text-emerald-700" /><div><p className="text-sm font-bold text-emerald-900">Existing customer found</p><p className="text-xs text-emerald-800/70">{customerOrders.length} previous orders · {money(customerBalance)} outstanding</p></div></div>}
      </section>

      <section className="min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-wine">2. Product</h3>
          <button type="button" onClick={useCustomItem} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${customItem ? "bg-burgundy text-white" : "bg-white text-burgundy"}`}>Custom item</button>
        </div>
        {customItem ? (
          <div className="space-y-3 rounded-2xl border border-gold/25 bg-white p-4">
            <div className="flex items-center justify-between"><p className="font-semibold text-wine">Custom or tailoring order</p><button type="button" onClick={() => setCustomItem(false)} className="grid h-9 w-9 place-items-center rounded-full bg-black/5"><X size={16} /></button></div>
            <label className="block text-xs font-medium text-black/60">What are we making?<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Example: Burgundy fitted evening dress" className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-gold" /></label>
          </div>
        ) : selectedProduct ? (
          <div className="overflow-hidden rounded-2xl border border-gold/25 bg-white">
            <div className="flex gap-3 p-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-marble/50">{selectedProduct.productImages?.[0] || selectedProduct.shopPhotoUrl ? <Image src={selectedProduct.productImages?.[0] || selectedProduct.shopPhotoUrl} alt={selectedProduct.name} fill sizes="64px" className="object-cover" /> : <Package className="absolute inset-0 m-auto text-burgundy/25" />}</div>
              <div className="min-w-0 flex-1"><p className="truncate font-bold text-wine">{selectedProduct.name}</p><p className="mt-1 text-xs text-black/45">{selectedProduct.category} · {selectedProduct.quantity} available</p><p className="mt-2 font-bold text-burgundy">{money(selectedProduct.sellingPrice)} each</p></div>
              <button type="button" onClick={clearProduct} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/5"><X size={16} /></button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center rounded-xl border border-black/10 bg-white px-3 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15"><Search size={17} className="text-black/35" /><input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Type product name, color or size" className="h-12 min-w-0 flex-1 bg-transparent px-2 outline-none" /></div>
            {productMatches.length > 0 && <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">{productMatches.map((item) => <button key={item.id} type="button" onClick={() => chooseProduct(item.id)} className="flex w-full items-center gap-3 border-b border-black/5 p-3 text-left last:border-0">{item.productImages?.[0] || item.shopPhotoUrl ? <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg"><Image src={item.productImages?.[0] || item.shopPhotoUrl} alt="" fill sizes="44px" className="object-cover" /></span> : <span className="grid h-11 w-11 place-items-center rounded-lg bg-gold/10 text-xs font-bold text-gold">{item.quantity}</span>}<span className="min-w-0 flex-1"><strong className="block truncate text-sm">{item.name}</strong><small className="text-black/45">{item.quantity} available · {money(item.sellingPrice)}</small></span></button>)}</div>}
          </div>
        )}
      </section>

      {(selectedProduct || customItem) && <section className="rounded-2xl border border-burgundy/10 bg-white p-4">
        <h3 className="text-sm font-bold text-wine">3. Quantity and payment</h3>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div><p className="text-xs text-black/45">Quantity</p><div className="mt-1 flex items-center gap-3"><button type="button" onClick={() => changeQuantity(quantity - 1)} className="grid h-11 w-11 place-items-center rounded-full bg-burgundy/10 text-burgundy"><Minus size={18} /></button><strong className="min-w-6 text-center text-xl">{quantity}</strong><button type="button" onClick={() => changeQuantity(quantity + 1)} className="grid h-11 w-11 place-items-center rounded-full bg-burgundy text-white"><Plus size={18} /></button></div></div>
          <div className="text-right"><p className="text-xs text-black/45">Order total</p><p className="mt-1 text-2xl font-bold text-burgundy">{money(total)}</p>{quantity > 1 && <p className="text-[10px] text-black/40">{money(unitPrice)} × {quantity}</p>}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-black/60">Amount paid<input type="number" min="0" max={total || undefined} step="0.01" value={paid || ""} onChange={(event) => setPaid(Number(event.target.value))} placeholder="0" className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-3 text-base outline-none focus:border-gold" /></label>
          <div className={`rounded-xl p-3 ${balance > 0 ? "bg-gold/10" : "bg-emerald-50"}`}><p className="text-xs text-black/45">Balance</p><p className={`mt-1 text-lg font-bold ${balance > 0 ? "text-burgundy" : "text-emerald-700"}`}>{money(balance)}</p></div>
        </div>
      </section>}

      {(selectedProduct || customItem) && <section className="grid grid-cols-2 gap-3">
        <label className="text-xs font-medium text-black/60">Pickup / delivery date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-gold" /></label>
        <label className="text-xs font-medium text-black/60">How?<select value={deliveryPlan} onChange={(event) => setDeliveryPlan(event.target.value as "pickup" | "delivery")} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-gold"><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label>
      </section>}

      {(selectedProduct || customItem) && <details className="group rounded-2xl border border-black/10 bg-white">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-wine">More details <ChevronDown size={18} className="transition group-open:rotate-180" /></summary>
        <div className="space-y-3 border-t border-black/5 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-black/60">Size<select value={size} onChange={(event) => setSize(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3">{[...new Set([...(selectedProduct?.sizes || []), selectedProduct?.size || "", size])].filter(Boolean).map((option) => <option key={option}>{option}</option>)}{!selectedProduct && <option value="">Not specified</option>}</select></label>
            <label className="text-xs font-medium text-black/60">Color<select value={color} onChange={(event) => setColor(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3">{[...new Set([...(selectedProduct?.colors || []), selectedProduct?.color || "", color])].filter(Boolean).map((option) => <option key={option}>{option}</option>)}{!selectedProduct && <option value="">Not specified</option>}</select></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-black/60">Price per item<input type="number" min="0" step="0.01" value={unitPrice || ""} onChange={(event) => setUnitPrice(Number(event.target.value))} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-3" /></label>
            <label className="text-xs font-medium text-black/60">Cost per item<input type="number" min="0" step="0.01" value={unitCost || ""} onChange={(event) => setUnitCost(Number(event.target.value))} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 px-3" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-black/60">Order type<select value={type} onChange={(event) => setType(event.target.value as OrderType)} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3"><option value="ready-made">Ready-made</option><option value="tailoring">Tailoring</option><option value="original">RoseDen Original</option></select></label>
            <label className="text-xs font-medium text-black/60">Sales channel<select value={channel} onChange={(event) => setChannel(event.target.value as SalesChannel)} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3">{channels.map((option) => <option key={option}>{option}</option>)}</select></label>
          </div>
          <label className="block text-xs font-medium text-black/60">Order status<select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3"><option value="pending">Pending</option><option value="in progress">In progress</option><option value="ready">Ready</option></select></label>
          <label className="block text-xs font-medium text-black/60">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Delivery location or special request" rows={3} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-3 outline-none focus:border-gold" /></label>
        </div>
      </details>}

      {formError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{formError}</p>}
      <button disabled={saving || (!selectedProduct && !customItem)} className="h-14 w-full rounded-2xl bg-burgundy px-5 font-bold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Saving order..." : balance > 0 ? `Reserve · ${money(balance)} balance` : "Save paid order"}</button>
      <p className="text-center text-[11px] leading-4 text-black/40">Product details, totals, cost, balance and stock are calculated automatically.</p>
    </form>
  );
}

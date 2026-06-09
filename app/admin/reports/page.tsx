"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BarChart3, CircleDollarSign, Download, Megaphone, PackageCheck, Repeat, ShoppingBag, Star, Truck, UserRound } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/ui";
import { money } from "@/lib/format";

function ProgressBar({ value, max, tone = "burgundy" }: { value: number; max: number; tone?: "burgundy" | "gold" | "green" }) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  const color = tone === "green" ? "bg-emerald-600" : tone === "gold" ? "bg-gold" : "bg-burgundy";
  return <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div>;
}

function EmptyReport({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-cream p-4 text-center text-sm text-black/45">{children}</p>;
}

export default function AdminReportsPage() {
  const { data } = useData();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const sales = data.orders.filter((order) => order.status !== "cancelled" && order.createdAt.startsWith(month));
  const revenue = sales.reduce((sum, order) => sum + order.total, 0);
  const paid = sales.reduce((sum, order) => sum + order.paid, 0);
  const costs = sales.reduce((sum, order) => sum + order.cost, 0);
  const expenses = data.expenses.filter((expense) => expense.date.startsWith(month)).reduce((sum, expense) => sum + expense.amount, 0);
  const grossProfit = revenue - costs;
  const netProfit = grossProfit - expenses;
  const outstanding = sales.reduce((sum, order) => sum + Math.max(0, order.total - order.paid), 0);
  const inventoryValue = data.inventory.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

  const customerTotals = data.customers.map((customer) => {
    const customerOrders = sales.filter((order) => order.customerId === customer.id);
    return {
      id: customer.id,
      name: customer.name,
      orders: customerOrders.length,
      total: customerOrders.reduce((sum, order) => sum + order.total, 0),
      paid: customerOrders.reduce((sum, order) => sum + order.paid, 0),
    };
  }).filter((customer) => customer.orders > 0).sort((a, b) => b.total - a.total);

  const productSales = data.inventory.map((item) => {
    const productOrders = sales.filter((order) => order.inventoryId === item.id);
    return {
      id: item.id,
      name: item.name,
      count: productOrders.reduce((sum, order) => sum + order.quantity, 0),
      revenue: productOrders.reduce((sum, order) => sum + order.total, 0),
      profit: productOrders.reduce((sum, order) => sum + order.total - order.cost, 0),
    };
  }).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);

  const channelSales = Array.from(new Set(sales.map((order) => order.channel))).map((channel) => {
    const orders = sales.filter((order) => order.channel === channel);
    return { channel, orders: orders.length, revenue: orders.reduce((sum, order) => sum + order.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue);

  const batchSales = data.batches.map((batch) => {
    const productIds = new Set(data.inventory.filter((item) => item.batchId === batch.id).map((item) => item.id));
    const orders = sales.filter((order) => order.inventoryId && productIds.has(order.inventoryId));
    const batchExpenses = data.expenses.filter((expense) => expense.batchId === batch.id && expense.date.startsWith(month)).reduce((sum, expense) => sum + expense.amount, 0);
    const batchRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const batchCost = orders.reduce((sum, order) => sum + order.cost, 0);
    return { id: batch.id, name: batch.name, orders: orders.length, revenue: batchRevenue, profit: batchRevenue - batchCost - batchExpenses };
  }).filter((batch) => batch.orders > 0).sort((a, b) => b.revenue - a.revenue);

  const outstandingOrders = sales
    .map((order) => ({ ...order, balance: Math.max(0, order.total - order.paid) }))
    .filter((order) => order.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const maxChannelRevenue = Math.max(...channelSales.map((item) => item.revenue), 0);
  const maxCustomerRevenue = Math.max(...customerTotals.map((item) => item.total), 0);
  const maxProductCount = Math.max(...productSales.map((item) => item.count), 0);
  const maxBatchRevenue = Math.max(...batchSales.map((item) => item.revenue), 0);

  const journey = [
    { label: "Buy / create stock", value: data.inventory.length, icon: PackageCheck },
    { label: "Post content", value: data.batches.reduce((sum, batch) => sum + batch.channels.length, 0), icon: Megaphone },
    { label: "Orders", value: sales.length, icon: ShoppingBag },
    { label: "Payments", value: money(paid), icon: CircleDollarSign },
    { label: "Delivery", value: sales.filter((order) => order.status === "delivered").length, icon: Truck },
    { label: "Repeat", value: customerTotals.filter((customer) => customer.orders > 1).length, icon: Repeat },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Understand the money, products, customers, and marketing channels" />
      <Link href="/admin/backup" className="mb-4 flex h-12 items-center justify-center gap-2 rounded-xl border border-burgundy/15 bg-white text-sm font-semibold text-burgundy"><Download size={17} />Backup and export records</Link>
      <label className="mb-5 block rounded-2xl bg-white p-4 text-sm font-semibold shadow-soft">
        Report month
        <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-cream px-3 text-base outline-none focus:border-gold" />
      </label>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2"><BarChart3 className="text-gold" size={20} /><h2 className="font-display text-xl font-semibold text-wine">Profit and loss</h2></div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-black/55">Sales revenue</span><strong>{money(revenue)}</strong></div>
          <div className="flex justify-between"><span className="text-black/55">Cost of items sold</span><strong className="text-burgundy">- {money(costs)}</strong></div>
          <div className="flex justify-between border-t border-black/5 pt-3"><span className="font-semibold">Gross profit</span><strong className="text-emerald-700">{money(grossProfit)}</strong></div>
          <div className="flex justify-between"><span className="text-black/55">Business expenses</span><strong className="text-burgundy">- {money(expenses)}</strong></div>
          <div className="flex justify-between rounded-xl bg-gold/10 p-3"><span className="font-bold text-wine">Estimated net profit</span><strong className={netProfit >= 0 ? "text-emerald-700" : "text-burgundy"}>{money(netProfit)}</strong></div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[["Amount received", paid], ["Outstanding balances", outstanding], ["Monthly expenses", expenses], ["Inventory value", inventoryValue]].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl bg-white p-4 shadow-soft"><p className="text-xs text-black/45">{label as string}</p><p className="mt-2 text-lg font-bold text-burgundy">{money(value as number)}</p></div>
        ))}
      </div>

      <section className="mt-7 rounded-2xl bg-wine p-4 text-white shadow-soft">
        <div className="mb-4 flex items-center gap-2"><BarChart3 className="text-gold" size={20} /><h2 className="font-display text-xl font-semibold">RoseDen customer journey</h2></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {journey.map((step, index) => <div key={step.label} className="rounded-xl bg-white/8 p-3"><div className="mb-2 flex items-center justify-between"><step.icon size={18} className="text-gold" />{index < journey.length - 1 && <ArrowRight size={14} className="text-white/35" />}</div><p className="text-[11px] text-white/60">{step.label}</p><p className="mt-1 font-bold">{step.value}</p></div>)}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-1 font-display text-xl font-semibold text-wine">Outstanding balances</h2>
        <p className="mb-3 text-xs text-black/45">Tap an order to record a payment or follow up.</p>
        <div className="space-y-2 rounded-2xl bg-white p-4 shadow-soft">
          {outstandingOrders.length === 0 && <EmptyReport>No unpaid balances for this month.</EmptyReport>}
          {outstandingOrders.map((order) => <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-cream p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{data.customers.find((customer) => customer.id === order.customerId)?.name || "Customer"}</p><p className="truncate text-xs text-black/45">{order.description}</p></div><div className="text-right"><p className="font-bold text-burgundy">{money(order.balance)}</p><p className="text-[10px] text-black/40">owed</p></div></Link>)}
        </div>
      </section>

      <section className="mt-7"><h2 className="mb-1 font-display text-xl font-semibold text-wine">Sales by buying trip</h2><p className="mb-3 text-xs text-black/45">See which stock trips produced sales during the selected month.</p><div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">{batchSales.length === 0 && <EmptyReport>No batch-linked sales for this month.</EmptyReport>}{batchSales.map((item) => <div key={item.id}><Link href={`/admin/batches/${item.id}`} className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{item.name}<small className="ml-2 text-black/40">{item.orders} orders</small></span><span className="text-right"><strong className="block text-burgundy">{money(item.revenue)}</strong><small className={item.profit >= 0 ? "text-emerald-700" : "text-burgundy"}>{money(item.profit)} profit</small></span></Link><ProgressBar value={item.revenue} max={maxBatchRevenue} tone="gold" /></div>)}</div></section>

      <section className="mt-7"><h2 className="mb-1 font-display text-xl font-semibold text-wine">Sales by channel</h2><p className="mb-3 text-xs text-black/45">Where advertising is turning into orders.</p><div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">{channelSales.length === 0 && <EmptyReport>No sales recorded for this month.</EmptyReport>}{channelSales.map((item) => <div key={item.channel}><div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{item.channel}<small className="ml-2 text-black/40">{item.orders} orders</small></span><strong className="text-burgundy">{money(item.revenue)}</strong></div><ProgressBar value={item.revenue} max={maxChannelRevenue} tone={item.channel.includes("WhatsApp") ? "green" : "burgundy"} /></div>)}</div></section>

      <section className="mt-7"><h2 className="mb-1 font-display text-xl font-semibold text-wine">Top customers</h2><p className="mb-3 text-xs text-black/45">Best buyers during the selected month.</p><div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">{customerTotals.length === 0 && <EmptyReport>No customer sales for this month.</EmptyReport>}{customerTotals.slice(0, 6).map((item, index) => <div key={item.id}><Link href={`/admin/customers/${item.id}`} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><UserRound size={15} className="text-gold" />{index + 1}. {item.name}<small className="text-black/40">{item.orders} orders</small></span><strong className="text-burgundy">{money(item.total)}</strong></Link><ProgressBar value={item.total} max={maxCustomerRevenue} /></div>)}</div></section>

      <section className="mt-7"><h2 className="mb-1 font-display text-xl font-semibold text-wine">Best-selling products</h2><p className="mb-3 text-xs text-black/45">Stock the RoseDen team should consider buying again.</p><div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">{productSales.length === 0 && <EmptyReport>No product-linked sales for this month.</EmptyReport>}{productSales.slice(0, 6).map((item, index) => <div key={item.id}><Link href={`/admin/inventory/${item.id}`} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><Star size={15} className="text-gold" />{index + 1}. {item.name}<small className="text-black/40">{item.count} sold</small></span><span className="text-right"><strong className="block text-burgundy">{money(item.revenue)}</strong><small className="text-emerald-700">{money(item.profit)} gross profit</small></span></Link><ProgressBar value={item.count} max={maxProductCount} tone="gold" /></div>)}</div></section>
    </div>
  );
}

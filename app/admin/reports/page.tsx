"use client";

import { ArrowRight, BarChart3, CircleDollarSign, Megaphone, PackageCheck, Repeat, ShoppingBag, Star, Truck, UserRound } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/ui";
import { money } from "@/lib/format";

function ProgressBar({ value, max, tone = "burgundy" }: { value: number; max: number; tone?: "burgundy" | "gold" | "green" }) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  const color = tone === "green" ? "bg-emerald-600" : tone === "gold" ? "bg-gold" : "bg-burgundy";
  return <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div>;
}

export default function AdminReportsPage() {
  const { data } = useData();
  const month = new Date().toISOString().slice(0, 7);
  const sales = data.orders.filter((order) => order.status !== "cancelled" && order.createdAt.startsWith(month));
  const revenue = sales.reduce((sum, order) => sum + order.total, 0);
  const paid = sales.reduce((sum, order) => sum + order.paid, 0);
  const costs = sales.reduce((sum, order) => sum + order.cost, 0);
  const expenses = data.expenses.filter((expense) => expense.date.startsWith(month)).reduce((sum, expense) => sum + expense.amount, 0);
  const profit = revenue - costs - expenses;
  const inventoryValue = data.inventory.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

  const customerTotals = data.customers.map((customer) => ({
    name: customer.name,
    orders: data.orders.filter((order) => order.customerId === customer.id).length,
    total: data.orders.filter((order) => order.customerId === customer.id).reduce((sum, order) => sum + order.paid, 0)
  })).sort((a, b) => b.total - a.total);

  const productSales = data.inventory.map((item) => {
    const productOrders = data.orders.filter((order) => order.inventoryId === item.id && order.status !== "cancelled");
    return { name: item.name, count: productOrders.reduce((sum, order) => sum + order.quantity, 0), revenue: productOrders.reduce((sum, order) => sum + order.total, 0) };
  }).sort((a, b) => b.count - a.count);

  const channelSales = Array.from(new Set(data.orders.map((order) => order.channel))).map((channel) => {
    const orders = sales.filter((order) => order.channel === channel);
    return { channel, orders: orders.length, revenue: orders.reduce((sum, order) => sum + order.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue);

  const maxChannelRevenue = Math.max(...channelSales.map((item) => item.revenue), 0);
  const maxCustomerRevenue = Math.max(...customerTotals.map((item) => item.total), 0);
  const maxProductCount = Math.max(...productSales.map((item) => item.count), 0);

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
      <PageHeader title="Reports" subtitle="Understand where money, customers, and products are moving" />
      <div className="grid grid-cols-2 gap-3">
        {[["Monthly sales", revenue], ["Amount received", paid], ["Monthly expenses", expenses], ["Estimated profit", profit], ["Outstanding balances", revenue - paid], ["Inventory value", inventoryValue]].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl bg-white p-4 shadow-soft"><p className="text-xs text-black/45">{label as string}</p><p className="mt-2 text-lg font-bold text-burgundy">{money(value as number)}</p></div>
        ))}
      </div>

      <section className="mt-7 rounded-2xl bg-wine p-4 text-white shadow-soft">
        <div className="mb-4 flex items-center gap-2"><BarChart3 className="text-gold" size={20} /><h2 className="font-display text-xl font-semibold">RoseDen customer journey</h2></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {journey.map((step, index) => <div key={step.label} className="rounded-xl bg-white/8 p-3"><div className="mb-2 flex items-center justify-between"><step.icon size={18} className="text-gold" />{index < journey.length - 1 && <ArrowRight size={14} className="text-white/35" />}</div><p className="text-[11px] text-white/60">{step.label}</p><p className="mt-1 font-bold">{step.value}</p></div>)}
        </div>
      </section>

      <section className="mt-7"><h2 className="mb-1 font-display text-xl font-semibold text-wine">Sales by channel</h2><p className="mb-3 text-xs text-black/45">This shows where advertising is actually turning into money.</p><div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">{channelSales.map((item) => <div key={item.channel}><div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{item.channel}<small className="ml-2 text-black/40">{item.orders} orders</small></span><strong className="text-burgundy">{money(item.revenue)}</strong></div><ProgressBar value={item.revenue} max={maxChannelRevenue} tone={item.channel.includes("WhatsApp") ? "green" : "burgundy"} /></div>)}</div></section>

      <section className="mt-7"><h2 className="mb-1 font-display text-xl font-semibold text-wine">Top customers</h2><p className="mb-3 text-xs text-black/45">Best buyers and repeat-customer signals.</p><div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">{customerTotals.slice(0, 6).map((item, index) => <div key={item.name}><div className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><UserRound size={15} className="text-gold" />{index + 1}. {item.name}<small className="text-black/40">{item.orders} orders</small></span><strong className="text-burgundy">{money(item.total)}</strong></div><ProgressBar value={item.total} max={maxCustomerRevenue} /></div>)}</div></section>

      <section className="mt-7"><h2 className="mb-1 font-display text-xl font-semibold text-wine">Best-selling products</h2><p className="mb-3 text-xs text-black/45">The stock Rosannah should consider buying again.</p><div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">{productSales.slice(0, 6).map((item, index) => <div key={item.name}><div className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><Star size={15} className="text-gold" />{index + 1}. {item.name}<small className="text-black/40">{item.count} sold</small></span><strong className="text-burgundy">{money(item.revenue)}</strong></div><ProgressBar value={item.count} max={maxProductCount} tone="gold" /></div>)}</div></section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Banknote, CircleDollarSign, Clock3, Megaphone, PackageSearch, Plus, TrendingUp } from "lucide-react";
import { useData } from "@/components/data-provider";
import { IconBox } from "@/components/icons";
import { money, shortDate } from "@/lib/format";

export default function Dashboard() {
  const { data } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const valid = data.orders.filter((o) => o.status !== "cancelled");
  const todaySales = valid.filter((o) => o.createdAt === today).reduce((sum, o) => sum + o.paid, 0);
  const monthSales = valid.filter((o) => o.createdAt.startsWith(month)).reduce((sum, o) => sum + o.paid, 0);
  const expenses = data.expenses.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);
  const profit = valid.filter((o) => o.createdAt.startsWith(month)).reduce((sum, o) => sum + o.total - o.cost, 0) - expenses;
  const pending = valid.filter((o) => !["delivered"].includes(o.status)).length;
  const lowStock = data.inventory.filter((i) => i.quantity <= i.lowStockAt);

  return (
    <div>
      <div className="mb-6 flex min-w-0 items-end justify-between gap-3"><div className="min-w-0"><p className="text-sm text-black/50">Good morning, Rosannah</p><h1 className="mt-1 font-display text-[1.7rem] font-semibold leading-tight text-wine sm:text-3xl">Here’s your atelier today.</h1></div><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-burgundy font-display text-lg font-bold text-white">R</div></div>
      <div className="mb-7 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/orders?status=1" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-burgundy px-5 font-semibold text-white shadow-soft"><Megaphone size={20} /> Record status/social order</Link>
        <Link href="/admin/orders?new=1" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-burgundy/20 bg-white px-5 font-semibold text-burgundy"><Plus size={20} /> Regular sale or order</Link>
      </div>
      <section className="grid grid-cols-2 gap-3">
        {[
          ["Today’s sales", money(todaySales), Banknote],
          ["This month", money(monthSales), TrendingUp],
          ["Estimated profit", money(profit), CircleDollarSign],
          ["Pending orders", String(pending), Clock3],
        ].map(([label, value, Icon]) => <div key={label as string} className="rounded-2xl border border-burgundy/10 bg-white p-4"><IconBox icon={Icon as typeof Banknote} /><p className="mt-4 text-xs font-medium text-black/50">{label as string}</p><p className="mt-1 text-xl font-bold text-wine">{value as string}</p></div>)}
      </section>
      <Link href="/admin/batches" className="mt-7 flex items-center justify-between rounded-2xl bg-wine p-4 text-white"><div><p className="text-xs text-gold">Buying → posting → selling</p><p className="mt-1 font-display text-lg font-semibold">Track post batches and trip profit</p></div><ArrowRight /></Link>
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-wine">Low stock</h2><Link href="/admin/inventory" className="text-xs font-semibold text-burgundy">View inventory</Link></div>
        <div className="overflow-hidden rounded-2xl border border-gold/25 bg-gold/10">
          {lowStock.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-3 border-b border-gold/15 p-3 last:border-0"><IconBox icon={PackageSearch} tone="gold" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.name}</p><p className="text-xs text-black/50">{item.quantity} left • alert at {item.lowStockAt}</p></div><ArrowRight size={18} className="text-gold" /></div>)}
        </div>
      </section>
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-wine">Recent transactions</h2><Link href="/admin/reports" className="text-xs font-semibold text-burgundy">See reports</Link></div>
        <div className="divide-y divide-black/5 rounded-2xl bg-white px-4">
          {valid.slice(0, 5).map((order) => <div key={order.id} className="flex items-center gap-3 py-4"><span className="h-2.5 w-2.5 rounded-full bg-gold" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{order.description}</p><p className="text-xs text-black/45">{data.customers.find((c) => c.id === order.customerId)?.name} • {shortDate(order.createdAt)}</p></div><p className="text-sm font-bold text-burgundy">{money(order.paid)}</p></div>)}
        </div>
      </section>
    </div>
  );
}

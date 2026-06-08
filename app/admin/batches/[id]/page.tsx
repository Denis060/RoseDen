"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Boxes, Calculator, Plus, ReceiptText, TrendingUp } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Empty } from "@/components/ui";
import { money, shortDate } from "@/lib/format";

export default function BuyingTripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useData();
  const batch = data.batches.find((entry) => entry.id === id);

  if (!batch) return <div><Link href="/admin/batches" className="mb-5 inline-flex items-center gap-2 font-semibold text-burgundy"><ArrowLeft size={18} />Buying trips</Link><Empty>Buying trip not found.</Empty></div>;

  const entries = data.stockEntries.filter((entry) => entry.batchId === batch.id);
  const products = data.inventory.filter((item) => item.batchId === batch.id || entries.some((entry) => entry.inventoryId === item.id));
  const linkedExpenses = data.expenses.filter((expense) => expense.batchId === batch.id);
  const stockCost = entries.length
    ? entries.reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0)
    : batch.totalCost;
  const unitsBought = entries.reduce((sum, entry) => sum + entry.quantity, 0) || products.reduce((sum, item) => sum + item.totalQuantity, 0);
  const linkedExpenseTotal = linkedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const tripOverhead = batch.transportCost + linkedExpenseTotal;
  const overheadPerUnit = unitsBought ? tripOverhead / unitsBought : 0;
  const expectedRevenue = entries.reduce((sum, entry) => {
    const product = products.find((item) => item.id === entry.inventoryId);
    return sum + entry.quantity * (product?.sellingPrice || 0);
  }, 0) || products.reduce((sum, item) => sum + item.totalQuantity * item.sellingPrice, 0);
  const batchProductIds = new Set(products.map((item) => item.id));
  const sales = data.orders.filter((order) => order.inventoryId && batchProductIds.has(order.inventoryId) && order.status !== "cancelled");
  const deliveredSales = sales.filter((order) => order.status === "delivered");
  const actualRevenue = deliveredSales.reduce((sum, order) => sum + order.total, 0);
  const actualCost = deliveredSales.reduce((sum, order) => sum + order.cost, 0);
  const expectedProfit = expectedRevenue - stockCost - tripOverhead;
  const actualProfit = actualRevenue - actualCost - tripOverhead;

  return (
    <div className="space-y-5">
      <Link href="/admin/batches" className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Buying trips</Link>
      <section className="rounded-3xl bg-burgundy p-5 text-white shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-gold">{batch.source} · {shortDate(batch.purchaseDate)}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{batch.name}</h1>
        <p className="mt-2 text-sm text-white/65">{batch.notes || "No trip notes."}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-[10px] text-white/55">Total landed cost</p><p className="mt-1 text-lg font-bold">{money(stockCost + tripOverhead)}</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-[10px] text-white/55">Cost per unit overhead</p><p className="mt-1 text-lg font-bold">{money(overheadPerUnit)}</p></div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-soft"><TrendingUp className="text-gold" size={20} /><p className="mt-3 text-xs text-black/45">Expected profit</p><p className="mt-1 text-xl font-bold text-emerald-700">{money(expectedProfit)}</p></div>
        <div className="rounded-2xl bg-white p-4 shadow-soft"><Calculator className="text-burgundy" size={20} /><p className="mt-3 text-xs text-black/45">Actual profit</p><p className={`mt-1 text-xl font-bold ${actualProfit >= 0 ? "text-emerald-700" : "text-burgundy"}`}>{money(actualProfit)}</p></div>
      </section>

      <section>
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-wine">Products & landed cost</h2><Link href="/admin/inventory" className="flex items-center gap-1 text-xs font-bold text-burgundy"><Plus size={15} />Add or restock</Link></div>
        <div className="mt-3 space-y-3">
          {products.length === 0 && <Empty>No products are linked to this trip yet.</Empty>}
          {products.map((product) => {
            const productEntries = entries.filter((entry) => entry.inventoryId === product.id);
            const quantity = productEntries.reduce((sum, entry) => sum + entry.quantity, 0) || product.totalQuantity;
            const baseCost = productEntries.length ? productEntries.reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0) / Math.max(quantity, 1) : product.costPrice;
            const landedCost = baseCost + overheadPerUnit;
            const markup = landedCost ? ((product.sellingPrice - landedCost) / landedCost) * 100 : 0;
            const margin = product.sellingPrice ? ((product.sellingPrice - landedCost) / product.sellingPrice) * 100 : 0;
            return <article key={product.id} className="rounded-2xl bg-white p-4 shadow-soft"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{product.name}</h3><p className="mt-1 text-xs text-black/45">{quantity} bought · {money(baseCost)} base cost</p></div><Boxes size={19} className="text-gold" /></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><p className="text-[9px] text-black/40">Landed</p><strong className="text-sm">{money(landedCost)}</strong></div><div><p className="text-[9px] text-black/40">Markup</p><strong className="text-sm">{markup.toFixed(1)}%</strong></div><div><p className="text-[9px] text-black/40">Margin</p><strong className="text-sm">{margin.toFixed(1)}%</strong></div></div><p className="mt-3 rounded-xl bg-gold/10 p-2 text-[11px] text-wine">30% markup price: {money(landedCost * 1.3)} · 30% margin price: {money(landedCost / 0.7)}</p><Link href={`/admin/inventory/${product.id}`} className="mt-3 flex h-10 items-center justify-center rounded-xl border border-burgundy/15 text-sm font-semibold text-burgundy">Open product</Link></article>;
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold text-wine">Trip expenses</h2><Link href="/admin/expenses" className="flex items-center gap-1 text-xs font-bold text-burgundy"><Plus size={15} />Add expense</Link></div>
        <div className="mt-3 space-y-2">{linkedExpenses.length === 0 && <Empty>No extra expenses linked to this trip.</Empty>}{linkedExpenses.map((expense) => <div key={expense.id} className="flex items-center gap-3 rounded-2xl bg-white p-4"><ReceiptText size={18} className="text-gold" /><div className="min-w-0 flex-1"><p className="capitalize font-semibold">{expense.category}</p><p className="truncate text-xs text-black/45">{expense.notes || "No notes"}</p></div><strong>{money(expense.amount)}</strong></div>)}</div>
      </section>
    </div>
  );
}

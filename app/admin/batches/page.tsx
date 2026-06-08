"use client";

import { FormEvent } from "react";
import { Megaphone, PackageCheck } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Field, Form, Modal, PageHeader, useModal } from "@/components/ui";
import { money, shortDate } from "@/lib/format";
import { SalesChannel } from "@/lib/types";
import Link from "next/link";

const channels: SalesChannel[] = ["WhatsApp Status", "Facebook", "TikTok", "Instagram", "Website"];

export default function AdminBatchesPage() {
  const { data, addBatch } = useData();
  const modal = useModal();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    addBatch({
      name: String(f.get("name")),
      source: String(f.get("source")),
      purchaseDate: String(f.get("purchaseDate")),
      totalCost: Number(f.get("totalCost")),
      transportCost: Number(f.get("transportCost")),
      channels: channels.filter((channel) => f.getAll("channels").includes(channel)),
      notes: String(f.get("notes")),
      status: "open",
      allocationMethod: "per-unit",
    });
    modal.hide();
  }

  return (
    <div>
      <PageHeader title="Post batches" subtitle="Track every stock trip from buying to profit" action={modal.show} />
      <div className="space-y-4">
        {data.batches.map((batch) => {
          const products = data.inventory.filter((item) => item.batchId === batch.id);
          const orders = data.orders.filter((order) => products.some((product) => product.id === order.inventoryId));
          const sold = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.quantity, 0);
          const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
          const profit = revenue - batch.totalCost - batch.transportCost;
          return (
            <article key={batch.id} className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-gold">{batch.source} • {shortDate(batch.purchaseDate)}</p><h2 className="mt-1 font-display text-xl font-semibold text-wine">{batch.name}</h2></div><div className="grid h-11 w-11 place-items-center rounded-xl bg-burgundy/10 text-burgundy"><Megaphone size={20} /></div></div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-cream p-3 text-center"><div><p className="text-[10px] text-black/45">Items posted</p><strong>{products.reduce((sum, item) => sum + item.quantity, 0) + sold}</strong></div><div><p className="text-[10px] text-black/45">Orders</p><strong>{orders.length}</strong></div><div><p className="text-[10px] text-black/45">Sold</p><strong>{sold}</strong></div></div>
              <div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs text-black/45">Trip cost</p><p className="font-bold">{money(batch.totalCost + batch.transportCost)}</p></div><div><p className="text-xs text-black/45">Estimated profit</p><p className={`font-bold ${profit >= 0 ? "text-emerald-700" : "text-burgundy"}`}>{money(profit)}</p></div></div>
              <div className="mt-4 flex flex-wrap gap-1.5">{batch.channels.map((channel) => <span key={channel} className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-wine">{channel}</span>)}</div>
              <Link href={`/admin/batches/${batch.id}`} className="mt-4 flex h-11 items-center justify-center rounded-xl border border-burgundy/15 font-semibold text-burgundy">Open buying trip</Link>
            </article>
          );
        })}
      </div>
      {modal.open && <Modal title="Create post batch" onClose={modal.hide}><Form onSubmit={submit} submitLabel="Create batch"><Field name="name" label="Batch name" placeholder="Freetown Stock — June 7" required /><div className="grid grid-cols-2 gap-3"><Field name="source" label="Source / buying location" required /><Field name="purchaseDate" label="Purchase date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /><Field name="totalCost" label="Total stock cost (NLe)" type="number" required /><Field name="transportCost" label="Transport cost" type="number" defaultValue="0" required /></div><fieldset><legend className="mb-2 text-sm font-medium">Where will this batch be posted?</legend><div className="grid grid-cols-2 gap-2">{channels.map((channel) => <label key={channel} className="flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm"><input type="checkbox" name="channels" value={channel} defaultChecked={channel === "WhatsApp Status"} className="accent-burgundy" />{channel}</label>)}</div></fieldset><Field name="notes" label="Notes" /><p className="flex items-center gap-2 rounded-xl bg-gold/10 p-3 text-xs text-wine"><PackageCheck size={16} />Add products to this batch from Inventory after saving.</p></Form></Modal>}
    </div>
  );
}

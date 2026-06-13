"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, Eye, EyeOff, History, ImageIcon, Minus, Plus, RotateCcw, Star } from "lucide-react";
import Link from "next/link";
import { useData } from "@/components/data-provider";
import { Field, Form, Modal, Select, useModal } from "@/components/ui";
import { ProductPublisher } from "@/components/product-publisher";
import { ProductPostAssistant } from "@/components/product-post-assistant";
import { ConfirmDelete } from "@/components/confirm-delete";
import { money } from "@/lib/format";

export default function InventoryPage() {
  const { data, isAdmin, restockInventory, adjustInventory, updateInventory, remove } = useData();
  const restockModal = useModal();
  const [restockId, setRestockId] = useState("");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const value = data.inventory.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  const visibleInventory = data.inventory.filter((item) =>
    `${item.name} ${item.category} ${item.color} ${item.size} ${item.supplier}`.toLowerCase().includes(query.toLowerCase())
  );

  async function submitRestock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setSaving(true);
    setFormError("");
    try {
      await restockInventory(restockId, {
        quantity: Number(f.get("quantity")),
        unitCost: Number(f.get("unitCost")),
        supplier: String(f.get("supplier")),
        batchId: String(f.get("batchId")) || undefined,
        notes: String(f.get("notes")),
      });
      restockModal.hide();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not add this stock.");
    } finally {
      setSaving(false);
    }
  }

  const restockItem = data.inventory.find((item) => item.id === restockId);

  async function setWebsiteVisibility(item: (typeof data.inventory)[number], isPublic: boolean, isFeatured = item.isFeatured) {
    await updateInventory(item.id, {
      name: item.name,
      category: item.category,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier,
      lowStockAt: item.lowStockAt,
      status: item.status,
      size: item.size,
      color: item.color,
      supplierPhotoUrl: item.supplierPhotoUrl,
      shopPhotoUrl: item.shopPhotoUrl,
      productImages: item.productImages,
      tryOnUrl: item.tryOnUrl,
      batchId: item.batchId,
      isPublic,
      isFeatured,
      publicStatus: isPublic ? "available" : "hidden",
      publicDescription: item.publicDescription || "",
      slug: item.slug || "",
      sizes: item.sizes || (item.size ? [item.size] : []),
      colors: item.colors || (item.color ? [item.color] : []),
      occasions: item.occasions || [],
      sourceType: item.sourceType || "ready-made",
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="font-display text-3xl font-semibold text-wine">Inventory</h1><p className="mt-1 text-sm text-black/55">{isAdmin ? `${data.inventory.length} products · ${money(value)} at cost` : `${data.inventory.length} products available to sell`}</p></div>{isAdmin && <ProductPublisher />}</div>
      <div className="mb-5 flex items-center rounded-2xl border border-black/10 bg-white px-4"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a product to view or restock" className="h-12 min-w-0 flex-1 bg-transparent outline-none" />{query && <button onClick={() => setQuery("")} className="text-xs font-semibold text-burgundy">Clear</button>}</div>
      <div className="space-y-3">
        {visibleInventory.map((item) => {
          const low = item.quantity <= item.lowStockAt;
          const photo = item.shopPhotoUrl || item.supplierPhotoUrl;
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
              <div className="flex">
                <div className="grid h-32 w-28 shrink-0 place-items-center bg-burgundy/5">
                  {photo ? <img src={photo} alt={item.name} className="h-full w-full object-cover" /> : <ImageIcon className="text-burgundy/25" size={34} />}
                </div>
                <div className="min-w-0 flex-1 p-4">
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-semibold">{item.name}</h2>{low && <AlertTriangle size={16} className="shrink-0 text-gold" />}</div><p className="mt-1 text-xs capitalize text-black/45">{item.category} • {item.color || "No color"} • {item.size || "No size"}</p></div>{isAdmin && <ConfirmDelete itemName={item.name} itemType="inventory item" onDelete={() => remove("inventory", item.id)} className="text-black/25" />}</div>
                  <p className="mt-3 font-bold text-burgundy">{money(item.sellingPrice)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{item.availableQuantity} available</span><span className="rounded-full bg-gold/10 px-2 py-1 text-wine">{item.reservedQuantity} reserved</span><span className="rounded-full bg-burgundy/10 px-2 py-1 text-burgundy">{item.soldQuantity} sold</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 px-4 py-3">
                <div>{isAdmin && <p className="text-xs text-black/45">Cost {money(item.costPrice)} • {item.supplier}</p>}<p className="mt-1 flex items-center gap-1 text-[10px] text-black/35"><History size={11} />{data.stockEntries.filter((entry) => entry.inventoryId === item.id).length} stock entries</p></div>
                {isAdmin && <div className="flex items-center gap-2"><button onClick={() => { setRestockId(item.id); restockModal.show(); }} className="flex h-10 items-center gap-1.5 rounded-xl bg-burgundy px-3 text-xs font-semibold text-white"><RotateCcw size={14} />Restock</button><div className="flex items-center rounded-xl border border-black/10"><button onClick={() => adjustInventory(item.id, -1)} className="grid h-10 w-9 place-items-center"><Minus size={15} /></button><span className={`min-w-7 text-center font-bold ${low ? "text-gold" : "text-burgundy"}`}>{item.quantity}</span><button onClick={() => adjustInventory(item.id, 1)} className="grid h-10 w-9 place-items-center"><Plus size={15} /></button></div></div>}
              </div>
              {isAdmin && <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
                <button onClick={() => setWebsiteVisibility(item, !item.isPublic)} className={`flex h-11 items-center justify-center gap-2 rounded-xl font-semibold ${item.isPublic ? "bg-emerald-50 text-emerald-700" : "border border-burgundy/15 text-burgundy"}`}>
                  {item.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}{item.isPublic ? "On website" : "Publish"}
                </button>
                <button onClick={() => setWebsiteVisibility(item, true, !item.isFeatured)} className={`flex h-11 items-center justify-center gap-2 rounded-xl font-semibold ${item.isFeatured ? "bg-gold/20 text-burgundy" : "border border-gold/25 text-burgundy"}`}>
                  <Star size={16} className={item.isFeatured ? "fill-gold text-gold" : ""} />{item.isFeatured ? "Featured" : "Feature"}
                </button>
                <div className="col-span-2"><ProductPostAssistant product={item} /></div>
              </div>}
              <Link href={`/admin/inventory/${item.id}`} className="mx-4 mb-4 flex h-11 items-center justify-center rounded-xl border border-burgundy/15 font-semibold text-burgundy">Open product details</Link>
            </article>
          );
        })}
      </div>
      {restockModal.open && restockItem && <Modal title={`Restock ${restockItem.name}`} onClose={restockModal.hide}><Form onSubmit={submitRestock} submitLabel={saving ? "Saving stock..." : "Add stock"} submitDisabled={saving}><div className="rounded-xl bg-gold/10 p-3 text-sm"><strong>{restockItem.quantity} currently available</strong><p className="mt-1 text-xs text-black/50">{restockItem.color} • {restockItem.size} • selling at {money(restockItem.sellingPrice)}</p></div><div className="grid grid-cols-2 gap-3"><Field name="quantity" label="Quantity received" type="number" min="1" defaultValue="1" required /><Field name="unitCost" label="New unit cost (NLe)" type="number" defaultValue={restockItem.costPrice} required /></div><Field name="supplier" label="Supplier / source" defaultValue={restockItem.supplier} /><Select name="batchId" label="Buying / post batch" defaultValue={restockItem.batchId || ""}><option value="">No batch</option>{data.batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select><Field name="notes" label="Restock notes" placeholder="New color mix, buying trip details…" />{formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p>}</Form></Modal>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, History, ImageIcon, LoaderCircle, Pencil, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useData } from "@/components/data-provider";
import { Empty, Field, Form, Modal, Select, useModal } from "@/components/ui";
import { money, shortDate } from "@/lib/format";
import { ProductStatus } from "@/lib/types";

const categories = ["dress", "top", "skirt", "shoes", "bag", "accessory", "fabric", "other"];

async function resizeProductImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo.");
  if (file.size > 25 * 1024 * 1024) throw new Error("This photo is over 25 MB. Please choose a smaller image.");

  const localUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("This phone image format could not be prepared. Try JPEG, PNG, or WebP."));
      nextImage.src = localUrl;
    });
    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the photo.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
    if (!blob) throw new Error("This browser could not resize the photo.");
    return new File([blob], `roseden-${Date.now()}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(localUrl);
  }
}

export default function InventoryDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, updateInventory, uploadProductImage } = useData();
  const modal = useModal();
  const [shopPhotoUrl, setShopPhotoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState("");
  const item = data.inventory.find((entry) => entry.id === params.id);

  if (!item) {
    return <div><Link href="/inventory" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Inventory</Link><Empty>Product not found.</Empty></div>;
  }

  const stockEntries = data.stockEntries.filter((entry) => entry.inventoryId === item.id);
  const orders = data.orders.filter((order) => order.inventoryId === item.id);
  const photo = item.shopPhotoUrl || item.supplierPhotoUrl;
  useEffect(() => () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function openEdit() {
    setShopPhotoUrl(item!.shopPhotoUrl);
    setPreviewUrl(item!.shopPhotoUrl);
    setUploadComplete(false);
    setError("");
    modal.show();
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    const immediatePreview = URL.createObjectURL(file);
    setPreviewUrl(immediatePreview);
    setUploadComplete(false);
    setUploading(true);
    setError("");
    try {
      const preparedFile = await resizeProductImage(file);
      const publicUrl = await uploadProductImage(preparedFile);
      setShopPhotoUrl(publicUrl);
      setPreviewUrl(publicUrl);
      setUploadComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload this image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (uploading) {
      setError("Please wait for the photo upload to finish.");
      return;
    }
    const form = new FormData(event.currentTarget);
    try {
      await updateInventory(item!.id, {
        name: String(form.get("name")),
        category: String(form.get("category")),
        costPrice: Number(form.get("costPrice")),
        sellingPrice: Number(form.get("sellingPrice")),
        supplier: String(form.get("supplier")),
        lowStockAt: Number(form.get("lowStockAt")),
        status: String(form.get("status")) as ProductStatus,
        size: String(form.get("size")),
        color: String(form.get("color")),
        supplierPhotoUrl: String(form.get("supplierPhotoUrl")),
        shopPhotoUrl,
        tryOnUrl: String(form.get("tryOnUrl")),
        batchId: String(form.get("batchId")) || undefined,
      });
      modal.hide();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this product.");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/inventory" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Inventory</Link>
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
          <div className="grid h-64 place-items-center bg-burgundy/5">{photo ? <img src={photo} alt={item.name} className="h-full w-full object-cover" /> : <ImageIcon size={52} className="text-burgundy/20" />}</div>
          <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs capitalize text-gold">{item.category}</p><h1 className="mt-1 font-display text-3xl font-semibold text-wine">{item.name}</h1><p className="mt-2 text-sm text-black/50">{item.color || "No color"} - {item.size || "No size"}</p></div><button onClick={openEdit} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-burgundy text-white" aria-label="Edit product"><Pencil size={19} /></button></div><div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-black/45">Selling price</p><p className="text-xl font-bold text-burgundy">{money(item.sellingPrice)}</p></div><div className="text-right"><p className="text-xs text-black/45">Unit cost</p><p className="font-semibold">{money(item.costPrice)}</p></div></div></div>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-soft">
        <h2 className="font-display text-xl font-semibold text-wine">Quantity</h2>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center"><div><p className="text-[10px] text-black/45">Available</p><p className="mt-1 text-lg font-bold text-emerald-700">{item.availableQuantity}</p></div><div><p className="text-[10px] text-black/45">Reserved</p><p className="mt-1 text-lg font-bold text-gold">{item.reservedQuantity}</p></div><div><p className="text-[10px] text-black/45">Sold</p><p className="mt-1 text-lg font-bold text-burgundy">{item.soldQuantity}</p></div><div><p className="text-[10px] text-black/45">Total</p><p className="mt-1 text-lg font-bold">{item.totalQuantity}</p></div></div>
        <p className="mt-4 rounded-xl bg-cream p-3 text-xs text-black/55">Available stock changes when orders are reserved or cancelled. Sold stock comes from delivered orders.</p>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-soft"><h2 className="flex items-center gap-2 font-display text-xl font-semibold text-wine"><History size={19} className="text-gold" />Stock history</h2><div className="mt-3 space-y-2">{stockEntries.length === 0 && <p className="text-sm text-black/45">No stock entries recorded.</p>}{stockEntries.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-xl bg-cream p-3"><div><p className="text-sm font-semibold">+{entry.quantity} units</p><p className="text-xs text-black/45">{shortDate(entry.stockedAt)} - {entry.supplier || "No supplier"}</p></div><p className="text-sm font-bold">{money(entry.unitCost)} each</p></div>)}</div></section>

      <section><h2 className="font-display text-xl font-semibold text-wine">Related orders</h2><div className="mt-3 space-y-2">{orders.length === 0 && <Empty>No orders linked to this product.</Empty>}{orders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft"><div><p className="font-semibold">{data.customers.find((customer) => customer.id === order.customerId)?.name || "Walk-in customer"}</p><p className="mt-1 text-xs capitalize text-black/45">{order.status} - {order.quantity} item(s)</p></div><p className="font-bold text-burgundy">{money(order.total)}</p></Link>)}</div></section>

      {modal.open && <Modal title="Edit product" onClose={modal.hide}><Form onSubmit={submit} submitLabel={uploading ? "Uploading photo..." : "Save product"} submitDisabled={uploading}>
        <div className="rounded-2xl border border-dashed border-burgundy/25 bg-white p-3">
          <div className="relative grid h-44 place-items-center overflow-hidden rounded-xl bg-burgundy/5">
            {previewUrl ? <img src={previewUrl} alt="Selected product preview" className="h-full w-full object-cover" /> : <Camera size={36} className="text-burgundy/25" />}
            {uploading && <div className="absolute inset-0 grid place-items-center bg-black/45 text-white"><div className="flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 text-sm font-semibold"><LoaderCircle size={18} className="animate-spin" />Preparing and uploading</div></div>}
          </div>
          <label className={`mt-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-gold/15 font-semibold text-wine ${uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><Upload size={18} />{previewUrl ? "Choose a different photo" : "Take or choose photo"}<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" onChange={upload} className="hidden" disabled={uploading} /></label>
          {uploadComplete && <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} />Photo uploaded. Tap Save product.</p>}
          {!uploadComplete && !error && <p className="mt-2 text-center text-xs text-black/45">The photo previews immediately and is resized for mobile data before upload.</p>}
          {error && <p className="mt-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p>}
        </div>
        <Field name="name" label="Product name" defaultValue={item.name} required />
        <div className="grid grid-cols-2 gap-3"><Select name="category" label="Category" defaultValue={item.category}>{categories.map((category) => <option key={category}>{category}</option>)}</Select><Select name="status" label="Product status" defaultValue={item.status}><option value="available">Available</option><option value="cancelled">Inactive</option></Select><Field name="color" label="Color" defaultValue={item.color} /><Field name="size" label="Size" defaultValue={item.size} /></div>
        <div className="grid grid-cols-2 gap-3"><Field name="costPrice" label="Cost price (NLe)" type="number" min="0" step="0.01" defaultValue={item.costPrice} required /><Field name="sellingPrice" label="Selling price" type="number" min="0" step="0.01" defaultValue={item.sellingPrice} required /><Field name="lowStockAt" label="Low stock alert" type="number" min="0" defaultValue={item.lowStockAt} required /></div>
        <Field name="supplier" label="Supplier / source" defaultValue={item.supplier} />
        <Field name="supplierPhotoUrl" label="Supplier / model photo URL" type="url" defaultValue={item.supplierPhotoUrl} />
        <Field name="tryOnUrl" label="Try-on photo or video link" type="url" defaultValue={item.tryOnUrl} />
        <Select name="batchId" label="Buying / post batch" defaultValue={item.batchId || ""}><option value="">No batch</option>{data.batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
      </Form></Modal>}
    </div>
  );
}

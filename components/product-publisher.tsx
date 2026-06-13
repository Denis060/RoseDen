"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { Camera, CheckCircle2, Eye, ImageIcon, LoaderCircle, Plus, Sparkles, Upload, WandSparkles } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Field, Form, Modal, Select, useModal } from "@/components/ui";
import { commonColors, commonOccasions, ProductOptionsPicker, standardSizes } from "@/components/product-options-picker";
import { money } from "@/lib/format";
import { prepareProductImage, productSlug } from "@/lib/product-image";
import { suggestProductName } from "@/lib/product-copy";

const categories = ["dress", "top", "skirt", "shorts", "shoes", "bag", "accessory", "fabric", "other"];

export function ProductPublisher() {
  const { data, addInventory, uploadProductImage } = useData();
  const modal = useModal();
  const [images, setImages] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState({ name: "", price: "", category: "dress", sizes: [] as string[], colors: [] as string[], occasions: [] as string[] });

  function open() {
    setImages([]);
    setMessage("");
    setPreview({ name: "", price: "", category: "dress", sizes: [], colors: [], occasions: [] });
    modal.show();
  }

  async function upload(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    setMessage("");
    try {
      const url = await uploadProductImage(await prepareProductImage(file));
      setImages((current) => {
        const next = [...current];
        next[index] = url;
        return next.slice(0, 3);
      });
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not upload this photo.");
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadingIndex !== null) return setMessage("Please wait for the photo upload to finish.");
    const form = new FormData(event.currentTarget);
    const publish = String(form.get("publish")) === "yes";
    const sizes = preview.sizes;
    const colors = preview.colors;
    const category = String(form.get("category"));
    const name = String(form.get("name")).trim() || suggestProductName(category, colors);
    if (publish && images.length === 0) return setMessage("Add at least one photo before publishing this product.");

    setSaving(true);
    setMessage("");
    try {
      await addInventory({
        name,
        category,
        costPrice: Number(form.get("costPrice")),
        sellingPrice: Number(form.get("sellingPrice")),
        quantity: Number(form.get("quantity")),
        supplier: String(form.get("supplier")),
        lowStockAt: Number(form.get("lowStockAt")),
        status: "available",
        size: sizes.join(", "),
        color: colors.join(", "),
        supplierPhotoUrl: "",
        shopPhotoUrl: images[0] || "",
        productImages: images.filter(Boolean),
        tryOnUrl: String(form.get("tryOnUrl")),
        batchId: String(form.get("batchId")) || undefined,
        isPublic: publish,
        isFeatured: form.get("isFeatured") === "on",
        homepageOrder: 1000,
        publicStatus: publish ? "available" : "hidden",
        publicDescription: String(form.get("description")),
        slug: productSlug(name),
        sizes,
        colors,
        occasions: preview.occasions,
        sourceType: String(form.get("sourceType")) as "ready-made" | "original" | "tailoring-sample",
      });
      modal.hide();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save this product.");
    } finally {
      setSaving(false);
    }
  }

  function suggestName() {
    setPreview((current) => ({ ...current, name: suggestProductName(current.category, current.colors) }));
  }

  return (
    <>
      <button onClick={open} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-burgundy text-white shadow-soft" aria-label="Add and publish product"><Plus /></button>
      {modal.open && <Modal title="Add & publish product" onClose={modal.hide}>
        <Form onSubmit={submit} submitLabel={saving ? "Saving product..." : "Save product"} submitDisabled={saving || uploadingIndex !== null}>
          <section>
            <div className="mb-2 flex items-center justify-between"><div><p className="font-semibold text-wine">1. Product photos</p><p className="text-xs text-black/45">The first photo appears on the shop card.</p></div><Camera className="text-gold" size={20} /></div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => (
                <label key={index} className="relative grid aspect-[4/5] cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-burgundy/20 bg-white">
                  {images[index] ? <img src={images[index]} alt={`Product view ${index + 1}`} className="h-full w-full object-cover" /> : <span className="px-2 text-center text-[10px] font-semibold text-burgundy/50"><Upload className="mx-auto mb-1" size={19} />Photo {index + 1}</span>}
                  {uploadingIndex === index && <span className="absolute inset-0 grid place-items-center bg-black/50 text-white"><LoaderCircle className="animate-spin" /></span>}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" onChange={(event) => upload(event, index)} className="hidden" />
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-wine">2. Simple product details</p><p className="text-xs text-black/45">A suggested name is enough. It does not need to be a brand name.</p></div><WandSparkles className="shrink-0 text-gold" size={20} /></div>
            <div className="grid grid-cols-2 gap-3">
              <Select name="category" label="Category" value={preview.category} onChange={(event) => setPreview((current) => ({ ...current, category: event.target.value }))}>{categories.map((category) => <option key={category}>{category}</option>)}</Select>
              <Select name="sourceType" label="Collection"><option value="ready-made">Ready-made</option><option value="original">RoseDen Original</option><option value="tailoring-sample">Tailoring sample</option></Select>
              <Field name="sellingPrice" label="Selling price (NLe)" type="number" min="0" step="0.01" value={preview.price} onChange={(event) => setPreview((current) => ({ ...current, price: event.target.value }))} required />
              <Field name="quantity" label="Quantity" type="number" min="0" defaultValue="1" required />
            </div>
            <ProductOptionsPicker label="Available sizes" options={standardSizes} selected={preview.sizes} onChange={(sizes) => setPreview((current) => ({ ...current, sizes }))} customPlaceholder="Add another size, e.g. 42" />
            <ProductOptionsPicker label="Available colors" options={commonColors} selected={preview.colors} onChange={(colors) => setPreview((current) => ({ ...current, colors }))} customPlaceholder="Add another color" />
            <ProductOptionsPicker label="Perfect for" options={commonOccasions} selected={preview.occasions} onChange={(occasions) => setPreview((current) => ({ ...current, occasions }))} customPlaceholder="Add another occasion" />
            <div className="rounded-2xl border border-gold/25 bg-gold/10 p-3">
              <Field name="name" label="Product name (optional)" placeholder="RoseDen can suggest one" value={preview.name} onChange={(event) => setPreview((current) => ({ ...current, name: event.target.value }))} />
              <button type="button" onClick={suggestName} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-burgundy"><WandSparkles size={17} />Suggest simple name</button>
            </div>
            <label className="block text-sm font-medium text-ink">Customer description<textarea name="description" rows={3} placeholder="Describe the fit, fabric, occasion, or special detail." className="mt-1.5 w-full rounded-xl border border-black/10 bg-cream px-3 py-3 outline-none focus:border-gold" /></label>
          </section>

          <section className="space-y-4 rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <p className="font-semibold text-wine">3. Business details</p>
            <div className="grid grid-cols-2 gap-3"><Field name="costPrice" label="Cost price (NLe)" type="number" min="0" step="0.01" required /><Field name="lowStockAt" label="Low stock alert" type="number" min="0" defaultValue="1" required /></div>
            <Field name="supplier" label="Supplier / source" />
            <Select name="batchId" label="Buying trip"><option value="">No buying trip</option>{data.batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
            <div>
              <Field name="tryOnUrl" label="Short product / try-on video link (optional)" type="url" placeholder="TikTok, Instagram, YouTube, Facebook..." />
              <p className="mt-1 text-xs leading-5 text-black/45">Paste a public video link. Customers can open it from the product page.</p>
            </div>
          </section>

          <section className="rounded-2xl bg-wine p-4 text-white">
            <div className="flex items-center gap-2"><Eye className="text-gold" size={19} /><p className="font-semibold">Customer preview</p></div>
            <div className="mt-3 flex gap-3 rounded-xl bg-white p-3 text-ink">
              <div className="grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-marble/50">{images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="text-burgundy/20" />}</div>
              <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wider text-gold">{preview.category}</p><p className="mt-1 font-display text-lg font-semibold text-burgundy">{preview.name || suggestProductName(preview.category, preview.colors)}</p><p className="mt-2 font-bold text-gold">{money(Number(preview.price || 0))}</p><p className="mt-2 text-[10px] text-black/45">{preview.sizes.join(", ") || "Sizes"} · {preview.colors.join(", ") || "Colors"}</p></div>
            </div>
          </section>

          <section>
            <p className="mb-2 font-semibold text-wine">4. Visibility</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex min-h-14 items-center gap-2 rounded-xl border border-burgundy/15 bg-white px-3 text-sm font-semibold"><input type="radio" name="publish" value="no" defaultChecked className="accent-burgundy" />Save privately</label>
              <label className="flex min-h-14 items-center gap-2 rounded-xl bg-gold px-3 text-sm font-bold text-burgundy"><input type="radio" name="publish" value="yes" className="accent-burgundy" />Publish now</label>
            </div>
            <label className="mt-2 flex min-h-12 items-center gap-2 rounded-xl bg-white px-3 text-sm"><input type="checkbox" name="isFeatured" className="accent-burgundy" /><Sparkles size={17} className="text-gold" />Show on homepage</label>
          </section>

          {images.length > 0 && <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} />Photos uploaded and optimized for mobile.</p>}
          {message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}
        </Form>
      </Modal>}
    </>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy, Megaphone, Send, Share2 } from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { Modal, useModal } from "@/components/ui";
import { productShareCaption } from "@/lib/product-copy";
import { prepareShareImage, shareProduct } from "@/lib/share-product";
import { supabase } from "@/lib/supabase";

const channels = ["WhatsApp Status", "Facebook", "TikTok", "Instagram", "Website"] as const;

export function ProductPostAssistant({ product }: { product: InventoryItem }) {
  const modal = useModal();
  const [selected, setSelected] = useState<string[]>(["WhatsApp Status"]);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const productColors = product.colors?.length ? product.colors : product.color.split(/[,/]/).map((value) => value.trim()).filter(Boolean);
  const productSizes = product.sizes?.length ? product.sizes : product.size.split(",").map((value) => value.trim()).filter(Boolean);
  const generatedCaption = productShareCaption({
    name: product.name,
    category: product.category,
    colors: productColors,
    sizes: productSizes,
    price: product.sellingPrice,
    slug: product.slug,
    description: product.publicDescription,
  }, typeof window === "undefined" ? "" : window.location.origin);

  function open() {
    setCaption(generatedCaption);
    setMessage("");
    setImageFile(null);
    void prepareShareImage(product.productImages?.[0] || product.shopPhotoUrl).then(setImageFile);
    modal.show();
  }

  function toggle(channel: string) {
    setSelected((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);
  }

  async function share() {
    setMessage("");
    try {
      const result = await shareProduct({
        title: `${product.name} | RoseDen Atelier`,
        text: caption,
        url: product.slug ? `${window.location.origin}/shop/${product.slug}` : undefined,
        imageFile,
      });
      setMessage(result === "copied" ? "Caption and product link copied." : "Share sheet opened. Choose the app and finish posting.");
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setMessage("Could not open sharing. Copy the caption instead.");
    }
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setMessage("Caption copied.");
  }

  async function markPosted() {
    if (!supabase) {
      setMessage("Post marked in demo mode.");
      return;
    }
    if (selected.length === 0) {
      setMessage("Choose at least one channel.");
      return;
    }
    setSaving(true);
    setMessage("");
    const { data: post, error } = await supabase.from("content").insert({
      inventory_id: product.id,
      content_type: "photo",
      caption,
      media_url: product.productImages?.[0] || product.shopPhotoUrl || null,
      posted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select("id").single();
    if (error || !post) {
      setMessage(error?.message || "Could not record this post.");
      setSaving(false);
      return;
    }
    const { error: channelError } = await supabase.from("content_channels").insert(selected.map((channel) => ({ content_id: post.id, channel })));
    if (channelError) {
      await supabase.from("content").delete().eq("id", post.id);
      setMessage(channelError.message);
      setSaving(false);
      return;
    }
    setMessage("Post recorded in Marketing.");
    setSaving(false);
  }

  return (
    <>
      <button type="button" onClick={open} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 text-sm font-semibold text-burgundy">
        <Megaphone size={16} />Prepare post
      </button>
      {modal.open && <Modal title="Prepare product post" onClose={modal.hide}>
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">{product.category}</p>
            <p className="mt-1 font-display text-xl font-semibold text-wine">{product.name}</p>
          </div>
          <label className="block text-sm font-semibold text-wine">Caption<textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={9} className="mt-2 w-full rounded-2xl border border-black/10 bg-white p-3 text-sm leading-6 outline-none focus:border-gold" /></label>
          <fieldset><legend className="mb-2 text-sm font-semibold text-wine">Where are you posting?</legend><div className="grid grid-cols-2 gap-2">{channels.map((channel) => <button type="button" key={channel} onClick={() => toggle(channel)} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-sm ${selected.includes(channel) ? "border-gold bg-gold/15 text-burgundy" : "border-black/10 bg-white"}`}>{selected.includes(channel) ? <Check size={16} /> : <span className="h-4 w-4 rounded border border-black/20" />}{channel}</button>)}</div></fieldset>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={copyCaption} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-burgundy/15 bg-white text-sm font-semibold text-burgundy"><Copy size={17} />Copy caption</button>
            <button type="button" onClick={share} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-burgundy text-sm font-semibold text-white"><Share2 size={17} />Share from phone</button>
          </div>
          <button type="button" disabled={saving} onClick={markPosted} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-bold text-burgundy disabled:opacity-45"><Send size={18} />{saving ? "Recording..." : "I posted it - record channels"}</button>
          <p className="text-center text-[11px] leading-5 text-black/45">Your phone decides which installed apps can receive the photo and caption. RoseDen never publishes publicly without your confirmation.</p>
          {message && <p className="rounded-xl bg-white p-3 text-center text-xs font-semibold text-wine">{message}</p>}
        </div>
      </Modal>}
    </>
  );
}

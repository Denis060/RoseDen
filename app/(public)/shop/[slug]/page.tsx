"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, ImageIcon, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { money } from "@/lib/format";
import { productOrderMessage, usePublicProducts } from "@/components/public-products";
import { TrackedWhatsAppLink } from "@/components/tracked-whatsapp-link";
import { ProductShareButton } from "@/components/product-share-button";
import { useWebsiteContent, websiteWhatsappLink } from "@/components/website-content";

export default function ProductDetailPage() {
  const content = useWebsiteContent();
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = usePublicProducts();
  const product = products.find((entry) => entry.slug === slug);
  const [activeImage, setActiveImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (!product) return;
    setActiveImage(product.image);
    setSize(product.sizes[0] || "");
    setColor(product.colors[0] || "");
  }, [product]);

  if (loading) return <main className="mx-auto min-h-[60vh] max-w-5xl animate-pulse px-4 py-12"><div className="h-96 rounded-3xl bg-burgundy/5" /></main>;
  if (!product) return <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-12"><Link href="/shop" className="inline-flex items-center gap-2 font-semibold text-burgundy"><ArrowLeft size={18} />Back to shop</Link><div className="mt-10 rounded-3xl border border-dashed border-burgundy/20 p-12 text-center"><h1 className="font-display text-3xl text-wine">This piece is not currently published.</h1><p className="mt-3 text-black/50">Message RoseDen to ask about similar styles.</p></div></main>;

  const message = productOrderMessage(product, size, color);
  const available = product.status === "available";
  return (
    <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Back to shop</Link>
      <div className="mt-5 grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[28px] bg-marble/45 shadow-soft">
            {activeImage ? <Image src={activeImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" priority className="object-cover" /> : <ImageIcon size={56} className="text-burgundy/20" />}
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase shadow ${product.status === "available" ? "bg-white text-emerald-700" : product.status === "reserved" ? "bg-gold text-burgundy" : "bg-black text-white"}`}>{product.status}</span>
            {product.sourceType === "original" && <span className="absolute right-3 top-3 rounded-full bg-burgundy px-3 py-1.5 text-[10px] font-bold uppercase text-white">One-of-one</span>}
          </div>
          {product.images.length > 1 && <div className="mt-3 grid grid-cols-3 gap-2">{product.images.slice(0, 3).map((image, index) => <button key={image} onClick={() => setActiveImage(image)} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${activeImage === image ? "border-gold" : "border-transparent"}`}><Image src={image} alt={`${product.name} view ${index + 1}`} fill sizes="30vw" className="object-cover" /></button>)}</div>}
        </div>

        <div className="md:py-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">{product.sourceType.replace("-", " ")} · {product.category}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-wine sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-bold text-burgundy">{money(product.price)}</p>
          <p className="mt-5 leading-7 text-black/60">{product.description || "A carefully selected RoseDen piece. Message us for fit, styling, and delivery details."}</p>

          {product.sizes.length > 0 && <fieldset className="mt-7"><legend className="text-sm font-bold text-wine">Choose size</legend><div className="mt-2 flex flex-wrap gap-2">{product.sizes.map((option) => <button type="button" key={option} onClick={() => setSize(option)} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold ${size === option ? "border-burgundy bg-burgundy text-white" : "border-burgundy/15 bg-white text-burgundy"}`}>{option}</button>)}</div></fieldset>}
          {product.colors.length > 0 && <fieldset className="mt-5"><legend className="text-sm font-bold text-wine">Choose color</legend><div className="mt-2 flex flex-wrap gap-2">{product.colors.map((option) => <button type="button" key={option} onClick={() => setColor(option)} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold ${color === option ? "border-gold bg-gold text-burgundy" : "border-gold/25 bg-white text-burgundy"}`}>{color === option && <Check className="mr-1 inline" size={15} />}{option}</button>)}</div></fieldset>}

          <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white p-4"><p className="text-xs text-black/40">Availability</p><p className="mt-1 font-semibold capitalize">{product.status}</p></div>
            <div className="rounded-2xl bg-white p-4"><p className="text-xs text-black/40">Product code</p><p className="mt-1 truncate font-semibold">{product.slug}</p></div>
          </div>

          {available ? <TrackedWhatsAppLink
            href={websiteWhatsappLink(content.whatsappNumber, message)}
            inquiry={{ inventoryId: product.id, productName: product.name, productSlug: product.slug, selectedSize: size, selectedColor: color }}
            className="mt-7 flex h-14 items-center justify-center gap-2 rounded-full bg-burgundy font-semibold text-white shadow-soft"
          ><MessageCircle size={19} />Order selected piece on WhatsApp</TrackedWhatsAppLink> : <a href={websiteWhatsappLink(content.whatsappNumber, `Hello RoseDen Atelier, I saw ${product.name}, but it is ${product.status}. Please show me something similar.`)} target="_blank" rel="noreferrer" className="mt-7 flex h-14 items-center justify-center gap-2 rounded-full bg-gold font-bold text-burgundy"><Sparkles size={19} />Ask for something similar</a>}

          <ProductShareButton product={product} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-burgundy/15 bg-white font-semibold text-burgundy" />

          <div className="mt-5 flex gap-3 rounded-2xl border border-gold/20 bg-white p-4 text-xs leading-5 text-black/55"><ShieldCheck className="shrink-0 text-gold" size={20} /><p>Confirm availability, delivery or pickup, and payment directly with RoseDen on WhatsApp.</p></div>
        </div>
      </div>
    </main>
  );
}

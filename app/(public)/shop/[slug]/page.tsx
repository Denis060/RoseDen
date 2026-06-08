"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ImageIcon, MessageCircle } from "lucide-react";
import { money } from "@/lib/format";
import { productOrderMessage, usePublicProducts } from "@/components/public-products";
import { useWebsiteContent, websiteWhatsappLink } from "@/components/website-content";

export default function ProductDetailPage() {
  const content = useWebsiteContent();
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = usePublicProducts();
  const product = products.find((entry) => entry.slug === slug);

  if (loading) return <main className="mx-auto min-h-[60vh] max-w-5xl animate-pulse px-4 py-12"><div className="h-96 rounded-3xl bg-burgundy/5" /></main>;
  if (!product) return <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-12"><Link href="/shop" className="inline-flex items-center gap-2 font-semibold text-burgundy"><ArrowLeft size={18} />Back to shop</Link><div className="mt-10 rounded-3xl border border-dashed border-burgundy/20 p-12 text-center"><h1 className="font-display text-3xl text-wine">This piece is not currently published.</h1><p className="mt-3 text-black/50">Message RoseDen to ask about similar styles.</p></div></main>;

  const message = productOrderMessage(product);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Back to shop</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          {product.images.slice(0, 3).map((image, index) => <div key={image} className={`relative grid place-items-center overflow-hidden rounded-[24px] bg-burgundy/5 ${index === 0 ? "col-span-2 aspect-[4/5]" : "aspect-square"}`}><Image src={image} alt={`${product.name} view ${index + 1}`} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"} priority={index === 0} className="object-cover" /></div>)}
          {product.images.length === 0 && <div className="col-span-2 grid aspect-[4/5] place-items-center rounded-[32px] bg-burgundy/5"><ImageIcon size={56} className="text-burgundy/20" /></div>}
        </div>
        <div className="md:py-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">{product.sourceType.replace("-", " ")} · {product.category}</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-wine">{product.name}</h1>
          <p className="mt-5 text-2xl font-bold text-burgundy">{money(product.price)}</p>
          <p className="mt-6 leading-7 text-black/60">{product.description || "A carefully selected RoseDen piece. Message us for fit, styling, and delivery details."}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {[["Sizes", product.sizes.join(", ") || "Ask RoseDen"], ["Colors", product.colors.join(", ") || "Ask RoseDen"], ["Status", product.status], ["Code", product.slug]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-4"><p className="text-xs text-black/40">{label}</p><p className="mt-1 truncate text-sm font-semibold capitalize">{value}</p></div>)}
          </div>
          <a href={websiteWhatsappLink(content.whatsappNumber, message)} target="_blank" rel="noreferrer" className="mt-8 flex h-14 items-center justify-center gap-2 rounded-full bg-burgundy font-semibold text-white"><MessageCircle size={19} />Order this piece on WhatsApp</a>
        </div>
      </div>
    </main>
  );
}

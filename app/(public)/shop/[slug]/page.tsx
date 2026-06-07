"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ImageIcon, MessageCircle } from "lucide-react";
import { money } from "@/lib/format";
import { usePublicProducts } from "@/components/public-products";
import { whatsappLink } from "@/components/public-site";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading } = usePublicProducts();
  const product = products.find((entry) => entry.slug === slug);

  if (loading) return <main className="mx-auto min-h-[60vh] max-w-5xl animate-pulse px-4 py-12"><div className="h-96 rounded-3xl bg-burgundy/5" /></main>;
  if (!product) return <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-12"><Link href="/shop" className="inline-flex items-center gap-2 font-semibold text-burgundy"><ArrowLeft size={18} />Back to shop</Link><div className="mt-10 rounded-3xl border border-dashed border-burgundy/20 p-12 text-center"><h1 className="font-display text-3xl text-wine">This piece is not currently published.</h1><p className="mt-3 text-black/50">Message RoseDen to ask about similar styles.</p></div></main>;

  const message = `Hello RoseDen Atelier, I am interested in this item:\n\nProduct: ${product.name}\nCode: ${product.slug}\nSize: ${product.sizes.join(", ") || "Please advise"}\nColor: ${product.colors.join(", ") || "Please advise"}\nPrice: ${money(product.price)}\n\nIs it still available?`;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy"><ArrowLeft size={18} />Back to shop</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-[32px] bg-burgundy/5">{product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <ImageIcon size={56} className="text-burgundy/20" />}</div>
        <div className="md:py-8"><p className="text-xs font-bold uppercase tracking-wider text-gold">{product.sourceType.replace("-", " ")} · {product.category}</p><h1 className="mt-3 font-display text-5xl font-semibold text-wine">{product.name}</h1><p className="mt-5 text-2xl font-bold text-burgundy">{money(product.price)}</p><p className="mt-6 leading-7 text-black/60">{product.description || "A carefully selected RoseDen piece. Message us for fit, styling, and delivery details."}</p><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4"><p className="text-xs text-black/40">Sizes</p><p className="mt-1 text-sm font-semibold">{product.sizes.join(", ") || "Ask RoseDen"}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-xs text-black/40">Colors</p><p className="mt-1 text-sm font-semibold">{product.colors.join(", ") || "Ask RoseDen"}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-xs text-black/40">Status</p><p className="mt-1 text-sm font-semibold capitalize">{product.status}</p></div><div className="rounded-2xl bg-white p-4"><p className="text-xs text-black/40">Code</p><p className="mt-1 truncate text-sm font-semibold">{product.slug}</p></div></div><a href={whatsappLink(message)} className="mt-8 flex h-14 items-center justify-center gap-2 rounded-full bg-burgundy font-semibold text-white"><MessageCircle size={19} />Order this piece on WhatsApp</a></div>
      </div>
    </main>
  );
}

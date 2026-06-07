"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ImageIcon, MessageCircle } from "lucide-react";
import { money } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { whatsappLink } from "@/components/public-site";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  image: string;
  status: string;
  sizes: string[];
  colors: string[];
  sourceType: string;
  featured: boolean;
  quantity: number;
};

function mapProduct(row: any): PublicProduct {
  return {
    id: row.id,
    name: row.product_name,
    slug: row.slug || row.id,
    category: row.category,
    price: Number(row.selling_price || 0),
    description: row.public_description || "",
    image: row.shop_photo_url || row.supplier_photo_url || row.photo_url || "",
    status: row.public_status || "available",
    sizes: row.sizes || [],
    colors: row.colors || [],
    sourceType: row.source_type || "ready-made",
    featured: Boolean(row.is_featured),
    quantity: Number(row.quantity || 0),
  };
}

export function usePublicProducts() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) return setLoading(false);
      const { data } = await supabase.from("inventory").select("id,product_name,slug,category,selling_price,public_description,shop_photo_url,supplier_photo_url,photo_url,public_status,sizes,colors,source_type,is_featured,quantity").eq("is_public", true).eq("public_status", "available").order("created_at", { ascending: false });
      setProducts((data || []).map(mapProduct));
      setLoading(false);
    }
    load();
  }, []);
  return { products, loading };
}

export function ProductCard({ product }: { product: PublicProduct }) {
  const message = `Hello RoseDen Atelier, I am interested in this item:\n\nProduct: ${product.name}\nCode: ${product.slug}\nSize: ${product.sizes.join(", ") || "Please advise"}\nColor: ${product.colors.join(", ") || "Please advise"}\nPrice: ${money(product.price)}\n\nIs it still available?`;
  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-soft">
      <Link href={`/shop/${product.slug}`} className="grid aspect-[4/5] place-items-center overflow-hidden bg-burgundy/5">{product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" /> : <ImageIcon size={42} className="text-burgundy/20" />}</Link>
      <div className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-gold">{product.category}</p><Link href={`/shop/${product.slug}`} className="mt-1 block font-display text-xl font-semibold text-wine">{product.name}</Link></div><span className="rounded-full bg-cream px-2 py-1 text-[10px] capitalize text-burgundy">{product.status}</span></div><p className="mt-3 font-bold text-burgundy">{money(product.price)}</p><a href={whatsappLink(message)} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-burgundy text-sm font-semibold text-white"><MessageCircle size={17} />Order on WhatsApp</a></div>
    </article>
  );
}

export function ProductGrid({ featuredOnly = false, originalsOnly = false }: { featuredOnly?: boolean; originalsOnly?: boolean }) {
  const { products, loading } = usePublicProducts();
  const visible = useMemo(() => products.filter((product) => (!featuredOnly || product.featured) && (!originalsOnly || product.sourceType === "original")), [featuredOnly, originalsOnly, products]);
  if (loading) return <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="aspect-[3/4] animate-pulse rounded-3xl bg-burgundy/5" />)}</div>;
  if (visible.length === 0) return <div className="rounded-3xl border border-dashed border-burgundy/20 px-6 py-14 text-center"><p className="font-display text-2xl text-wine">New pieces are being prepared.</p><p className="mt-2 text-sm text-black/50">Check back soon or message RoseDen for the latest arrivals.</p></div>;
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

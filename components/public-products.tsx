"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ImageIcon, MessageCircle, Sparkles } from "lucide-react";
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
      const { data } = await supabase
        .from("inventory")
        .select("id,product_name,slug,category,selling_price,public_description,shop_photo_url,supplier_photo_url,photo_url,public_status,sizes,colors,source_type,is_featured,quantity")
        .eq("is_public", true)
        .eq("public_status", "available")
        .order("created_at", { ascending: false });
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
    <article className="group overflow-hidden rounded-[22px] border border-gold/25 bg-white shadow-soft">
      <Link href={`/shop/${product.slug}`} className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-marble/45">
        {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <ImageIcon size={42} className="text-burgundy/20" />}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase text-burgundy shadow-sm">{product.status}</span>
      </Link>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{product.category}</p>
        <Link href={`/shop/${product.slug}`} className="mt-1 block min-h-12 font-display text-xl font-semibold leading-tight text-burgundy">{product.name}</Link>
        <p className="mt-2 font-bold text-ink">{money(product.price)}</p>
        <a href={whatsappLink(message)} target="_blank" rel="noreferrer" className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-bold text-burgundy">
          <MessageCircle size={17} />Order
        </a>
      </div>
    </article>
  );
}

export function ProductGrid({ featuredOnly = false, originalsOnly = false }: { featuredOnly?: boolean; originalsOnly?: boolean }) {
  const { products, loading } = usePublicProducts();
  const visible = useMemo(
    () => products.filter((product) => (!featuredOnly || product.featured) && (!originalsOnly || product.sourceType === "original")),
    [featuredOnly, originalsOnly, products],
  );

  if (loading) return <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="aspect-[3/4] animate-pulse rounded-3xl bg-marble/60" />)}</div>;
  if (visible.length === 0) return (
    <div className="marble-surface rounded-3xl border border-white px-6 py-12 text-center shadow-soft">
      <Sparkles className="mx-auto text-gold" />
      <p className="mt-4 font-display text-2xl text-burgundy">New pieces are being prepared.</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-black/60">Products appear here after staff opens an inventory item and turns on <strong>Show on website</strong>.</p>
      <a href={whatsappLink("Hello RoseDen Atelier, please show me your latest available pieces.")} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-burgundy px-5 text-sm font-semibold text-white">
        <MessageCircle size={17} />Ask on WhatsApp
      </a>
    </div>
  );

  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

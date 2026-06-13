"use client";

import Image from "next/image";
import Link from "next/link";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { ImageIcon, MessageCircle, Sparkles } from "lucide-react";
import { money } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { TrackedWhatsAppLink } from "@/components/tracked-whatsapp-link";
import { useWebsiteContent, websiteWhatsappLink } from "@/components/website-content";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  status: "available" | "reserved" | "sold";
  sizes: string[];
  colors: string[];
  occasions: string[];
  sourceType: string;
  featured: boolean;
  quantity: number;
  createdAt: string;
  tryOnUrl: string;
};

export function productOrderMessage(product: PublicProduct, size = "", color = "") {
  const siteOrigin = typeof window === "undefined" ? "https://roseden-os.vercel.app" : window.location.origin;
  const productUrl = `${siteOrigin}/shop/${product.slug}`;
  return `Hello RoseDen Atelier, I am interested in this item:

Product: ${product.name}
Code: ${product.slug}
Size: ${size || product.sizes.join(", ") || "Please advise"}
Color: ${color || product.colors.join(", ") || "Please advise"}
Price: ${money(product.price)}

View product and photo: ${productUrl}

Is it still available?`;
}

function mapProduct(row: any): PublicProduct {
  const images = (row.product_images || [row.shop_photo_url, row.supplier_photo_url, row.photo_url]).filter(Boolean);
  return {
    id: row.id,
    name: row.product_name,
    slug: row.slug || row.id,
    category: row.category,
    price: Number(row.selling_price || 0),
    description: row.public_description || "",
    image: images[0] || "",
    images,
    status: row.public_status || "available",
    sizes: row.sizes || [],
    colors: row.colors || [],
    occasions: row.occasions || [],
    sourceType: row.source_type || "ready-made",
    featured: Boolean(row.is_featured),
    quantity: Number(row.quantity || 0),
    createdAt: row.created_at || "",
    tryOnUrl: row.try_on_url || "",
  };
}

export function usePublicProducts() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) return setLoading(false);
      const videoResult = await supabase
        .from("inventory")
        .select("id,product_name,slug,category,selling_price,public_description,shop_photo_url,supplier_photo_url,photo_url,product_images,public_status,sizes,colors,occasions,source_type,is_featured,quantity,created_at,try_on_url")
        .eq("is_public", true)
        .neq("public_status", "hidden")
        .order("created_at", { ascending: false });
      let rows: any[] = videoResult.data || [];
      let loadError = videoResult.error;
      if (loadError) {
        const legacyResult = await supabase
          .from("inventory")
          .select("id,product_name,slug,category,selling_price,public_description,shop_photo_url,supplier_photo_url,photo_url,product_images,public_status,sizes,colors,source_type,is_featured,quantity,created_at")
          .eq("is_public", true)
          .neq("public_status", "hidden")
          .order("created_at", { ascending: false });
        rows = legacyResult.data || [];
        loadError = legacyResult.error;
      }
      if (loadError) console.error("Could not load public products:", loadError.message);
      setProducts(rows.map(mapProduct));
      setLoading(false);
    }
    load();
  }, []);

  return { products, loading };
}

function statusStyle(status: PublicProduct["status"]) {
  if (status === "sold") return "bg-black text-white";
  if (status === "reserved") return "bg-gold text-burgundy";
  return "bg-white/95 text-emerald-700";
}

export function ProductCard({ product, compact = false, index = 0 }: { product: PublicProduct; compact?: boolean; index?: number }) {
  const content = useWebsiteContent();
  const message = productOrderMessage(product);
  const disabled = product.status !== "available";
  return (
    <article
      className={`product-card-enter group w-full min-w-0 max-w-full overflow-hidden border border-gold/35 bg-white shadow-soft transition-shadow duration-300 hover:shadow-xl ${compact ? "rounded-lg" : "rounded-[22px]"}`}
      style={{ "--card-index": index } as CSSProperties}
    >
      <Link href={`/shop/${product.slug}`} className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-marble/45">
        {product.image ? <Image src={product.image} alt={product.name} fill quality={compact ? 45 : 55} sizes={compact ? "(max-width: 640px) 25vw, 220px" : "(max-width: 768px) 50vw, 280px"} className={`object-cover transition duration-500 group-hover:scale-105 ${product.status === "sold" ? "grayscale-[35%]" : ""}`} /> : <ImageIcon size={42} className="text-burgundy/20" />}
        <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[8px] font-bold uppercase shadow-sm ${statusStyle(product.status)}`}>{product.status}</span>
        {product.sourceType === "original" && <span className="absolute right-2 top-2 rounded-full bg-burgundy px-2 py-1 text-[8px] font-bold uppercase text-white">One-of-one</span>}
      </Link>
      <div className={compact ? "p-2" : "p-4"}>
        <p className={`${compact ? "text-[8px]" : "text-[10px]"} font-bold uppercase tracking-[0.12em] text-gold`}>{product.category}</p>
        <Link href={`/shop/${product.slug}`} className={`${compact ? "mt-0.5 min-h-7 text-[10px]" : "mt-1 min-h-12 text-xl"} block font-display font-semibold leading-tight text-burgundy`}>{product.name}</Link>
        <p className={`${compact ? "mt-1 text-[10px]" : "mt-2"} font-bold text-gold`}>{money(product.price)}</p>
        {!compact && <div className="mt-3 space-y-1 text-[11px] text-black/50"><p className="truncate"><strong className="text-black/65">Sizes:</strong> {product.sizes.join(", ") || "Ask RoseDen"}</p><p className="truncate"><strong className="text-black/65">Colors:</strong> {product.colors.join(", ") || "Ask RoseDen"}</p></div>}
        {!compact && (disabled
          ? <Link href={`/shop/${product.slug}`} className="mt-4 flex h-11 items-center justify-center rounded-lg border border-burgundy/15 text-sm font-semibold text-burgundy">View details</Link>
          : <TrackedWhatsAppLink
              href={websiteWhatsappLink(content.whatsappNumber, message)}
              inquiry={{ inventoryId: product.id, productName: product.name, productSlug: product.slug }}
              className="mt-4 flex h-11 min-w-0 items-center justify-center gap-1 rounded-lg bg-gold px-2 text-center text-[11px] font-bold leading-tight text-burgundy min-[420px]:text-xs sm:gap-1.5 sm:text-sm"
            ><MessageCircle size={16} className="shrink-0" />Order on WhatsApp</TrackedWhatsAppLink>)}
      </div>
    </article>
  );
}

export function ProductGrid({
  featuredOnly = false,
  originalsOnly = false,
  rail = false,
  limit,
  status = "available",
}: {
  featuredOnly?: boolean;
  originalsOnly?: boolean;
  rail?: boolean;
  limit?: number;
  status?: "available" | "reserved" | "sold" | "all";
}) {
  const content = useWebsiteContent();
  const { products, loading } = usePublicProducts();
  const visible = useMemo(() => {
    const filtered = products.filter((product) =>
      (!featuredOnly || product.featured) &&
      (!originalsOnly || product.sourceType === "original") &&
      (status === "all" || product.status === status)
    );
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [featuredOnly, limit, originalsOnly, products, status]);

  if (loading) return <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="aspect-[3/4] animate-pulse rounded-3xl bg-marble/60" />)}</div>;
  if (visible.length === 0) return (
    <div className="marble-surface rounded-3xl border border-white px-6 py-12 text-center shadow-soft">
      <Sparkles className="mx-auto text-gold" />
      <p className="mt-4 break-words font-display text-xl leading-tight text-burgundy sm:text-2xl">{status === "sold" ? "No sold pieces in this collection yet." : "New pieces are being prepared."}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-black/60">{status === "sold" ? "RoseDen Originals that find their new owner will be remembered here." : "Message RoseDen to see the latest pieces before they are published."}</p>
      {status !== "sold" && <a href={websiteWhatsappLink(content.whatsappNumber, "Hello RoseDen Atelier, please show me your latest available pieces.")} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-burgundy px-5 text-sm font-semibold text-white"><MessageCircle size={17} />Ask on WhatsApp</a>}
    </div>
  );

  if (rail) return <div className="grid grid-cols-4 gap-2 sm:gap-4">{visible.map((product, index) => <ProductCard key={product.id} product={product} compact index={index} />)}</div>;
  return <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{visible.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>;
}

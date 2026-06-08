"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, ImageIcon, MessageCircle, Sparkles } from "lucide-react";
import { money } from "@/lib/format";
import { supabase } from "@/lib/supabase";
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
  status: string;
  sizes: string[];
  colors: string[];
  sourceType: string;
  featured: boolean;
  quantity: number;
};

export function productOrderMessage(product: PublicProduct) {
  const siteOrigin = typeof window === "undefined"
    ? "https://roseden-os.vercel.app"
    : window.location.origin;
  const productUrl = `${siteOrigin}/shop/${product.slug}`;
  const imageUrl = product.image
    ? new URL(product.image, siteOrigin).toString()
    : "";

  return `Hello RoseDen Atelier, I am interested in this item:

Product: ${product.name}
Code: ${product.slug}
Size: ${product.sizes.join(", ") || "Please advise"}
Color: ${product.colors.join(", ") || "Please advise"}
Price: ${money(product.price)}

View product: ${productUrl}${imageUrl ? `\nProduct image: ${imageUrl}` : ""}

Is it still available?`;
}

const showcaseProducts: PublicProduct[] = [
  { id: "showcase-1", name: "Burgundy Power Set", slug: "burgundy-power-set", category: "RD-24-158", price: 450, description: "A confident burgundy boutique look inspired by RoseDen's new arrivals.", image: "/images/showcase/arrival-burgundy.png", images: ["/images/showcase/arrival-burgundy.png"], status: "preview", sizes: ["S", "M", "L"], colors: ["Burgundy"], sourceType: "ready-made", featured: true, quantity: 1 },
  { id: "showcase-2", name: "Ankara Elegance Dress", slug: "ankara-elegance-dress", category: "RD-24-159", price: 380, description: "A youthful African-print dress for standout everyday styling.", image: "/images/showcase/arrival-blue.png", images: ["/images/showcase/arrival-blue.png"], status: "preview", sizes: ["S", "M"], colors: ["Blue"], sourceType: "ready-made", featured: true, quantity: 1 },
  { id: "showcase-3", name: "Monochrome Midi", slug: "monochrome-midi", category: "RD-24-160", price: 420, description: "A black-and-white midi dress with a structured boutique feel.", image: "/images/showcase/arrival-monochrome.png", images: ["/images/showcase/arrival-monochrome.png"], status: "preview", sizes: ["M", "L"], colors: ["Black", "White"], sourceType: "ready-made", featured: true, quantity: 1 },
  { id: "showcase-4", name: "Neutral Chic Set", slug: "neutral-chic-set", category: "RD-24-161", price: 400, description: "A soft cream look for elegant casual moments.", image: "/images/showcase/arrival-cream.png", images: ["/images/showcase/arrival-cream.png"], status: "preview", sizes: ["S", "M"], colors: ["Cream"], sourceType: "ready-made", featured: true, quantity: 1 },
  { id: "showcase-o1", name: "Recrafted Denim Blazer", slug: "recrafted-denim-blazer", category: "RD-O-001", price: 650, description: "A one-of-one RoseDen Original denim blazer with gold detail.", image: "/images/showcase/original-denim.png", images: ["/images/showcase/original-denim.png"], status: "preview", sizes: ["M"], colors: ["Denim", "Gold"], sourceType: "original", featured: true, quantity: 1 },
  { id: "showcase-o2", name: "Upcycled Statement Piece", slug: "upcycled-statement-piece", category: "RD-O-002", price: 380, description: "A colorful redesigned statement blazer from the Originals collection.", image: "/images/showcase/original-patchwork.png", images: ["/images/showcase/original-patchwork.png"], status: "preview", sizes: ["M"], colors: ["Multi"], sourceType: "original", featured: true, quantity: 1 },
  { id: "showcase-o3", name: "Gold & Ankara Fusion", slug: "gold-ankara-fusion", category: "RD-O-003", price: 600, description: "A black-and-gold fitted RoseDen Original with boutique drama.", image: "/images/showcase/original-gold.png", images: ["/images/showcase/original-gold.png"], status: "preview", sizes: ["S", "M"], colors: ["Black", "Gold"], sourceType: "original", featured: true, quantity: 1 },
  { id: "showcase-o4", name: "Beaded Corset Top", slug: "beaded-corset-top", category: "RD-O-004", price: 480, description: "A denim corset top with gold-inspired embellishment.", image: "/images/showcase/original-corset.png", images: ["/images/showcase/original-corset.png"], status: "preview", sizes: ["S", "M"], colors: ["Denim", "Gold"], sourceType: "original", featured: true, quantity: 1 },
];

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
        .select("id,product_name,slug,category,selling_price,public_description,shop_photo_url,supplier_photo_url,photo_url,product_images,public_status,sizes,colors,source_type,is_featured,quantity")
        .eq("is_public", true)
        .eq("public_status", "available")
        .order("created_at", { ascending: false });
      const mapped = (data || []).map(mapProduct);
      setProducts(mapped.length ? mapped : showcaseProducts);
      setLoading(false);
    }
    load();
  }, []);

  return { products, loading };
}

export function ProductCard({ product, compact = false }: { product: PublicProduct; compact?: boolean }) {
  const content = useWebsiteContent();
  const message = productOrderMessage(product);
  return (
    <article className={`group overflow-hidden border border-gold/45 bg-white shadow-soft ${compact ? "rounded-lg" : "rounded-[22px]"}`}>
      <Link href={`/shop/${product.slug}`} className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-marble/45">
        {product.image ? <Image src={product.image} alt={product.name} fill sizes={compact ? "(max-width: 640px) 25vw, 220px" : "(max-width: 768px) 50vw, 280px"} className="object-cover transition duration-500 group-hover:scale-105" /> : <ImageIcon size={42} className="text-burgundy/20" />}
        {compact
          ? product.sourceType === "original"
            ? <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[7px] font-bold uppercase text-white">One-of-one</span>
            : <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-burgundy"><Heart size={11} /></span>
          : <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase text-burgundy shadow-sm">{product.status}</span>}
      </Link>
      <div className={compact ? "p-2" : "p-4"}>
        <p className={`${compact ? "text-[8px]" : "text-[10px]"} font-bold uppercase tracking-[0.12em] text-gold`}>{product.category}</p>
        <Link href={`/shop/${product.slug}`} className={`${compact ? "mt-0.5 min-h-7 text-[10px]" : "mt-1 min-h-12 text-xl"} block font-display font-semibold leading-tight text-burgundy`}>{product.name}</Link>
        <p className={`${compact ? "mt-1 text-[10px]" : "mt-2"} font-bold text-gold`}>{money(product.price)}</p>
        <a href={websiteWhatsappLink(content.whatsappNumber, message)} target="_blank" rel="noreferrer" className={`${compact ? "hidden" : "mt-4 flex h-11 text-sm"} items-center justify-center gap-1.5 rounded-lg bg-gold font-bold text-burgundy`}>
          <MessageCircle size={17} />Order
        </a>
      </div>
    </article>
  );
}

export function ProductGrid({ featuredOnly = false, originalsOnly = false, rail = false, limit }: { featuredOnly?: boolean; originalsOnly?: boolean; rail?: boolean; limit?: number }) {
  const content = useWebsiteContent();
  const { products, loading } = usePublicProducts();
  const visible = useMemo(() => {
    const filtered = products.filter((product) => (!featuredOnly || product.featured) && (!originalsOnly || product.sourceType === "original"));
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [featuredOnly, limit, originalsOnly, products]);

  if (loading) return <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="aspect-[3/4] animate-pulse rounded-3xl bg-marble/60" />)}</div>;
  if (visible.length === 0) return (
    <div className="marble-surface rounded-3xl border border-white px-6 py-12 text-center shadow-soft">
      <Sparkles className="mx-auto text-gold" />
      <p className="mt-4 font-display text-2xl text-burgundy">New pieces are being prepared.</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-black/60">Products appear here after staff opens an inventory item and turns on <strong>Show on website</strong>.</p>
      <a href={websiteWhatsappLink(content.whatsappNumber, "Hello RoseDen Atelier, please show me your latest available pieces.")} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-burgundy px-5 text-sm font-semibold text-white">
        <MessageCircle size={17} />Ask on WhatsApp
      </a>
    </div>
  );

  if (rail) return <div className="grid grid-cols-4 gap-2 sm:gap-4">{visible.map((product) => <ProductCard key={product.id} product={product} compact />)}</div>;
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

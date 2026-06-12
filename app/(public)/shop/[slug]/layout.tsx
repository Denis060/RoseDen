import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const siteUrl = "https://roseden-os.vercel.app";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data } = await client
    .from("inventory")
    .select("product_name,selling_price,public_description,shop_photo_url,supplier_photo_url,photo_url,product_images")
    .eq("slug", slug)
    .eq("is_public", true)
    .in("public_status", ["available", "reserved", "sold"])
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "RoseDen Piece" };

  const image = (product.product_images || []).find(Boolean)
    || product.shop_photo_url
    || product.supplier_photo_url
    || product.photo_url;
  const description = product.public_description?.trim()
    || `View ${product.product_name} from RoseDen Atelier and order directly on WhatsApp.`;
  const pageUrl = `${siteUrl}/shop/${slug}`;

  return {
    title: product.product_name,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: "RoseDen Atelier",
      title: `${product.product_name} | RoseDen Atelier`,
      description,
      images: image ? [{ url: image, alt: product.product_name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.product_name} | RoseDen Atelier`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default function ProductLayout({ children }: Props) {
  return children;
}

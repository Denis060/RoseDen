import type { Metadata } from "next";
import { ProductGrid } from "@/components/public-products";

export const metadata: Metadata = { title: "Shop", description: "Shop RoseDen Atelier ready-made fashion and new arrivals." };

export default function ShopPage() {
  return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-wider text-gold">RoseDen collection</p><h1 className="mt-2 font-display text-5xl font-semibold text-wine">Shop new arrivals</h1><p className="mb-10 mt-4 max-w-xl text-black/55">Browse published pieces currently available or reserved. Message us on WhatsApp to confirm your size, color, and delivery plan.</p><ProductGrid /></main>;
}

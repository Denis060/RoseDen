import type { Metadata } from "next";
import { ProductGrid } from "@/components/public-products";

export const metadata: Metadata = { title: "Shop", description: "Shop RoseDen Atelier ready-made fashion and new arrivals." };

export default function ShopPage() {
  return <main><section className="marble-surface border-b border-white px-4 py-12 sm:px-6"><div className="mx-auto max-w-6xl"><h1 className="font-display text-5xl font-semibold text-burgundy">Shop new arrivals</h1><p className="mt-4 max-w-xl text-black/60">Browse available RoseDen pieces and order directly through WhatsApp with the product details already included.</p></div></section><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><ProductGrid /></section></main>;
}

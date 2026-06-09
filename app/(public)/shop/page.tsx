import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop-catalog";

export const metadata: Metadata = { title: "Shop", description: "Shop RoseDen Atelier ready-made fashion and new arrivals." };

export default function ShopPage() {
  return <main className="w-full max-w-[100vw] overflow-x-hidden"><section className="marble-surface w-full max-w-[100vw] overflow-hidden border-b border-white px-4 py-12 sm:px-6"><div className="mx-auto w-full min-w-0 max-w-6xl"><h1 className="font-display text-4xl font-semibold text-burgundy sm:text-5xl">Shop RoseDen</h1><p className="mt-4 w-full max-w-xl text-sm leading-6 text-black/60 sm:text-base">Browse real available, reserved, and sold RoseDen pieces. Choose your preferred size and color, then order through WhatsApp.</p></div></section><section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-12 sm:px-6"><ShopCatalog /></section></main>;
}

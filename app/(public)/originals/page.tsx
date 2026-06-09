import type { Metadata } from "next";
import { ProductGrid } from "@/components/public-products";

export const metadata: Metadata = { title: "RoseDen Originals", description: "Discover one-of-one redesigned and original RoseDen pieces." };
export default function OriginalsPage() {
  return <main><section className="bg-burgundy px-4 py-12 text-white sm:px-6"><div className="mx-auto max-w-6xl"><h1 className="font-display text-5xl font-semibold">RoseDen Originals</h1><p className="mt-4 max-w-2xl text-white/70">Redesigned, upcycled, and limited pieces made for women who do not want to look like everyone else.</p></div></section><div className="h-3 stripe-accent" /><section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><h2 className="mb-6 font-display text-3xl font-semibold text-burgundy">Available originals</h2><ProductGrid originalsOnly status="available" /><h2 className="mb-3 mt-14 font-display text-3xl font-semibold text-burgundy">Sold archive</h2><p className="mb-6 max-w-xl text-sm text-black/55">A gallery of one-of-one pieces that have already found their new owner.</p><ProductGrid originalsOnly status="sold" /></section></main>;
}

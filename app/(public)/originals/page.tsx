import type { Metadata } from "next";
import { ProductGrid } from "@/components/public-products";

export const metadata: Metadata = { title: "RoseDen Originals", description: "Discover one-of-one redesigned and original RoseDen pieces." };
export default function OriginalsPage() {
  return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-wider text-gold">One of one</p><h1 className="mt-2 font-display text-5xl font-semibold text-wine">RoseDen Originals</h1><p className="mb-10 mt-4 max-w-2xl text-black/55">Redesigned, upcycled, and limited pieces made for women who do not want to look like everyone else.</p><ProductGrid originalsOnly /></main>;
}

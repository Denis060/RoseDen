"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard, usePublicProducts } from "@/components/public-products";

export function ShopCatalog() {
  const { products, loading } = usePublicProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [availability, setAvailability] = useState("available");

  const categories = useMemo(() => [...new Set(products.map((item) => item.category))].sort(), [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((item) => item.sizes))].sort(), [products]);
  const colors = useMemo(() => [...new Set(products.flatMap((item) => item.colors))].sort(), [products]);
  const visible = useMemo(() => products.filter((product) =>
    `${product.name} ${product.category} ${product.colors.join(" ")} ${product.sizes.join(" ")}`.toLowerCase().includes(query.toLowerCase()) &&
    (category === "all" || product.category === category) &&
    (size === "all" || product.sizes.includes(size)) &&
    (color === "all" || product.colors.includes(color)) &&
    (availability === "all" || product.status === availability)
  ), [availability, category, color, products, query, size]);

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="mb-7 min-w-0 overflow-hidden rounded-3xl border border-gold/20 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-3 rounded-2xl bg-cream px-4"><Search size={19} className="text-burgundy" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dresses, colors, sizes..." className="h-13 min-w-0 flex-1 bg-transparent outline-none" /></div>
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal size={18} className="shrink-0 text-gold" />
          {[["Category", category, setCategory, categories], ["Size", size, setSize, sizes], ["Color", color, setColor, colors], ["Status", availability, setAvailability, ["available", "reserved", "sold"]]].map(([label, value, setter, options]) => (
            <select key={label as string} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="h-10 shrink-0 rounded-full border border-burgundy/10 bg-cream px-3 text-xs font-semibold text-burgundy outline-none">
              <option value="all">All {String(label).toLowerCase()}</option>
              {(options as string[]).map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ))}
        </div>
      </div>
      <p className="mb-4 text-sm text-black/50">{loading ? "Loading RoseDen pieces..." : `${visible.length} piece${visible.length === 1 ? "" : "s"} found`}</p>
      {!loading && visible.length === 0 ? <div className="rounded-3xl bg-white p-10 text-center text-black/50">No pieces match these filters. Try clearing one filter.</div> : <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
    </div>
  );
}

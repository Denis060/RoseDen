import Link from "next/link";
import { ArrowRight, Heart, MessageCircle, Scissors, Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/public-products";
import { whatsappLink } from "@/components/public-site";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-wine px-4 py-20 text-white sm:px-6 sm:py-28">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" /><div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-burgundy blur-3xl" />
        <div className="relative mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Fashion from Makeni</p><h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[0.98] sm:text-7xl">Wear something that feels like you.</h1><p className="mt-6 max-w-xl text-base leading-7 text-white/65">Tailored pieces, carefully selected fashion, and one-of-one RoseDen Originals for women who dress with intention.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/shop" className="flex h-14 items-center justify-center gap-2 rounded-full bg-gold px-6 font-semibold text-wine">Shop new arrivals <ArrowRight size={18} /></Link><a href={whatsappLink("Hello RoseDen Atelier, I would like to see your latest arrivals.")} className="flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 px-6 font-semibold"><MessageCircle size={18} />Order on WhatsApp</a><Link href="/tailoring" className="flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 px-6 font-semibold"><Scissors size={18} />Book tailoring</Link></div></div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-gold">Fresh at RoseDen</p><h2 className="mt-2 font-display text-4xl font-semibold text-wine">Featured pieces</h2></div><Link href="/shop" className="text-sm font-semibold text-burgundy">View all</Link></div><ProductGrid featuredOnly /></section>

      <section className="bg-white px-4 py-16 sm:px-6"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center"><div className="rounded-[36px] bg-burgundy p-10 text-white"><Sparkles className="text-gold" /><p className="mt-10 text-xs font-bold uppercase tracking-[0.25em] text-gold">Our story</p><h2 className="mt-3 font-display text-4xl font-semibold">Style, craftsmanship, and a little reinvention.</h2></div><div><p className="text-lg leading-8 text-black/65">RoseDen Atelier is built around Rosannah’s eye for fashion and the belief that beautiful clothing should feel personal. From curated market finds to fitted tailoring and redesigned originals, every piece is chosen or created with care.</p><Link href="/about" className="mt-6 inline-flex items-center gap-2 font-semibold text-burgundy">Meet RoseDen <ArrowRight size={18} /></Link></div></div></section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><div className="grid gap-4 sm:grid-cols-3">{[[Scissors, "Tailored", "Measurements, fittings, and occasion pieces shaped for you."], [Heart, "Curated", "Fashion selected for quality, confidence, and everyday beauty."], [Sparkles, "Original", "One-of-one redesigned pieces with a story of their own."]].map(([Icon, title, text]) => { const FeatureIcon = Icon as typeof Scissors; return <div key={title as string} className="rounded-3xl bg-white p-6 shadow-soft"><FeatureIcon className="text-gold" /><h3 className="mt-5 font-display text-2xl font-semibold text-wine">{title as string}</h3><p className="mt-2 text-sm leading-6 text-black/55">{text as string}</p></div>; })}</div></section>

      <section className="bg-gold/15 px-4 py-16 text-center sm:px-6"><p className="text-xs font-bold uppercase tracking-wider text-burgundy">Customer love</p><blockquote className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-tight text-wine">“RoseDen helps me find pieces that feel special, and the fitting always makes the difference.”</blockquote><p className="mt-4 text-sm text-black/50">A RoseDen customer in Freetown</p></section>
    </main>
  );
}

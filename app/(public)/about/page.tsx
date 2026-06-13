"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Lightbulb, Sparkles } from "lucide-react";
import { useWebsiteContent } from "@/components/website-content";

export default function AboutPage() {
  const content = useWebsiteContent();
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-[46%_54%] items-stretch">
          <div className="flex flex-col justify-center px-4 py-10 sm:px-10 sm:py-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Our story</p>
            <h1 className="mt-3 font-display text-[32px] font-semibold leading-[0.98] text-burgundy sm:text-6xl">{content.aboutTitle}</h1>
            <p className="mt-4 text-xs leading-5 text-black/60 sm:text-base sm:leading-7">{content.aboutBody}</p>
          </div>
          <div className="relative min-h-[390px] sm:min-h-[620px]">
            <Image src={content.aboutImageUrl} alt="RoseDen fashion look" fill priority className="object-cover" />
          </div>
        </div>
      </section>
      <div className="h-3 stripe-accent" />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="font-display text-3xl font-semibold leading-tight text-burgundy sm:text-5xl">The people behind RoseDen</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6">
          <article className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-soft">
            <div className="relative aspect-[4/3]"><Image src={content.rosannahImageUrl} alt="Rosannah of RoseDen Atelier" fill quality={55} sizes="(max-width: 640px) 50vw, 560px" className="object-cover" /></div>
            <div className="min-w-0 p-4 sm:p-6"><Heart className="text-gold" size={20} /><h3 className="mt-3 font-display text-xl font-semibold text-burgundy sm:text-3xl">Rosannah</h3><p className="mt-2 break-words text-[11px] leading-5 text-black/55 sm:text-sm sm:leading-6">The eye for fashion, styling, sourcing, tailoring, and the personal customer experience.</p></div>
          </article>
          <article className="min-w-0 overflow-hidden rounded-2xl bg-marble shadow-soft">
            <div className="relative aspect-[4/3]"><Image src={content.denisImageUrl} alt="Denis of RoseDen Atelier" fill quality={55} sizes="(max-width: 640px) 50vw, 560px" className="object-cover" /></div>
            <div className="min-w-0 p-4 sm:p-6"><Lightbulb className="text-gold" size={20} /><h3 className="mt-3 font-display text-xl font-semibold text-burgundy sm:text-3xl">Denis</h3><p className="mt-2 break-words text-[11px] leading-5 text-black/55 sm:text-sm sm:leading-6">The systems, technology, data, and digital tools helping RoseDen grow and serve customers better.</p></div>
          </article>
        </div>
      </section>

      <section className="marble-surface px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-2">
            {["arrival-blue.png", "original-gold.png", "arrival-cream.png"].map((image) => <div key={image} className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-white"><Image src={`/images/showcase/${image}`} alt="RoseDen fashion" fill className="object-cover" /></div>)}
          </div>
          <div className="mx-auto mt-8 max-w-2xl text-center"><Sparkles className="mx-auto text-gold" /><h2 className="mt-3 font-display text-3xl font-semibold text-burgundy">Local style. Modern ambition.</h2><p className="mt-3 text-sm leading-6 text-black/60">RoseDen is building a boutique experience that feels personal in-store and effortless online, connecting customers in Sierra Leone and beyond.</p><Link href="/shop" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-burgundy px-6 text-sm font-bold text-white">Explore the collection <ArrowRight size={16} /></Link></div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WebsiteTestimonial } from "@/components/website-content";

export function TestimonialCarousel({ testimonials }: { testimonials: WebsiteTestimonial[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const move = (direction: number) => rail.current?.scrollBy({ left: direction * 260, behavior: "smooth" });

  return (
    <div className="relative mt-7 sm:mt-9">
      <button onClick={() => move(-1)} className="absolute -left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-gold/30 bg-white text-burgundy shadow-soft" aria-label="Previous testimonials"><ChevronLeft size={17} /></button>
      <div ref={rail} className="flex snap-x gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:gap-4">
        {testimonials.map((item) => (
          <blockquote key={`${item.name}-${item.quote}`} className="min-w-[31%] snap-start rounded-xl bg-white p-3 text-left text-burgundy shadow-soft sm:rounded-3xl sm:p-6">
            <p className="font-display text-[10px] leading-tight sm:text-xl sm:leading-7">&ldquo;{item.quote}&rdquo;</p>
            <p className="mt-3 text-[8px] font-bold uppercase tracking-wider text-gold sm:mt-5 sm:text-xs">{item.name}</p>
            {item.location && <p className="mt-1 text-[8px] text-black/45 sm:text-xs">{item.location}</p>}
            <p className="mt-1 text-[9px] text-gold">{"★".repeat(item.rating || 5)}</p>
          </blockquote>
        ))}
      </div>
      <button onClick={() => move(1)} className="absolute -right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-gold/30 bg-white text-burgundy shadow-soft" aria-label="Next testimonials"><ChevronRight size={17} /></button>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  ["Beautiful pieces that always get compliments.", "Aminata K."],
  ["The fitting makes the outfit feel made just for me.", "Fatmata J."],
  ["My go-to boutique for statement looks in Makeni.", "Binta M."],
  ["RoseDen always helps me choose something special.", "Mariama S."],
] as const;

export function TestimonialCarousel() {
  const rail = useRef<HTMLDivElement>(null);
  const move = (direction: number) => rail.current?.scrollBy({ left: direction * 260, behavior: "smooth" });

  return (
    <div className="relative mt-7 sm:mt-9">
      <button onClick={() => move(-1)} className="absolute -left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-gold/30 bg-white text-burgundy shadow-soft" aria-label="Previous testimonials"><ChevronLeft size={17} /></button>
      <div ref={rail} className="flex snap-x gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:gap-4">
        {testimonials.map(([quote, name]) => (
          <blockquote key={name} className="min-w-[31%] snap-start rounded-xl bg-white p-3 text-left text-burgundy shadow-soft sm:rounded-3xl sm:p-6">
            <p className="font-display text-[10px] leading-tight sm:text-xl sm:leading-7">“{quote}”</p>
            <p className="mt-3 text-[8px] font-bold uppercase tracking-wider text-gold sm:mt-5 sm:text-xs">{name}</p>
            <p className="mt-1 text-[9px] text-gold">★★★★★</p>
          </blockquote>
        ))}
      </div>
      <button onClick={() => move(1)} className="absolute -right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-gold/30 bg-white text-burgundy shadow-soft" aria-label="Next testimonials"><ChevronRight size={17} /></button>
    </div>
  );
}

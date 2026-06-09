"use client";

import Link from "next/link";
import { Instagram, Menu, MessageCircle, ShoppingBag } from "lucide-react";
import { useWebsiteContent, websiteWhatsappLink } from "@/components/website-content";

export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

export function whatsappLink(message: string) {
  const recipient = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}

export function PublicHeader() {
  const content = useWebsiteContent();
  return (
    <header className="sticky top-0 z-40 border-b border-burgundy/10 bg-white/95 text-ink backdrop-blur">
      <div className="h-1.5 stripe-accent" />
      <div className="relative mx-auto flex h-[64px] max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
        <details className="group relative md:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center text-ink" aria-label="Open menu">
            <Menu size={24} />
          </summary>
          <nav className="absolute left-0 top-12 z-50 w-44 rounded-2xl border border-burgundy/10 bg-white p-2 text-sm font-semibold shadow-soft">
            <Link href="/shop" className="block rounded-xl px-3 py-2.5 hover:bg-cream">Shop</Link>
            <Link href="/originals" className="block rounded-xl px-3 py-2.5 hover:bg-cream">Originals</Link>
            <Link href="/tailoring" className="block rounded-xl px-3 py-2.5 hover:bg-cream">Tailoring</Link>
            <Link href="/about" className="block rounded-xl px-3 py-2.5 hover:bg-cream">About</Link>
            <Link href="/contact" className="block rounded-xl px-3 py-2.5 hover:bg-cream">Contact</Link>
          </nav>
        </details>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center leading-none md:static md:translate-x-0 md:text-left">
          <span className="whitespace-nowrap font-display text-[22px] font-semibold uppercase tracking-[0.08em] text-burgundy sm:text-2xl md:normal-case md:tracking-normal">RoseDen</span>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.32em] text-gold">Atelier</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/shop">Shop</Link>
          <Link href="/originals">Originals</Link>
          <Link href="/tailoring">Tailoring</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a href={websiteWhatsappLink(content.whatsappNumber, "Hello RoseDen Atelier, I would like to make an inquiry.")} target="_blank" rel="noreferrer" className="hidden h-11 w-11 place-items-center rounded-full bg-gold text-burgundy sm:grid" aria-label="WhatsApp RoseDen">
            <MessageCircle size={19} />
          </a>
          <Link href="/shop" className="grid h-10 w-10 place-items-center text-ink md:hidden" aria-label="Open shop">
            <ShoppingBag size={21} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const content = useWebsiteContent();
  return (
    <footer className="bg-burgundy px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 sm:gap-8">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-xl font-semibold sm:text-2xl">RoseDen Atelier</p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/70 sm:mt-3 sm:text-sm">Styled in Makeni. Tailored, curated, and original.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold sm:text-base">Visit</p>
          <p className="mt-2 text-xs leading-relaxed text-white/75 sm:mt-3 sm:text-sm">{content.location}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gold sm:text-base">Explore</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2 text-xs text-white/80 sm:mt-3 sm:gap-4 sm:text-sm">
            <Link href="/shop">Shop</Link>
            <Link href="/tailoring">Tailoring</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Staff</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            {content.instagramUrl && <a href={content.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-cream text-ink"><PublicHeader />{children}<PublicFooter /></div>;
}

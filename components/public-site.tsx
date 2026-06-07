import Link from "next/link";
import { Instagram, Menu, MessageCircle } from "lucide-react";

export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

export function whatsappLink(message: string) {
  return whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    : "/contact";
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-wine/95 text-white backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="leading-none"><span className="font-display text-2xl font-semibold">RoseDen Atelier</span><span className="mt-1 block text-[9px] uppercase tracking-[0.28em] text-gold">Tailored · Curated · Original</span></Link>
        <nav className="hidden items-center gap-6 text-sm md:flex"><Link href="/shop">Shop</Link><Link href="/originals">Originals</Link><Link href="/tailoring">Tailoring</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav>
        <div className="flex items-center gap-2"><Link href={whatsappLink("Hello RoseDen Atelier, I would like to make an inquiry.")} className="grid h-11 w-11 place-items-center rounded-full bg-gold text-wine" aria-label="WhatsApp RoseDen"><MessageCircle size={19} /></Link><Link href="/shop" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 md:hidden" aria-label="Open shop"><Menu size={19} /></Link></div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-wine px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3"><div><p className="font-display text-2xl font-semibold">RoseDen Atelier</p><p className="mt-3 max-w-xs text-sm text-white/60">Fashion from Makeni, thoughtfully tailored, carefully curated, and boldly original.</p></div><div><p className="font-semibold text-gold">Visit</p><p className="mt-3 text-sm text-white/65">Makeni, Bombali District<br />Sierra Leone</p></div><div><p className="font-semibold text-gold">Explore</p><div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70"><Link href="/shop">Shop</Link><Link href="/tailoring">Tailoring</Link><Link href="/contact">Contact</Link><Link href="/login">Staff</Link><Instagram size={17} /></div></div></div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream text-ink"><PublicHeader />{children}<PublicFooter /></div>;
}

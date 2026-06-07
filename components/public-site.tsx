import Link from "next/link";
import { Instagram, MessageCircle, ShoppingBag } from "lucide-react";

export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

export function whatsappLink(message: string) {
  const recipient = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-burgundy/10 bg-white/95 text-ink backdrop-blur">
      <div className="h-1.5 stripe-accent" />
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="leading-none">
          <span className="font-display text-2xl font-semibold text-burgundy">RoseDen Atelier</span>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.28em] text-gold">Tailored · Curated · Original</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/shop">Shop</Link>
          <Link href="/originals">Originals</Link>
          <Link href="/tailoring">Tailoring</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a href={whatsappLink("Hello RoseDen Atelier, I would like to make an inquiry.")} target="_blank" rel="noreferrer" className="grid h-11 w-11 place-items-center rounded-full bg-gold text-burgundy" aria-label="WhatsApp RoseDen">
            <MessageCircle size={19} />
          </a>
          <Link href="/shop" className="grid h-11 w-11 place-items-center rounded-full border border-burgundy/15 text-burgundy md:hidden" aria-label="Open shop">
            <ShoppingBag size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-burgundy px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">RoseDen Atelier</p>
          <p className="mt-3 max-w-xs text-sm text-white/70">Styled in Makeni. Tailored, curated, and original.</p>
        </div>
        <div>
          <p className="font-semibold text-gold">Visit</p>
          <p className="mt-3 text-sm text-white/75">Makeni, Bombali District<br />Sierra Leone</p>
        </div>
        <div>
          <p className="font-semibold text-gold">Explore</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/80">
            <Link href="/shop">Shop</Link>
            <Link href="/tailoring">Tailoring</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Staff</Link>
            <Instagram size={17} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream text-ink"><PublicHeader />{children}<PublicFooter /></div>;
}

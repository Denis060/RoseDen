import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Globe2,
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
  Ruler,
  Scissors,
  Sparkles,
  Truck,
} from "lucide-react";
import { ProductGrid } from "@/components/public-products";
import { whatsappLink } from "@/components/public-site";
import { TestimonialCarousel } from "@/components/testimonial-carousel";

const boutiqueImage = "/images/roseden-boutique-concept.png";

const channels = [
  [MessageCircle, "WhatsApp", "Chat and order"],
  [Facebook, "Facebook", "Message us"],
  [Music2, "TikTok", "DM to order"],
  [Instagram, "Instagram", "See new looks"],
  [Globe2, "Website", "Shop online"],
] as const;

const services = [
  [Scissors, "Bespoke tailoring", "Made for your shape and your moment."],
  [Ruler, "Measurements & fittings", "Careful fitting for a confident finish."],
  [Heart, "Bridal & occasion wear", "For life's special moments."],
  [Sparkles, "Styling support", "Help choosing pieces, colors, and complete looks."],
  [Truck, "Pickup & delivery", "Arrange collection or delivery when ordering."],
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid min-h-[420px] max-w-7xl grid-cols-[48%_52%] sm:min-h-[560px] lg:min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="z-10 flex flex-col justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-16">
            <h1 className="max-w-xl font-display text-[27px] font-semibold leading-[0.98] tracking-[-0.02em] text-burgundy min-[430px]:text-[30px] sm:text-5xl lg:text-7xl">
              Styled in Makeni. Made for your moment.
            </h1>
            <p className="mt-4 max-w-lg text-[12px] leading-[1.45] text-black/65 min-[430px]:text-sm sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
              Tailored pieces, curated fashion, and one-of-one RoseDen Originals for women who love to stand out.
            </p>
            <div className="mt-5 flex max-w-[250px] flex-col gap-2 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
              <Link href="/shop" className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-gold px-3 text-[11px] font-bold text-white sm:h-14 sm:rounded-full sm:px-7 sm:text-base">
                Shop New Arrivals <ArrowRight size={14} />
              </Link>
              <a href={whatsappLink("Hello RoseDen Atelier, I would like to see your latest arrivals.")} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-burgundy px-3 text-[11px] font-bold text-white sm:h-14 sm:rounded-full sm:px-7 sm:text-base">
                <MessageCircle size={14} />Order on WhatsApp
              </a>
              <Link href="/tailoring" className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-gold px-3 text-[11px] font-bold text-burgundy sm:h-14 sm:rounded-full sm:px-7 sm:text-base">
                <Scissors size={14} />Book Tailoring
              </Link>
            </div>
          </div>
          <div className="relative min-h-full overflow-hidden">
            <Image src={boutiqueImage} alt="RoseDen-inspired boutique interior with gold mannequin and clothing rack" fill priority className="object-cover object-[67%_center]" />
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent sm:w-20" />
            <div className="absolute bottom-3 right-3 hidden rounded-2xl bg-white/90 px-4 py-3 shadow-soft backdrop-blur sm:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">RoseDen Atelier</p>
              <p className="mt-1 text-sm font-semibold text-burgundy">Tailored · Curated · Original</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-3 stripe-accent" />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="font-display text-3xl font-semibold uppercase text-burgundy sm:text-5xl sm:normal-case">New arrivals</h2>
            <p className="mt-1 text-xs text-black/55 sm:mt-2 sm:text-sm">Fresh pieces available to order now.</p>
          </div>
          <Link href="/shop" className="shrink-0 text-sm font-bold text-burgundy">View all →</Link>
        </div>
        <ProductGrid rail limit={4} />
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold uppercase text-burgundy sm:text-5xl sm:normal-case">RoseDen Originals</h2>
              <p className="mt-2 max-w-xl text-sm text-black/55">One-of-one redesigned and original pieces with their own story.</p>
            </div>
            <Link href="/originals" className="shrink-0 text-sm font-bold text-burgundy">Explore →</Link>
          </div>
          <ProductGrid originalsOnly rail limit={4} />
        </div>
      </section>

      <section className="marble-surface px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold uppercase text-burgundy sm:text-5xl sm:normal-case">Inside the Atelier</h2>
          <div className="mt-5 grid grid-cols-3 gap-1 sm:mt-8 sm:gap-3">
            {["object-[70%_center]", "object-[85%_center]", "object-[58%_center]"].map((position) => (
              <div key={position} className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-white shadow-soft sm:rounded-3xl sm:border-4">
                <Image src={boutiqueImage} alt="Inside the RoseDen Atelier boutique" fill className={`object-cover ${position}`} />
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-burgundy"><MapPin size={14} />Makeni, Bombali District, Sierra Leone</p>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-semibold uppercase text-burgundy sm:text-5xl sm:normal-case">How to order</h2>
          <div className="mt-6 grid grid-cols-5 gap-2 sm:mt-9 sm:gap-3">
            {channels.map(([Icon, title, text], index) => (
              <a key={title} href={index === 0 ? whatsappLink("Hello RoseDen Atelier, I would like to place an order.") : index === 4 ? "/shop" : "/contact"} target={index === 0 ? "_blank" : undefined} rel={index === 0 ? "noreferrer" : undefined} className="rounded-xl border border-gold/20 bg-cream px-1 py-3 text-center sm:rounded-2xl sm:p-5">
                <Icon className="mx-auto h-7 w-7 text-burgundy sm:h-9 sm:w-9" />
                <p className="mt-2 text-[9px] font-bold leading-tight text-burgundy sm:mt-3 sm:text-sm">{title}</p>
                <p className="mt-1 text-[8px] leading-tight text-black/50 sm:text-xs">{text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-semibold uppercase text-burgundy sm:text-5xl sm:normal-case">Tailoring & styling</h2>
          <div className="mt-7 grid grid-cols-5 gap-1 sm:mt-9 sm:gap-4">
            {services.map(([Icon, title, text]) => (
              <div key={title} className="border-r border-gold/25 px-1 text-center last:border-r-0 sm:px-4">
                <Icon className="mx-auto h-7 w-7 text-gold sm:h-10 sm:w-10" />
                <h3 className="mt-2 text-[9px] font-bold leading-tight text-burgundy sm:mt-4 sm:text-base">{title}</h3>
                <p className="mt-1 text-[8px] leading-tight text-black/55 sm:text-xs sm:leading-5">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/tailoring" className="inline-flex h-11 items-center gap-2 rounded-md bg-gold px-7 text-sm font-bold text-white sm:h-13 sm:rounded-full sm:py-4"><Scissors size={18} />Book a Tailoring Consultation</Link>
          </div>
        </div>
      </section>

      <section className="marble-surface px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-3xl font-semibold uppercase text-burgundy sm:text-5xl sm:normal-case">Loved by our customers</h2>
          <TestimonialCarousel />
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-20">
        <h2 className="text-center font-display text-3xl font-semibold uppercase text-burgundy sm:text-5xl sm:normal-case">Visit & contact us</h2>
        <div className="mx-auto mt-6 grid max-w-6xl grid-cols-3 gap-2 sm:mt-8 sm:gap-5">
          <div className="text-[8px] leading-relaxed text-black/65 sm:text-sm">
            <p className="flex items-start gap-1"><MapPin size={13} className="shrink-0 text-burgundy" />Makeni, Bombali District, Sierra Leone</p>
            <p className="mt-2">Mon - Sat: 9:00 AM - 6:00 PM</p>
            <p className="mt-2">roseden.atelier@gmail.com</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg sm:rounded-[24px]">
            <Image src={boutiqueImage} alt="RoseDen-inspired boutique interior" fill className="object-cover object-[72%_center]" />
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-burgundy p-2 text-center text-white sm:rounded-3xl sm:p-5">
            <p className="font-display text-[12px] leading-tight sm:text-2xl">Let’s style your next moment.</p>
            <a href={whatsappLink("Hello RoseDen Atelier, I would like to make an order.")} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 rounded-md bg-gold px-2 py-1.5 text-[8px] font-bold text-white sm:mt-4 sm:px-4 sm:py-3 sm:text-sm"><MessageCircle size={13} />Chat on WhatsApp</a>
            <div className="mt-2 flex gap-2 text-gold"><Facebook size={14} /><Instagram size={14} /><Music2 size={14} /></div>
          </div>
        </div>
      </section>
    </main>
  );
}

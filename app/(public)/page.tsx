import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Globe2,
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
        <ProductGrid />
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-semibold text-burgundy sm:text-5xl">RoseDen Originals</h2>
              <p className="mt-2 max-w-xl text-sm text-black/55">One-of-one redesigned and original pieces with their own story.</p>
            </div>
            <Link href="/originals" className="shrink-0 text-sm font-bold text-burgundy">Explore →</Link>
          </div>
          <ProductGrid originalsOnly />
        </div>
      </section>

      <section className="marble-surface px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-semibold text-burgundy sm:text-5xl">Inside the Atelier</h2>
            <p className="mt-3 leading-7 text-black/65">A bright, youthful fashion space in Makeni where customers can browse, fit, style, and create something personal.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {["object-[70%_center]", "object-[45%_center]", "object-[85%_center]", "object-[58%_center]"].map((position, index) => (
              <div key={position} className={`relative overflow-hidden rounded-3xl border-4 border-white shadow-soft ${index === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}>
                <Image src={boutiqueImage} alt="Inside the RoseDen Atelier boutique" fill className={`object-cover ${position}`} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-black/45">Temporary boutique concept images will be replaced with real RoseDen shop photos.</p>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-display text-4xl font-semibold text-burgundy sm:text-5xl">See it. Love it. Order it.</h2>
            <p className="mx-auto mt-3 max-w-xl text-black/60">Discover RoseDen wherever you spend your time, then order through the channel that feels easiest.</p>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {channels.map(([Icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-gold/20 bg-cream p-5 text-center">
                <Icon className="mx-auto text-burgundy" />
                <p className="mt-3 font-bold text-burgundy">{title}</p>
                <p className="mt-1 text-xs text-black/50">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-4xl font-semibold text-burgundy sm:text-5xl">Tailoring & styling</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(([Icon, title, text]) => (
              <div key={title} className="rounded-3xl bg-white p-6 shadow-soft">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-burgundy"><Icon /></div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-burgundy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/55">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/tailoring" className="inline-flex h-13 items-center gap-2 rounded-full bg-gold px-7 py-4 font-bold text-burgundy"><Scissors size={18} />Book a consultation</Link>
          </div>
        </div>
      </section>

      <section className="bg-burgundy px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">Loved by RoseDen customers</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              "Beautiful pieces that always get compliments.",
              "The fitting makes the outfit feel made just for me.",
              "My go-to boutique for statement looks in Makeni.",
            ].map((quote) => <blockquote key={quote} className="rounded-3xl bg-white p-6 text-left text-burgundy shadow-soft"><p className="font-display text-xl leading-7">“{quote}”</p><p className="mt-5 text-xs font-bold uppercase tracking-wider text-gold">RoseDen customer</p></blockquote>)}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold text-burgundy sm:text-5xl">Visit RoseDen Atelier</h2>
            <p className="mt-4 flex items-start gap-2 text-black/65"><MapPin size={20} className="mt-0.5 shrink-0 text-gold" />Makeni, Bombali District, Sierra Leone</p>
            <p className="mt-3 text-sm leading-6 text-black/55">Come browse the latest pieces, take measurements, plan a fitting, or collect your order.</p>
            <a href={whatsappLink("Hello RoseDen Atelier, I would like directions to the boutique.")} target="_blank" rel="noreferrer" className="mt-7 inline-flex h-13 items-center gap-2 rounded-full bg-burgundy px-7 py-4 font-bold text-white"><MessageCircle size={18} />Chat on WhatsApp</a>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
            <Image src={boutiqueImage} alt="RoseDen-inspired boutique interior" fill className="object-cover object-[72%_center]" />
          </div>
        </div>
      </section>
    </main>
  );
}

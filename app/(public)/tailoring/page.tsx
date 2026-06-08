import type { Metadata } from "next";
import Image from "next/image";
import { CalendarCheck, Check, Heart, MessageCircle, Ruler, Scissors, Sparkles } from "lucide-react";
import { whatsappLink } from "@/components/public-site";

export const metadata: Metadata = { title: "Tailoring & Styling", description: "Book bespoke tailoring, fittings, bridal, and occasion wear with RoseDen Atelier." };

const steps = [
  [MessageCircle, "Share your idea", "Send an inspiration photo, occasion, and preferred date."],
  [Ruler, "Measure & fit", "Visit the Atelier for measurements and fitting guidance."],
  [Scissors, "Create your piece", "We tailor, refine, and keep you updated on progress."],
  [CalendarCheck, "Final fitting", "Confirm the fit, balance payment, and arrange collection."],
] as const;

export default function TailoringPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid min-h-[430px] max-w-6xl grid-cols-[48%_52%]">
          <div className="flex flex-col justify-center px-4 py-9 sm:px-10 sm:py-20">
            <Scissors className="text-gold" size={25} />
            <h1 className="mt-3 font-display text-[31px] font-semibold leading-[0.98] text-burgundy sm:text-6xl">Tailored to feel like you.</h1>
            <p className="mt-4 text-xs leading-5 text-black/60 sm:text-base sm:leading-7">Personal measurements, thoughtful fittings, and occasion pieces made with care.</p>
            <a href={whatsappLink("Hello RoseDen Atelier, I would like to book a tailoring consultation.")} target="_blank" rel="noreferrer" className="mt-5 flex h-10 items-center justify-center gap-2 rounded-md bg-gold px-3 text-[11px] font-bold text-white sm:h-13 sm:rounded-full sm:text-sm"><MessageCircle size={15} />Book a consultation</a>
          </div>
          <div className="relative"><Image src="/images/showcase/original-gold.png" alt="RoseDen tailored occasion piece" fill priority className="object-cover" /></div>
        </div>
      </section>
      <div className="h-3 stripe-accent" />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="text-center font-display text-3xl font-semibold text-burgundy sm:text-5xl">How tailoring works</h2>
        <div className="mt-7 grid grid-cols-4 gap-2">
          {steps.map(([Icon, title, text]) => <article key={title} className="text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold sm:h-14 sm:w-14"><Icon size={20} /></div><h3 className="mt-3 text-[10px] font-bold leading-tight text-burgundy sm:text-base">{title}</h3><p className="mt-1 text-[8px] leading-tight text-black/50 sm:text-xs sm:leading-5">{text}</p></article>)}
        </div>
      </section>

      <section className="marble-surface px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold text-burgundy sm:text-5xl">Made for your moment</h2>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            {[["arrival-monochrome.png", "Fitted looks"], ["original-corset.png", "Statement pieces"], ["arrival-cream.png", "Occasion wear"]].map(([image, label]) => <article key={label} className="overflow-hidden rounded-xl bg-white shadow-soft"><div className="relative aspect-[3/4]"><Image src={`/images/showcase/${image}`} alt={label} fill className="object-cover" /></div><p className="p-2 text-center text-[10px] font-bold text-burgundy sm:p-4 sm:text-sm">{label}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-[42%_58%] overflow-hidden rounded-3xl border border-gold/20">
          <div className="relative min-h-[260px]"><Image src="/images/roseden-boutique-concept.png" alt="RoseDen fitting space" fill className="object-cover object-[70%_center]" /></div>
          <div className="flex flex-col justify-center p-5 sm:p-10"><Heart className="text-gold" /><h2 className="mt-3 font-display text-2xl font-semibold text-burgundy sm:text-4xl">Ready to create your look?</h2><div className="mt-4 space-y-2 text-[10px] text-black/55 sm:text-sm">{["Tell us your occasion and timeline", "Share your inspiration", "Confirm measurements and deposit"].map((item) => <p key={item} className="flex gap-2"><Check size={14} className="shrink-0 text-gold" />{item}</p>)}</div><a href={whatsappLink("Hello RoseDen Atelier, I would like to start a tailoring order.")} target="_blank" rel="noreferrer" className="mt-5 flex h-10 items-center justify-center gap-2 rounded-md bg-burgundy text-[10px] font-bold text-white sm:h-12 sm:rounded-full sm:text-sm"><Sparkles size={15} />Start on WhatsApp</a></div>
        </div>
      </section>
    </main>
  );
}

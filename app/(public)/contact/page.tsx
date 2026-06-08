"use client";

import Image from "next/image";
import { Clock3, Facebook, Instagram, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { useWebsiteContent, websiteWhatsappLink } from "@/components/website-content";

export default function ContactPage() {
  const content = useWebsiteContent();
  const whatsapp = websiteWhatsappLink(content.whatsappNumber, "Hello RoseDen Atelier, I would like to make an inquiry.");
  return (
    <main>
      <section className="marble-surface px-4 py-10 text-center sm:px-6 sm:py-16">
        <h1 className="font-display text-4xl font-semibold text-burgundy sm:text-6xl">Let’s connect.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/60">Ask about a product, book tailoring, arrange pickup, or plan your visit.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          {[
            [MessageCircle, "WhatsApp", "Fastest reply", whatsapp],
            [Instagram, "Instagram", "See the latest looks", content.instagramUrl || "#"],
            [Music2, "TikTok", "Watch RoseDen style", content.tiktokUrl || "#"],
          ].map(([Icon, title, text, href]) => {
            const ChannelIcon = Icon as typeof MessageCircle;
            return <a key={title as string} href={href as string} target={title === "WhatsApp" ? "_blank" : undefined} rel={title === "WhatsApp" ? "noreferrer" : undefined} className="rounded-2xl border border-gold/25 bg-white p-3 text-center shadow-soft sm:p-6"><div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-burgundy sm:h-14 sm:w-14"><ChannelIcon /></div><h2 className="mt-3 text-xs font-bold text-burgundy sm:text-lg">{title as string}</h2><p className="mt-1 text-[9px] text-black/45 sm:text-xs">{text as string}</p></a>;
          })}
        </div>

        <div className="mt-8 grid grid-cols-[45%_55%] overflow-hidden rounded-3xl bg-burgundy text-white shadow-soft">
          <div className="relative min-h-[330px]"><Image src={content.contactImageUrl} alt="RoseDen Atelier boutique" fill className="object-cover object-[72%_center]" /></div>
          <div className="flex flex-col justify-center p-5 sm:p-10">
            <h2 className="font-display text-2xl font-semibold sm:text-4xl">Visit the Atelier</h2>
            <div className="mt-5 space-y-4 text-[10px] leading-5 text-white/75 sm:text-sm">
              <p className="flex gap-2"><MapPin size={16} className="shrink-0 text-gold" />{content.location}</p>
              <p className="flex gap-2"><Clock3 size={16} className="shrink-0 text-gold" />{content.openingHours}</p>
              <p className="flex gap-2"><Phone size={16} className="shrink-0 text-gold" />{content.phoneNumber || "Call or message us on WhatsApp"}</p>
            </div>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-6 flex h-10 items-center justify-center gap-2 rounded-md bg-gold text-[10px] font-bold text-white sm:h-12 sm:rounded-full sm:text-sm"><MessageCircle size={16} />Message RoseDen</a>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-5 text-center shadow-soft sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-burgundy sm:text-4xl">Follow the fashion</h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-black/50 sm:text-sm">New arrivals, try-ons, styling videos, RoseDen Originals, and behind-the-scenes moments.</p>
          <div className="mt-5 flex justify-center gap-3"><a href={content.facebookUrl || "#"} className="grid h-11 w-11 place-items-center rounded-full bg-burgundy text-white" aria-label="Facebook"><Facebook size={19} /></a><a href={content.instagramUrl || "#"} className="grid h-11 w-11 place-items-center rounded-full bg-gold text-white" aria-label="Instagram"><Instagram size={19} /></a><a href={content.tiktokUrl || "#"} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white" aria-label="TikTok"><Music2 size={19} /></a></div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type WebsiteTestimonial = { name: string; quote: string; location?: string; rating?: number };
export type WebsiteService = { title: string; description: string };

export type WebsiteContent = {
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  location: string;
  openingHours: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutBody: string;
  aboutImageUrl: string;
  rosannahImageUrl: string;
  denisImageUrl: string;
  tailoringTitle: string;
  tailoringBody: string;
  tailoringImageUrl: string;
  contactImageUrl: string;
  atelierImages: string[];
  testimonials: WebsiteTestimonial[];
  tailoringServices: WebsiteService[];
};

export const defaultWebsiteContent: WebsiteContent = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  phoneNumber: "",
  email: "roseden.atelier@gmail.com",
  location: "Makeni, Bombali District, Sierra Leone",
  openingHours: "Monday - Saturday, 9:00 AM - 6:00 PM",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  heroTitle: "Styled for you. Made for your moment.",
  heroSubtitle: "Tailored pieces, curated fashion, and one-of-one RoseDen Originals for women who love to stand out.",
  heroImageUrl: "/images/roseden-boutique-concept.png",
  aboutTitle: "Fashion with heart, personality, and purpose.",
  aboutBody: "RoseDen brings together creative styling, thoughtful tailoring, carefully chosen pieces, and one-of-one Originals.",
  aboutImageUrl: "/images/showcase/arrival-burgundy.png",
  rosannahImageUrl: "/images/roseden-boutique-concept.png",
  denisImageUrl: "/images/showcase/original-patchwork.png",
  tailoringTitle: "Tailored to feel like you.",
  tailoringBody: "Personal measurements, thoughtful fittings, and occasion pieces made with care.",
  tailoringImageUrl: "/images/showcase/original-gold.png",
  contactImageUrl: "/images/roseden-boutique-concept.png",
  atelierImages: [],
  testimonials: [
    { name: "Aminata K.", quote: "Beautiful pieces that always get compliments.", location: "Makeni", rating: 5 },
    { name: "Fatmata J.", quote: "The fitting makes the outfit feel made just for me.", location: "Freetown", rating: 5 },
    { name: "Binta M.", quote: "My go-to boutique for statement looks in Makeni.", location: "Makeni", rating: 5 },
  ],
  tailoringServices: [
    { title: "Bespoke tailoring", description: "Made for your shape and your moment." },
    { title: "Measurements & fittings", description: "Careful fitting for a confident finish." },
    { title: "Bridal & occasion wear", description: "For life's special moments." },
    { title: "Styling support", description: "Help choosing pieces, colors, and complete looks." },
    { title: "Pickup & delivery", description: "Arrange collection or delivery when ordering." },
  ],
};

function mapSettings(row: any): WebsiteContent {
  return {
    whatsappNumber: row.whatsapp_number || defaultWebsiteContent.whatsappNumber,
    phoneNumber: row.phone_number || "",
    email: row.email || defaultWebsiteContent.email,
    location: row.location || defaultWebsiteContent.location,
    openingHours: row.opening_hours || defaultWebsiteContent.openingHours,
    instagramUrl: row.instagram_url || "",
    facebookUrl: row.facebook_url || "",
    tiktokUrl: row.tiktok_url || "",
    heroTitle: row.hero_title || defaultWebsiteContent.heroTitle,
    heroSubtitle: row.hero_subtitle || defaultWebsiteContent.heroSubtitle,
    heroImageUrl: row.hero_image_url || defaultWebsiteContent.heroImageUrl,
    aboutTitle: row.about_title || defaultWebsiteContent.aboutTitle,
    aboutBody: row.about_body || defaultWebsiteContent.aboutBody,
    aboutImageUrl: row.about_image_url || defaultWebsiteContent.aboutImageUrl,
    rosannahImageUrl: row.rosannah_image_url || defaultWebsiteContent.rosannahImageUrl,
    denisImageUrl: row.denis_image_url || defaultWebsiteContent.denisImageUrl,
    tailoringTitle: row.tailoring_title || defaultWebsiteContent.tailoringTitle,
    tailoringBody: row.tailoring_body || defaultWebsiteContent.tailoringBody,
    tailoringImageUrl: row.tailoring_image_url || defaultWebsiteContent.tailoringImageUrl,
    contactImageUrl: row.contact_image_url || defaultWebsiteContent.contactImageUrl,
    atelierImages: Array.isArray(row.atelier_images) ? row.atelier_images.filter(Boolean) : [],
    testimonials: Array.isArray(row.testimonials) && row.testimonials.length ? row.testimonials : defaultWebsiteContent.testimonials,
    tailoringServices: Array.isArray(row.tailoring_services) && row.tailoring_services.length ? row.tailoring_services : defaultWebsiteContent.tailoringServices,
  };
}

const WebsiteContentContext = createContext(defaultWebsiteContent);

export function WebsiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(defaultWebsiteContent);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) return;
      const { data, error } = await supabase.from("business_settings").select("*").eq("id", "roseden").maybeSingle();
      if (active && data && !error) setContent(mapSettings(data));
    }
    load();
    return () => { active = false; };
  }, []);

  return <WebsiteContentContext.Provider value={content}>{children}</WebsiteContentContext.Provider>;
}

export function useWebsiteContent() {
  return useContext(WebsiteContentContext);
}

export function websiteWhatsappLink(number: string, message: string) {
  const recipient = number.replace(/\D/g, "");
  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}

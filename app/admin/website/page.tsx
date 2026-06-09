"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, ImagePlus, LoaderCircle, Save, Smartphone } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/ui";
import { defaultWebsiteContent, WebsiteContent, WebsiteService, WebsiteTestimonial } from "@/components/website-content";
import { supabase } from "@/lib/supabase";

const inputClass = "mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15";
const textareaClass = "mt-1.5 min-h-24 w-full rounded-xl border border-black/10 bg-white px-3 py-3 outline-none focus:border-gold focus:ring-2 focus:ring-gold/15";

async function prepareImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo.");
  if (file.size > 25 * 1024 * 1024) throw new Error("This photo is too large. Please choose another one.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("This photo format could not be prepared."));
      next.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the photo.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    if (!blob) throw new Error("This browser could not resize the photo.");
    return new File([blob], `website-${Date.now()}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function TextField({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block text-sm font-medium">{label}<input className={inputClass} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium">{label}<textarea className={textareaClass} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function PhotoField({ label, value, uploading, onUpload }: { label: string; value: string; uploading: boolean; onUpload: (file: File) => void }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 overflow-hidden rounded-2xl border border-dashed border-burgundy/20 bg-white">
        <div className="relative grid h-40 place-items-center bg-marble/35">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="text-burgundy/25" size={36} />}
          {uploading && <div className="absolute inset-0 grid place-items-center bg-black/45 text-white"><LoaderCircle className="animate-spin" /></div>}
        </div>
        <label className="flex h-12 cursor-pointer items-center justify-center gap-2 font-semibold text-burgundy">
          <ImagePlus size={18} />{value ? "Change photo" : "Take or choose photo"}
          <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploading} onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = "";
          }} />
        </label>
      </div>
    </div>
  );
}

export default function WebsiteAdminPage() {
  const { uploadProductImage } = useData();
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      if (!supabase) return setLoading(false);
      const { data } = await supabase.from("business_settings").select("*").eq("id", "roseden").maybeSingle();
      if (data) {
        setContent({
          whatsappNumber: data.whatsapp_number || "",
          phoneNumber: data.phone_number || "",
          email: data.email || defaultWebsiteContent.email,
          location: data.location || defaultWebsiteContent.location,
          openingHours: data.opening_hours || defaultWebsiteContent.openingHours,
          instagramUrl: data.instagram_url || "",
          facebookUrl: data.facebook_url || "",
          tiktokUrl: data.tiktok_url || "",
          heroTitle: data.hero_title || defaultWebsiteContent.heroTitle,
          heroSubtitle: data.hero_subtitle || defaultWebsiteContent.heroSubtitle,
          heroImageUrl: data.hero_image_url || defaultWebsiteContent.heroImageUrl,
          aboutTitle: data.about_title || defaultWebsiteContent.aboutTitle,
          aboutBody: data.about_body || defaultWebsiteContent.aboutBody,
          aboutImageUrl: data.about_image_url || defaultWebsiteContent.aboutImageUrl,
          tailoringTitle: data.tailoring_title || defaultWebsiteContent.tailoringTitle,
          tailoringBody: data.tailoring_body || defaultWebsiteContent.tailoringBody,
          tailoringImageUrl: data.tailoring_image_url || defaultWebsiteContent.tailoringImageUrl,
          contactImageUrl: data.contact_image_url || defaultWebsiteContent.contactImageUrl,
          atelierImages: Array.isArray(data.atelier_images) ? data.atelier_images : [],
          testimonials: Array.isArray(data.testimonials) ? data.testimonials : defaultWebsiteContent.testimonials,
          tailoringServices: Array.isArray(data.tailoring_services) ? data.tailoring_services : defaultWebsiteContent.tailoringServices,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function set<K extends keyof WebsiteContent>(key: K, value: WebsiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function upload(key: "heroImageUrl" | "aboutImageUrl" | "tailoringImageUrl" | "contactImageUrl", file: File) {
    setUploading(key);
    setMessage("");
    try {
      const url = await uploadProductImage(await prepareImage(file));
      set(key, url);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Photo upload failed.");
    } finally {
      setUploading("");
    }
  }

  async function uploadAtelier(index: number, file: File) {
    setUploading(`atelier-${index}`);
    setMessage("");
    try {
      const url = await uploadProductImage(await prepareImage(file));
      const images = [...content.atelierImages];
      images[index] = url;
      set("atelierImages", images);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Photo upload failed.");
    } finally {
      setUploading("");
    }
  }

  function updateTestimonial(index: number, key: keyof WebsiteTestimonial, value: string) {
    const items = content.testimonials.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: key === "rating" ? Number(value) : value } : item);
    set("testimonials", items);
  }

  function updateService(index: number, key: keyof WebsiteService, value: string) {
    set("tailoringServices", content.tailoringServices.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("business_settings").update({
      whatsapp_number: content.whatsappNumber,
      phone_number: content.phoneNumber,
      email: content.email,
      location: content.location,
      opening_hours: content.openingHours,
      instagram_url: content.instagramUrl,
      facebook_url: content.facebookUrl,
      tiktok_url: content.tiktokUrl,
      hero_title: content.heroTitle,
      hero_subtitle: content.heroSubtitle,
      hero_image_url: content.heroImageUrl,
      about_title: content.aboutTitle,
      about_body: content.aboutBody,
      about_image_url: content.aboutImageUrl,
      tailoring_title: content.tailoringTitle,
      tailoring_body: content.tailoringBody,
      tailoring_image_url: content.tailoringImageUrl,
      contact_image_url: content.contactImageUrl,
      atelier_images: content.atelierImages.filter(Boolean),
      testimonials: content.testimonials,
      tailoring_services: content.tailoringServices,
      updated_at: new Date().toISOString(),
    }).eq("id", "roseden");
    setMessage(error ? `Could not save: ${error.message}. Run migration 009 first.` : "Website saved. The public pages will update automatically.");
    setSaving(false);
  }

  if (loading) return <div className="py-16 text-center text-sm text-black/50">Opening website editor...</div>;

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title="Website editor" subtitle="Change the public website without writing code." />
      <div className="grid grid-cols-2 gap-3">
        <Link href="/" target="_blank" className="flex h-12 items-center justify-center gap-2 rounded-xl border border-burgundy/15 bg-white text-sm font-semibold text-burgundy"><ExternalLink size={17} />View website</Link>
        <button type="submit" disabled={saving || Boolean(uploading)} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-burgundy text-sm font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}Save changes</button>
      </div>
      {message && <p className={`rounded-xl p-3 text-sm font-medium ${message.startsWith("Website saved") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{message}</p>}

      <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-burgundy">Homepage</h2>
        <p className="mt-1 text-xs text-black/50">The first words and picture customers see.</p>
        <div className="mt-5 space-y-4">
          <TextField label="Main heading" value={content.heroTitle} onChange={(value) => set("heroTitle", value)} />
          <TextArea label="Short introduction" value={content.heroSubtitle} onChange={(value) => set("heroSubtitle", value)} />
          <PhotoField label="Main homepage photo" value={content.heroImageUrl} uploading={uploading === "heroImageUrl"} onUpload={(file) => upload("heroImageUrl", file)} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-burgundy">Inside the Atelier</h2>
        <p className="mt-1 text-xs text-black/50">Add up to three real photos from the shop.</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => <PhotoField key={index} label={`Photo ${index + 1}`} value={content.atelierImages[index] || ""} uploading={uploading === `atelier-${index}`} onUpload={(file) => uploadAtelier(index, file)} />)}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-burgundy">About RoseDen</h2>
        <div className="mt-5 space-y-4">
          <TextField label="About heading" value={content.aboutTitle} onChange={(value) => set("aboutTitle", value)} />
          <TextArea label="About story" value={content.aboutBody} onChange={(value) => set("aboutBody", value)} />
          <PhotoField label="About page photo" value={content.aboutImageUrl} uploading={uploading === "aboutImageUrl"} onUpload={(file) => upload("aboutImageUrl", file)} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-burgundy">Tailoring</h2>
        <div className="mt-5 space-y-4">
          <TextField label="Tailoring heading" value={content.tailoringTitle} onChange={(value) => set("tailoringTitle", value)} />
          <TextArea label="Tailoring introduction" value={content.tailoringBody} onChange={(value) => set("tailoringBody", value)} />
          <PhotoField label="Tailoring page photo" value={content.tailoringImageUrl} uploading={uploading === "tailoringImageUrl"} onUpload={(file) => upload("tailoringImageUrl", file)} />
          <div className="space-y-3">
            {content.tailoringServices.slice(0, 5).map((service, index) => <div key={index} className="rounded-2xl bg-cream p-3"><TextField label={`Service ${index + 1}`} value={service.title} onChange={(value) => updateService(index, "title", value)} /><div className="mt-3"><TextArea label="Short explanation" value={service.description} onChange={(value) => updateService(index, "description", value)} /></div></div>)}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-burgundy">Customer reviews</h2>
        <p className="mt-1 text-xs text-black/50">Use real customer comments after asking their permission.</p>
        <div className="mt-5 space-y-3">
          {content.testimonials.slice(0, 4).map((review, index) => <div key={index} className="rounded-2xl bg-cream p-3"><TextField label="Customer name" value={review.name} onChange={(value) => updateTestimonial(index, "name", value)} /><div className="mt-3"><TextArea label="What the customer said" value={review.quote} onChange={(value) => updateTestimonial(index, "quote", value)} /></div><div className="mt-3"><TextField label="Location" value={review.location || ""} onChange={(value) => updateTestimonial(index, "location", value)} /></div></div>)}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-soft sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-burgundy">Contact and social media</h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-black/50"><Smartphone size={13} />Paste the full Facebook, Instagram, and TikTok page links.</p>
        <div className="mt-5 space-y-4">
          <TextField label="WhatsApp number" value={content.whatsappNumber} onChange={(value) => set("whatsappNumber", value)} placeholder="232..." />
          <TextField label="Phone number" value={content.phoneNumber} onChange={(value) => set("phoneNumber", value)} />
          <TextField label="Email" type="email" value={content.email} onChange={(value) => set("email", value)} />
          <TextField label="Shop location" value={content.location} onChange={(value) => set("location", value)} />
          <TextField label="Opening hours" value={content.openingHours} onChange={(value) => set("openingHours", value)} />
          <TextField label="Facebook link" type="url" value={content.facebookUrl} onChange={(value) => set("facebookUrl", value)} />
          <TextField label="Instagram link" type="url" value={content.instagramUrl} onChange={(value) => set("instagramUrl", value)} />
          <TextField label="TikTok link" type="url" value={content.tiktokUrl} onChange={(value) => set("tiktokUrl", value)} />
          <PhotoField label="Contact page photo" value={content.contactImageUrl} uploading={uploading === "contactImageUrl"} onUpload={(file) => upload("contactImageUrl", file)} />
        </div>
      </section>

      <button type="submit" disabled={saving || Boolean(uploading)} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-burgundy font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />}Save website changes</button>
    </form>
  );
}

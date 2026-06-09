"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, MessageCircle, ShoppingBag, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { supabase } from "@/lib/supabase";

type InquiryStatus = "new" | "contacted" | "converted" | "dismissed";
type Inquiry = {
  id: string;
  inventory_id: string | null;
  product_name: string;
  product_slug: string;
  selected_size: string;
  selected_color: string;
  inquiry_code: string;
  status: InquiryStatus;
  clicked_at: string;
};

const statusStyles: Record<InquiryStatus, string> = {
  new: "bg-gold/15 text-burgundy",
  contacted: "bg-blue-50 text-blue-800",
  converted: "bg-emerald-50 text-emerald-800",
  dismissed: "bg-black/5 text-black/45",
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return setLoading(false);
    const { data, error } = await supabase.from("product_inquiries").select("*").order("clicked_at", { ascending: false }).limit(100);
    setSetupNeeded(Boolean(error));
    setInquiries((data || []) as Inquiry[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function changeStatus(id: string, status: InquiryStatus) {
    if (!supabase) return;
    const { error } = await supabase.from("product_inquiries").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (!error) setInquiries((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  }

  const newCount = inquiries.filter((item) => item.status === "new").length;

  return (
    <div>
      <PageHeader title="Product interest" subtitle={`${newCount} new website inquiries`} />
      <div className="mb-5 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm leading-6 text-wine">
        A WhatsApp click means someone showed interest. It becomes a real order only after Rosannah confirms the customer, payment, or reservation.
      </div>
      {setupNeeded && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900"><strong>One database update is needed.</strong><p className="mt-1">Run migration <code>013_whatsapp_product_inquiries.sql</code> in Supabase.</p></div>}
      {loading && <div className="rounded-2xl bg-white p-8 text-center text-sm text-black/45">Loading inquiries...</div>}
      {!loading && !setupNeeded && inquiries.length === 0 && <div className="rounded-2xl border border-dashed border-burgundy/20 p-10 text-center"><MessageCircle className="mx-auto text-gold" /><p className="mt-3 font-display text-2xl text-wine">No product inquiries yet</p><p className="mt-1 text-sm text-black/45">Website product clicks will appear here.</p></div>}
      <div className="space-y-3">
        {inquiries.map((inquiry) => (
          <article key={inquiry.id} className="rounded-2xl bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-gold">Website · {inquiry.inquiry_code}</p><h2 className="mt-1 truncate font-semibold text-wine">{inquiry.product_name}</h2><p className="mt-1 text-xs text-black/45">{inquiry.selected_size || "Size not selected"} · {inquiry.selected_color || "Color not selected"}</p></div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[inquiry.status]}`}>{inquiry.status}</span>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs text-black/40"><Clock3 size={13} />{new Date(inquiry.clicked_at).toLocaleString()}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {inquiry.inventory_id && inquiry.status !== "converted" ? <Link href={`/admin/orders?new=1&product=${inquiry.inventory_id}&inquiry=${inquiry.id}`} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-burgundy px-3 text-xs font-bold text-white"><ShoppingBag size={16} />Record order</Link> : <Link href={`/shop/${inquiry.product_slug}`} className="flex min-h-11 items-center justify-center rounded-xl border border-burgundy/15 px-3 text-xs font-semibold text-burgundy">View product</Link>}
              <select value={inquiry.status} onChange={(event) => changeStatus(inquiry.id, event.target.value as InquiryStatus)} className="h-11 rounded-xl border border-black/10 bg-white px-3 text-xs font-semibold text-wine"><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option><option value="dismissed">Dismissed</option></select>
            </div>
            <div className="mt-3 flex gap-3 text-[11px] text-black/40">
              {inquiry.status === "converted" && <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 size={13} />Order recorded</span>}
              {inquiry.status === "dismissed" && <span className="flex items-center gap-1"><XCircle size={13} />Closed</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

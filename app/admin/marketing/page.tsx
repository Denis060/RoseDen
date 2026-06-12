"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Megaphone, PencilLine, Send } from "lucide-react";
import { AdminOnly } from "@/components/admin-only";
import { useData } from "@/components/data-provider";
import { Form, Modal, PageHeader, Select, useModal } from "@/components/ui";
import { money } from "@/lib/format";
import { supabase } from "@/lib/supabase";

const channels = ["WhatsApp Status", "Facebook", "TikTok", "Instagram", "Website"] as const;
const contentTypes = ["photo", "video", "story", "reel", "other"] as const;

type ChannelResult = {
  id: string;
  channel: string;
  inquiries: number;
  reservations: number;
  sales: number;
  revenue: number;
};

type ContentRecord = {
  id: string;
  inventory_id: string | null;
  content_type: string;
  caption: string;
  media_url: string | null;
  posted_at: string | null;
  updated_at: string;
  inventory: {
    product_name: string;
    shop_photo_url: string | null;
    product_images: string[] | null;
  } | null;
  content_channels: ChannelResult[];
};

function contentImage(record: ContentRecord) {
  return record.media_url || record.inventory?.product_images?.[0] || record.inventory?.shop_photo_url || "";
}

export default function MarketingPage() {
  const { data } = useData();
  const createModal = useModal();
  const resultsModal = useModal();
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [editing, setEditing] = useState<ContentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data: rows, error: loadError } = await supabase
      .from("content")
      .select("id,inventory_id,content_type,caption,media_url,posted_at,updated_at,inventory(product_name,shop_photo_url,product_images),content_channels(id,channel,inquiries,reservations,sales,revenue)")
      .order("posted_at", { ascending: false, nullsFirst: false })
      .limit(100);
    setSetupNeeded(Boolean(loadError));
    setRecords((rows || []) as unknown as ContentRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => records.flatMap((record) => record.content_channels).reduce(
    (sum, result) => ({
      inquiries: sum.inquiries + Number(result.inquiries || 0),
      reservations: sum.reservations + Number(result.reservations || 0),
      sales: sum.sales + Number(result.sales || 0),
      revenue: sum.revenue + Number(result.revenue || 0),
    }),
    { inquiries: 0, reservations: 0, sales: 0, revenue: 0 },
  ), [records]);

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    const selectedChannels = channels.filter((channel) => form.getAll("channels").includes(channel));
    if (selectedChannels.length === 0) {
      setError("Choose at least one place where this content was posted.");
      return;
    }
    const product = data.inventory.find((item) => item.id === String(form.get("inventoryId")));
    setSaving(true);
    setError("");
    const { data: post, error: postError } = await supabase
      .from("content")
      .insert({
        inventory_id: product?.id || null,
        content_type: String(form.get("contentType")),
        caption: String(form.get("caption") || ""),
        media_url: product?.productImages?.[0] || product?.shopPhotoUrl || null,
        posted_at: new Date(`${String(form.get("postedDate"))}T12:00:00`).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (postError || !post) {
      setError(postError?.message || "Could not save this post.");
      setSaving(false);
      return;
    }

    const { error: channelsError } = await supabase.from("content_channels").insert(
      selectedChannels.map((channel) => ({ content_id: post.id, channel })),
    );
    if (channelsError) {
      await supabase.from("content").delete().eq("id", post.id);
      setError(channelsError.message);
      setSaving(false);
      return;
    }

    createModal.hide();
    setSaving(false);
    await load();
  }

  function openResults(record: ContentRecord) {
    setEditing(record);
    setError("");
    resultsModal.show();
  }

  async function saveResults(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !editing) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    const updates = editing.content_channels.map((result) => ({
      id: result.id,
      content_id: editing.id,
      channel: result.channel,
      inquiries: Number(form.get(`${result.id}-inquiries`) || 0),
      reservations: Number(form.get(`${result.id}-reservations`) || 0),
      sales: Number(form.get(`${result.id}-sales`) || 0),
      revenue: Number(form.get(`${result.id}-revenue`) || 0),
    }));
    const { error: updateError } = await supabase.from("content_channels").upsert(updates);
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    await supabase.from("content").update({ updated_at: new Date().toISOString() }).eq("id", editing.id);
    resultsModal.hide();
    setEditing(null);
    setSaving(false);
    await load();
  }

  return (
    <AdminOnly>
      <div>
        <PageHeader title="Marketing" subtitle="Record what RoseDen posts and what brings customers" action={createModal.show} />

        <section className="mb-6 grid grid-cols-2 gap-3">
          {[
            ["Posts", records.length],
            ["Inquiries", totals.inquiries],
            ["Reservations", totals.reservations],
            ["Sales", totals.sales],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl bg-white p-4 shadow-soft">
              <p className="text-xs text-black/45">{label as string}</p>
              <p className="mt-1 text-2xl font-bold text-burgundy">{value as number}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-2xl bg-wine p-4 text-white shadow-soft">
            <p className="text-xs text-white/60">Revenue linked to content</p>
            <p className="mt-1 text-2xl font-bold text-gold">{money(totals.revenue)}</p>
          </div>
        </section>

        {setupNeeded && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900"><strong>One database update is needed.</strong><p className="mt-1">Run migration <code>016_marketing_content_workspace.sql</code> in Supabase.</p></div>}
        {loading && <div className="rounded-2xl bg-white p-8 text-center text-sm text-black/45">Loading marketing posts...</div>}
        {!loading && !setupNeeded && records.length === 0 && <div className="rounded-2xl border border-dashed border-burgundy/20 p-10 text-center"><Megaphone className="mx-auto text-gold" /><p className="mt-3 font-display text-2xl text-wine">No posts recorded yet</p><p className="mt-1 text-sm leading-6 text-black/45">Tap plus after posting a product on WhatsApp, Facebook, TikTok, Instagram, or the website.</p></div>}

        <div className="space-y-4">
          {records.map((record) => {
            const results = record.content_channels.reduce((sum, item) => ({
              inquiries: sum.inquiries + Number(item.inquiries || 0),
              sales: sum.sales + Number(item.sales || 0),
              revenue: sum.revenue + Number(item.revenue || 0),
            }), { inquiries: 0, sales: 0, revenue: 0 });
            const image = contentImage(record);
            return (
              <article key={record.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                <div className="flex gap-4 p-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-marble/60">
                    {image ? <Image src={image} alt="" fill sizes="80px" className="object-cover" /> : <Megaphone className="absolute inset-0 m-auto text-burgundy/20" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gold">{record.content_type}</p>
                    <h2 className="mt-1 truncate font-display text-lg font-semibold text-wine">{record.inventory?.product_name || "General RoseDen content"}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/50">{record.caption || "No caption saved."}</p>
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-black/40"><CalendarDays size={12} />{record.posted_at ? new Date(record.posted_at).toLocaleDateString() : "Not posted"}</p>
                  </div>
                </div>
                <div className="border-t border-black/5 px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">{record.content_channels.map((result) => <span key={result.id} className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-wine">{result.channel}</span>)}</div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-cream p-2"><p className="text-[9px] text-black/40">Inquiries</p><strong>{results.inquiries}</strong></div>
                    <div className="rounded-xl bg-cream p-2"><p className="text-[9px] text-black/40">Sales</p><strong>{results.sales}</strong></div>
                    <div className="rounded-xl bg-cream p-2"><p className="text-[9px] text-black/40">Revenue</p><strong className="text-burgundy">{money(results.revenue)}</strong></div>
                  </div>
                  <button onClick={() => openResults(record)} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-burgundy/15 text-sm font-semibold text-burgundy"><BarChart3 size={17} />Update results</button>
                </div>
              </article>
            );
          })}
        </div>

        {createModal.open && <Modal title="Record a content post" onClose={createModal.hide}>
          <Form onSubmit={createPost} submitLabel={saving ? "Saving post..." : "Save post"} submitDisabled={saving}>
            <Select name="inventoryId" label="Product">
              <option value="">General RoseDen content</option>
              {data.inventory.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Select name="contentType" label="Content type" defaultValue="photo">{contentTypes.map((type) => <option key={type}>{type}</option>)}</Select>
              <label className="block text-sm font-medium text-ink">Date posted<input name="postedDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required className="mt-1.5 h-12 w-full rounded-xl border border-black/10 bg-white px-3 outline-none focus:border-gold" /></label>
            </div>
            <label className="block text-sm font-medium text-ink">Caption<textarea name="caption" rows={4} placeholder="Paste the caption or write a short description..." className="mt-1.5 w-full rounded-xl border border-black/10 bg-white p-3 outline-none focus:border-gold" /></label>
            <fieldset><legend className="mb-2 text-sm font-medium">Where was it posted?</legend><div className="grid grid-cols-2 gap-2">{channels.map((channel) => <label key={channel} className="flex min-h-12 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm"><input type="checkbox" name="channels" value={channel} defaultChecked={channel === "WhatsApp Status"} className="accent-burgundy" />{channel}</label>)}</div></fieldset>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <p className="flex gap-2 rounded-xl bg-gold/10 p-3 text-xs leading-5 text-wine"><Send size={16} className="mt-0.5 shrink-0" />This records where content was posted. RoseDen does not publish to social media automatically yet.</p>
          </Form>
        </Modal>}

        {resultsModal.open && editing && <Modal title="Update post results" onClose={() => { resultsModal.hide(); setEditing(null); }}>
          <Form onSubmit={saveResults} submitLabel={saving ? "Saving results..." : "Save results"} submitDisabled={saving}>
            <div className="rounded-xl bg-gold/10 p-3"><p className="font-semibold text-wine">{editing.inventory?.product_name || "General RoseDen content"}</p><p className="mt-1 text-xs text-black/50">Enter only results you can confirm.</p></div>
            {editing.content_channels.map((result) => <fieldset key={result.id} className="rounded-2xl bg-white p-3"><legend className="px-1 text-sm font-bold text-burgundy">{result.channel}</legend><div className="grid grid-cols-2 gap-3">
              {[
                ["inquiries", "Inquiries"],
                ["reservations", "Reservations"],
                ["sales", "Sales"],
                ["revenue", "Revenue (NLe)"],
              ].map(([key, label]) => <label key={key} className="text-xs font-medium text-black/60">{label}<input name={`${result.id}-${key}`} type="number" min="0" step={key === "revenue" ? "0.01" : "1"} defaultValue={result[key as keyof ChannelResult] as number} className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-cream px-3 text-base text-ink outline-none focus:border-gold" /></label>)}
            </div></fieldset>)}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <p className="flex gap-2 rounded-xl bg-cream p-3 text-xs leading-5 text-black/55"><PencilLine size={16} className="mt-0.5 shrink-0 text-gold" />Update this after customers inquire, reserve, or buy from the post.</p>
          </Form>
        </Modal>}
      </div>
    </AdminOnly>
  );
}

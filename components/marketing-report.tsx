"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { money } from "@/lib/format";
import { supabase } from "@/lib/supabase";

type ChannelTotal = {
  channel: string;
  posts: number;
  inquiries: number;
  reservations: number;
  sales: number;
  revenue: number;
};

export function MarketingReport({ month }: { month: string }) {
  const [totals, setTotals] = useState<ChannelTotal[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) return;
      const start = `${month}-01T00:00:00.000Z`;
      const endDate = new Date(`${month}-01T00:00:00.000Z`);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);
      const { data, error } = await supabase
        .from("content_channels")
        .select("channel,inquiries,reservations,sales,revenue,content!inner(id,posted_at)")
        .gte("content.posted_at", start)
        .lt("content.posted_at", endDate.toISOString());
      if (!active || error) return;
      const grouped = new Map<string, ChannelTotal>();
      for (const row of data || []) {
        const current = grouped.get(row.channel) || { channel: row.channel, posts: 0, inquiries: 0, reservations: 0, sales: 0, revenue: 0 };
        current.posts += 1;
        current.inquiries += Number(row.inquiries || 0);
        current.reservations += Number(row.reservations || 0);
        current.sales += Number(row.sales || 0);
        current.revenue += Number(row.revenue || 0);
        grouped.set(row.channel, current);
      }
      setTotals([...grouped.values()].sort((a, b) => b.revenue - a.revenue || b.sales - a.sales));
    }
    void load();
    return () => { active = false; };
  }, [month]);

  if (totals.length === 0) return null;

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div><h2 className="font-display text-xl font-semibold text-wine">Content performance</h2><p className="mt-1 text-xs text-black/45">Results entered in the Marketing workspace.</p></div>
        <Link href="/admin/marketing" className="shrink-0 text-xs font-bold text-burgundy">Open marketing</Link>
      </div>
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">
        {totals.map((item) => (
          <div key={item.channel} className="rounded-xl bg-cream p-3">
            <div className="flex items-start justify-between gap-3">
              <div><p className="flex items-center gap-2 text-sm font-bold text-wine"><Megaphone size={15} className="text-gold" />{item.channel}</p><p className="mt-1 text-[10px] text-black/40">{item.posts} posts · {item.inquiries} inquiries · {item.reservations} reservations</p></div>
              <div className="text-right"><p className="font-bold text-burgundy">{money(item.revenue)}</p><p className="text-[10px] text-black/40">{item.sales} sales</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


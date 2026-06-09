"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, MessageCircle } from "lucide-react";
import { followUpLabels, FollowUpType } from "@/lib/customer-engagement";
import { supabase } from "@/lib/supabase";

type Entry = {
  id: string;
  follow_up_type: FollowUpType;
  channel: string;
  message_text: string;
  contacted_at: string;
};

export function FollowUpHistory({ customerId, orderId, refreshKey = 0 }: { customerId?: string; orderId?: string; refreshKey?: number }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [setupNeeded, setSetupNeeded] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || (!customerId && !orderId)) return;
    let query = supabase.from("customer_follow_ups").select("id,follow_up_type,channel,message_text,contacted_at").order("contacted_at", { ascending: false }).limit(20);
    if (orderId) query = query.eq("order_id", orderId);
    else if (customerId) query = query.eq("customer_id", customerId);
    const { data, error } = await query;
    setSetupNeeded(Boolean(error));
    setEntries((data || []) as Entry[]);
  }, [customerId, orderId]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  if (setupNeeded) return <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Run migration 015 to enable follow-up history.</p>;
  if (entries.length === 0) return <p className="text-sm text-black/45">No WhatsApp follow-ups recorded yet.</p>;

  return <div className="space-y-2">{entries.map((entry) => <div key={entry.id} className="rounded-xl bg-cream p-3"><div className="flex items-center justify-between gap-3"><p className="flex items-center gap-1.5 text-xs font-bold text-wine"><MessageCircle size={14} className="text-emerald-600" />{followUpLabels[entry.follow_up_type]}</p><p className="flex items-center gap-1 text-[10px] text-black/40"><Clock3 size={11} />{new Date(entry.contacted_at).toLocaleString()}</p></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-black/55">{entry.message_text}</p></div>)}</div>;
}

"use client";

import { useEffect, useState } from "react";
import { Activity, AlertCircle, Package, ReceiptText, ShoppingBag, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AuditLog = {
  id: number;
  entity_type: string;
  entity_id: string | null;
  action: "created" | "updated" | "deleted";
  actor_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
};

const entityLabels: Record<string, string> = {
  customers: "customer",
  measurements: "measurements",
  orders: "order",
  order_items: "order item",
  payments: "payment",
  inventory: "product",
  inventory_stock_entries: "stock entry",
  expenses: "expense",
  post_batches: "buying trip",
  business_settings: "website content",
};

function auditName(log: AuditLog) {
  const data = log.new_data || log.old_data || {};
  return String(
    data.name ||
    data.product_name ||
    data.item_description ||
    data.batch_name ||
    data.category ||
    data.full_name ||
    "",
  );
}

function AuditIcon({ entity }: { entity: string }) {
  if (entity === "customers" || entity === "measurements") return <UserRound size={18} />;
  if (entity === "inventory" || entity === "inventory_stock_entries") return <Package size={18} />;
  if (entity === "payments" || entity === "expenses") return <ReceiptText size={18} />;
  if (entity === "orders" || entity === "order_items") return <ShoppingBag size={18} />;
  return <Activity size={18} />;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actors, setActors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) {
        setMessage("Supabase is not configured.");
        setLoading(false);
        return;
      }
      const [logsResult, profilesResult] = await Promise.all([
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("profiles").select("id,full_name"),
      ]);
      if (!active) return;
      if (logsResult.error) {
        setMessage(["42P01", "PGRST205"].includes(logsResult.error.code)
          ? "Run migration 010_receipts_and_audit_history.sql to start activity history."
          : "Activity history is available to administrators only.");
      } else {
        setLogs((logsResult.data || []) as AuditLog[]);
        setActors(Object.fromEntries(
          (profilesResult.data || []).map((profile) => [profile.id, profile.full_name || "Staff member"]),
        ));
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gold">Phase 4</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-wine">Activity history</h1>
        <p className="mt-1 text-sm text-black/50">See important changes made by admin and staff.</p>
      </div>

      {loading && <div className="rounded-2xl bg-white p-6 text-center text-sm text-black/50">Loading activity...</div>}
      {message && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle className="shrink-0" size={20} />{message}</div>}
      {!loading && !message && logs.length === 0 && <div className="rounded-2xl bg-white p-6 text-center text-sm text-black/50">No activity recorded yet. New changes will appear here.</div>}

      <div className="space-y-3">
        {logs.map((log) => {
          const label = entityLabels[log.entity_type] || log.entity_type.replaceAll("_", " ");
          const name = auditName(log);
          return (
            <article key={log.id} className="flex gap-3 rounded-2xl bg-white p-4 shadow-soft">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-burgundy"><AuditIcon entity={log.entity_type} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold capitalize">{log.action} {label}</p>
                {name && <p className="mt-0.5 truncate text-xs text-black/55">{name}</p>}
                <p className="mt-1 text-[11px] text-black/40">{log.actor_id ? actors[log.actor_id] || "Staff member" : "System"} · {new Date(log.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

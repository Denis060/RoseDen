"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Boxes, ClipboardCheck, Lightbulb, Megaphone, Sparkles, TrendingUp } from "lucide-react";
import { useData } from "@/components/data-provider";
import { buildBusinessInsights, BusinessInsight } from "@/lib/business-insights";
import { PageHeader } from "@/components/ui";

const icons = {
  cash: Banknote,
  orders: ClipboardCheck,
  inventory: Boxes,
  profit: TrendingUp,
  marketing: Megaphone,
};

const priorityStyle = {
  urgent: "border-red-200 bg-red-50 text-red-900",
  important: "border-gold/30 bg-gold/10 text-wine",
  opportunity: "border-burgundy/10 bg-white text-wine",
};

function InsightCard({ insight }: { insight: BusinessInsight }) {
  const Icon = icons[insight.category];
  return (
    <article className={`rounded-2xl border p-4 shadow-soft ${priorityStyle[insight.priority]}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/80 text-burgundy">
          <Icon size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{insight.priority}</p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight">{insight.title}</h2>
          <p className="mt-2 text-sm leading-6 text-black/60">{insight.detail}</p>
          <Link href={insight.href} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-burgundy px-4 text-sm font-semibold text-white">
            {insight.action} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function AdvisorPage() {
  const { data } = useData();
  const insights = buildBusinessInsights(data);
  const urgent = insights.filter((item) => item.priority === "urgent").length;

  return (
    <div>
      <PageHeader title="RoseDen Advisor" subtitle="Clear recommendations based on the records already inside RoseDen OS." />

      <section className="mb-6 overflow-hidden rounded-2xl bg-wine p-5 text-white shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold text-burgundy"><Sparkles size={23} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Business briefing</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{urgent > 0 ? `${urgent} item${urgent === 1 ? "" : "s"} need attention` : "The business is ready for its next opportunity"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">Recommendations update automatically when orders, payments, stock, expenses, or website products change.</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
      </div>

      <div className="mt-6 flex gap-3 rounded-2xl border border-gold/25 bg-white p-4 text-sm text-black/55">
        <Lightbulb className="shrink-0 text-gold" size={20} />
        <p>This first version uses RoseDen’s own business rules and does not send customer or financial information to an external AI service.</p>
      </div>
    </div>
  );
}

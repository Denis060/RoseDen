"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Cake, CheckCircle2, ClockAlert, CreditCard, MessageCircleHeart, PackageCheck } from "lucide-react";
import { useData } from "@/components/data-provider";
import { WhatsAppFollowUp } from "@/components/whatsapp-follow-up";
import { PageHeader } from "@/components/ui";
import { money, shortDate } from "@/lib/format";
import { FollowUpType } from "@/lib/customer-engagement";
import { Customer, Order } from "@/lib/types";
import { supabase } from "@/lib/supabase";

type Reminder = {
  key: string;
  type: FollowUpType;
  customer: Customer;
  order?: Order;
  title: string;
  detail: string;
};

function daysUntilBirthday(birthday: string, now = new Date()) {
  const [, month, day] = birthday.split("-").map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const upcoming = new Date(now.getFullYear(), month - 1, day);
  upcoming.setHours(12, 0, 0, 0);
  if (upcoming < today) upcoming.setFullYear(now.getFullYear() + 1);
  return Math.round((upcoming.getTime() - today.getTime()) / 86400000);
}

function ReminderSection({ title, icon: Icon, reminders, empty, onLogged }: { title: string; icon: typeof CreditCard; reminders: Reminder[]; empty: string; onLogged: (reminder: Reminder) => void }) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center gap-2"><Icon size={19} className="text-gold" /><h2 className="font-display text-xl font-semibold text-wine">{title}</h2><span className="ml-auto rounded-full bg-burgundy/10 px-2.5 py-1 text-[10px] font-bold text-burgundy">{reminders.length}</span></div>
      {reminders.length === 0 ? <div className="rounded-2xl border border-dashed border-burgundy/15 p-5 text-center text-sm text-black/40">{empty}</div> : <div className="space-y-3">{reminders.map((reminder) => (
        <article key={reminder.key} className="rounded-2xl bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="truncate font-bold text-wine">{reminder.customer.name}</p><p className="mt-1 text-sm text-black/65">{reminder.title}</p><p className="mt-1 text-xs text-black/40">{reminder.detail}</p></div>
            <Link href={reminder.order ? `/admin/orders/${reminder.order.id}` : `/admin/customers/${reminder.customer.id}`} className="shrink-0 text-xs font-semibold text-burgundy">Open</Link>
          </div>
          <WhatsAppFollowUp customer={reminder.customer} order={reminder.order} type={reminder.type} label="Review and open WhatsApp" onLogged={() => onLogged(reminder)} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white" />
        </article>
      ))}</div>}
    </section>
  );
}

export default function FollowUpsPage() {
  const { data } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [contactedKeys, setContactedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadRecentContacts() {
      if (!supabase) return;
      const since = new Date(Date.now() - 3 * 86400000).toISOString();
      const { data: contacts } = await supabase
        .from("customer_follow_ups")
        .select("customer_id,order_id,follow_up_type")
        .gte("contacted_at", since);
      setContactedKeys(new Set((contacts || []).map((entry: any) => `${entry.follow_up_type}-${entry.order_id || entry.customer_id}`)));
    }
    void loadRecentContacts();
  }, []);

  const reminders = useMemo(() => {
    const findCustomer = (order: Order) => data.customers.find((customer) => customer.id === order.customerId);
    const overdue: Reminder[] = [];
    const ready: Reminder[] = [];
    const balances: Reminder[] = [];
    const reviews: Reminder[] = [];

    data.orders.forEach((order) => {
      const customer = findCustomer(order);
      if (!customer || order.status === "cancelled") return;
      const balance = Math.max(0, order.total - order.paid);
      if (order.dueDate < today && !["ready", "delivered"].includes(order.status)) {
        overdue.push({ key: `overdue-${order.id}`, type: "overdue", customer, order, title: order.description, detail: `Due ${shortDate(order.dueDate)} · ${order.status}` });
      }
      if (order.status === "ready") {
        ready.push({ key: `ready-${order.id}`, type: "order_ready", customer, order, title: order.description, detail: `Ready for ${order.deliveryPlan}` });
      }
      if (balance > 0 && order.status !== "delivered") {
        balances.push({ key: `balance-${order.id}`, type: "balance", customer, order, title: `${money(balance)} outstanding`, detail: order.description });
      }
      const deliveredAt = new Date(`${order.dueDate}T12:00:00`).getTime();
      const daysSinceDelivery = Math.floor((Date.now() - deliveredAt) / 86400000);
      if (order.status === "delivered" && daysSinceDelivery >= 1 && daysSinceDelivery <= 30) {
        reviews.push({ key: `review-${order.id}`, type: "review", customer, order, title: order.description, detail: "Ask how the piece and service felt" });
      }
    });

    const birthdays = data.customers
      .filter((customer) => customer.birthday)
      .map((customer) => ({ customer, days: daysUntilBirthday(customer.birthday!) }))
      .filter((entry) => entry.days <= 30)
      .sort((a, b) => a.days - b.days)
      .map(({ customer, days }): Reminder => ({
        key: `birthday-${customer.id}`,
        type: "birthday",
        customer,
        title: days === 0 ? "Birthday today" : `Birthday in ${days} day${days === 1 ? "" : "s"}`,
        detail: customer.birthday ? new Date(`${customer.birthday}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : "",
      }));

    const visible = (group: Reminder[]) => group.filter((reminder) => !contactedKeys.has(`${reminder.type}-${reminder.order?.id || reminder.customer.id}`));
    return { overdue: visible(overdue), ready: visible(ready), balances: visible(balances), reviews: visible(reviews), birthdays: visible(birthdays) };
  }, [contactedKeys, data.customers, data.orders, today]);

  const total = Object.values(reminders).reduce((sum, group) => sum + group.length, 0);

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle={`${total} customer conversations need attention`} />
      <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
        <div className="flex gap-3"><MessageCircleHeart className="shrink-0 text-gold" /><div><p className="font-bold text-wine">Rosannah stays in control</p><p className="mt-1 text-xs leading-5 text-black/55">RoseDen prepares each message. Review it, edit it, then approve it inside WhatsApp.</p></div></div>
      </div>
      {total === 0 && <div className="mt-7 rounded-3xl bg-white p-8 text-center shadow-soft"><CheckCircle2 className="mx-auto text-emerald-600" size={34} /><h2 className="mt-3 font-display text-2xl text-wine">Everything is followed up</h2><p className="mt-2 text-sm text-black/45">There are no urgent customer messages right now.</p></div>}
      <ReminderSection title="Overdue orders" icon={ClockAlert} reminders={reminders.overdue} empty="No overdue orders." onLogged={(reminder) => setContactedKeys((current) => new Set(current).add(`${reminder.type}-${reminder.order?.id || reminder.customer.id}`))} />
      <ReminderSection title="Ready for customer" icon={PackageCheck} reminders={reminders.ready} empty="No ready orders waiting for contact." onLogged={(reminder) => setContactedKeys((current) => new Set(current).add(`${reminder.type}-${reminder.order?.id || reminder.customer.id}`))} />
      <ReminderSection title="Outstanding balances" icon={CreditCard} reminders={reminders.balances} empty="No unpaid active orders." onLogged={(reminder) => setContactedKeys((current) => new Set(current).add(`${reminder.type}-${reminder.order?.id || reminder.customer.id}`))} />
      <ReminderSection title="Ask for a review" icon={MessageCircleHeart} reminders={reminders.reviews} empty="No recent deliveries need a review request." onLogged={(reminder) => setContactedKeys((current) => new Set(current).add(`${reminder.type}-${reminder.order?.id || reminder.customer.id}`))} />
      <ReminderSection title="Upcoming birthdays" icon={Cake} reminders={reminders.birthdays} empty="Add birthdays to customer profiles to see reminders here." onLogged={(reminder) => setContactedKeys((current) => new Set(current).add(`${reminder.type}-${reminder.order?.id || reminder.customer.id}`))} />
    </div>
  );
}

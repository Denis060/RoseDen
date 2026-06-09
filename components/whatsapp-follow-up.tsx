"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, Send } from "lucide-react";
import { Customer, Order } from "@/lib/types";
import { followUpLabels, followUpMessage, FollowUpType, whatsappUrl } from "@/lib/customer-engagement";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui";

type Props = {
  customer: Customer;
  order?: Order;
  type: FollowUpType;
  label?: string;
  className?: string;
  onLogged?: () => void;
};

export function WhatsAppFollowUp({ customer, order, type, label, className, onLogged }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(() => followUpMessage(type, customer, order));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMessage(followUpMessage(type, customer, order));
  }, [customer, order, type]);

  async function openWhatsApp() {
    const whatsappWindow = window.open("", "_blank");
    setSending(true);
    setError("");
    try {
      if (supabase) {
        const { data: session } = await supabase.auth.getSession();
        const { error: insertError } = await supabase.from("customer_follow_ups").insert({
          customer_id: customer.id,
          order_id: order?.id || null,
          follow_up_type: type,
          channel: "WhatsApp",
          message_text: message.trim(),
          created_by: session.session?.user.id || null,
        });
        if (insertError) throw insertError;
      }
      const url = whatsappUrl(customer.phone, message.trim());
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = url;
      } else {
        window.location.href = url;
      }
      setOpen(false);
      onLogged?.();
    } catch (cause) {
      whatsappWindow?.close();
      setError(cause instanceof Error ? cause.message : "Could not record this follow-up.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className || "flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"}>
        <MessageCircle size={17} />{label || followUpLabels[type]}
      </button>
      {open && <Modal title={followUpLabels[type]} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-white p-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 font-bold text-emerald-700">{customer.name.charAt(0)}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-wine">{customer.name}</p><p className="text-xs text-black/45">{customer.phone}</p></div>
          </div>
          <label className="block text-sm font-semibold text-wine">Review and edit before sending<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={8} className="mt-2 w-full rounded-2xl border border-black/10 bg-white p-3 text-sm leading-6 outline-none focus:border-gold" /></label>
          <p className="flex gap-2 rounded-xl bg-gold/10 p-3 text-xs leading-5 text-wine"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-gold" />RoseDen records that WhatsApp was opened. The message is sent only after you approve it inside WhatsApp.</p>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button type="button" disabled={sending || !message.trim()} onClick={openWhatsApp} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-bold text-white disabled:opacity-45"><Send size={18} />{sending ? "Opening WhatsApp..." : "Open WhatsApp"}</button>
        </div>
      </Modal>}
    </>
  );
}


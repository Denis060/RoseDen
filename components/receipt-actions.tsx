"use client";

import { MessageCircle, Printer } from "lucide-react";

export function ReceiptActions({ whatsappText, phone }: { whatsappText: string; phone?: string }) {
  const whatsappNumber = phone?.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber || ""}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="grid grid-cols-2 gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-burgundy px-4 font-semibold text-white"
      >
        <Printer size={18} />Print / PDF
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-4 text-center font-semibold text-wine"
      >
        <MessageCircle size={18} />WhatsApp
      </a>
    </div>
  );
}


"use client";

import { MouseEvent, ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  inquiry: {
    inventoryId: string;
    productName: string;
    productSlug: string;
    selectedSize?: string;
    selectedColor?: string;
  };
};

export function TrackedWhatsAppLink({ href, className, children, inquiry }: Props) {
  function recordInterest(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const inquiryCode = `RD-${Date.now().toString(36).slice(-6).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const body = JSON.stringify({ ...inquiry, inquiryCode });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/product-inquiries", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/product-inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      });
    }

    const whatsappUrl = new URL(href);
    const message = whatsappUrl.searchParams.get("text") || "";
    whatsappUrl.searchParams.set("text", `${message}\n\nInquiry reference: ${inquiryCode}`);
    window.open(whatsappUrl.toString(), "_blank", "noopener,noreferrer");
  }

  return <a href={href} target="_blank" rel="noreferrer" onClick={recordInterest} className={className}>{children}</a>;
}

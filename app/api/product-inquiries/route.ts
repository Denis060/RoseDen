import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type InquiryBody = {
  inventoryId?: string;
  productName?: string;
  productSlug?: string;
  selectedSize?: string;
  selectedColor?: string;
  inquiryCode?: string;
};

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ recorded: false }, { status: 503 });

  let body: InquiryBody;
  try {
    body = JSON.parse(await request.text()) as InquiryBody;
  } catch {
    return NextResponse.json({ recorded: false }, { status: 400 });
  }

  const productName = String(body.productName || "").trim().slice(0, 160);
  const productSlug = String(body.productSlug || "").trim().slice(0, 180);
  const inquiryCode = String(body.inquiryCode || "").trim().toUpperCase();
  if (!productName || !productSlug || !/^RD-[A-Z0-9-]{6,20}$/.test(inquiryCode)) {
    return NextResponse.json({ recorded: false }, { status: 400 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from("product_inquiries").insert({
    inventory_id: body.inventoryId || null,
    product_name: productName,
    product_slug: productSlug,
    selected_size: String(body.selectedSize || "").trim().slice(0, 80),
    selected_color: String(body.selectedColor || "").trim().slice(0, 80),
    inquiry_code: inquiryCode,
    source_channel: "Website",
    status: "new",
  });

  if (error) return NextResponse.json({ recorded: false }, { status: 500 });
  return NextResponse.json({ recorded: true });
}

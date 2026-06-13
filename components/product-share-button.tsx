"use client";

import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { productShareCaption } from "@/lib/product-copy";
import { prepareShareImage, shareProduct } from "@/lib/share-product";

type Props = {
  product: {
    name: string;
    category: string;
    colors: string[];
    sizes: string[];
    occasions?: string[];
    price: number;
    slug: string;
    description: string;
    image: string;
    tryOnUrl?: string;
  };
  className?: string;
};

export function ProductShareButton({ product, className }: Props) {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    let active = true;
    void prepareShareImage(product.image).then((file) => {
      if (active) setImageFile(file);
    });
    return () => { active = false; };
  }, [product.image]);

  async function share() {
    const origin = window.location.origin;
    try {
      const result = await shareProduct({
        title: `${product.name} | RoseDen Atelier`,
        text: productShareCaption({ ...product, videoUrl: product.tryOnUrl }, origin),
        url: `${origin}/shop/${product.slug}`,
        imageFile,
      });
      setMessage(result === "copied" ? "Product details copied" : "");
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setMessage("Could not open sharing. Please try again.");
    }
  }

  return (
    <div>
      <button type="button" onClick={share} className={className || "flex h-12 w-full items-center justify-center gap-2 rounded-full border border-burgundy/15 bg-white font-semibold text-burgundy"}>
        <Share2 size={18} />Share product with photo
      </button>
      {message && <p className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-700"><Check size={13} />{message}</p>}
    </div>
  );
}

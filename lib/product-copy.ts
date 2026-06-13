import { money } from "@/lib/format";

type ProductCopyInput = {
  name?: string;
  category: string;
  colors?: string[];
  sizes?: string[];
  occasions?: string[];
  price?: number;
  slug?: string;
  description?: string;
  videoUrl?: string;
};

const categoryNames: Record<string, string> = {
  dress: "Dress",
  top: "Top",
  skirt: "Skirt",
  shorts: "Shorts",
  shoes: "Shoes",
  bag: "Bag",
  accessory: "Accessory",
  fabric: "Fabric",
  other: "Fashion Piece",
};

export function suggestProductName(category: string, colors: string[] = []) {
  const color = colors.find(Boolean)?.trim();
  const categoryName = categoryNames[category] || categoryNames.other;
  return color ? `${color} ${categoryName}` : `New ${categoryName}`;
}

export function productShareCaption(product: ProductCopyInput, origin = "") {
  const name = product.name?.trim() || suggestProductName(product.category, product.colors);
  const lines = [
    `New at RoseDen Atelier: ${name}`,
    product.description?.trim(),
    product.price ? `Price: ${money(product.price)}` : "",
    product.sizes?.length ? `Sizes: ${product.sizes.join(", ")}` : "",
    product.colors?.length ? `Colors: ${product.colors.join(", ")}` : "",
    product.occasions?.length ? `Perfect for: ${product.occasions.join(", ")}` : "",
    product.videoUrl?.trim() ? `Watch video: ${product.videoUrl.trim()}` : "",
    product.slug && origin ? `View and order: ${origin}/shop/${product.slug}` : "",
    "Message RoseDen to reserve or ask about delivery.",
  ];
  return lines.filter(Boolean).join("\n");
}

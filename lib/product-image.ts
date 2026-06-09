export async function prepareProductImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo.");
  if (file.size > 25 * 1024 * 1024) throw new Error("This photo is over 25 MB. Please choose a smaller image.");

  const localUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("This phone image format could not be prepared. Try JPEG, PNG, or WebP."));
      nextImage.src = localUrl;
    });
    const maxSide = 1200;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the photo.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    if (!blob) throw new Error("This browser could not resize the photo.");
    return new File([blob], `roseden-${Date.now()}.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(localUrl);
  }
}

export function productSlug(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "roseden-piece"}-${Date.now().toString(36).slice(-5)}`;
}

type ShareProductInput = {
  title: string;
  text: string;
  url?: string;
  imageFile?: File | null;
};

export async function prepareShareImage(imageUrl?: string) {
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const extension = blob.type.split("/")[1] || "jpg";
    return new File([blob], `roseden-product.${extension}`, { type: blob.type || "image/jpeg" });
  } catch {
    return null;
  }
}

export async function shareProduct({ title, text, url, imageFile }: ShareProductInput) {
  const shareData: ShareData = { title, text, url };

  if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
    shareData.files = [imageFile];
  }

  if (navigator.share) {
    await navigator.share(shareData);
    return "shared" as const;
  }

  await navigator.clipboard.writeText([text, url].filter(Boolean).join("\n"));
  return "copied" as const;
}

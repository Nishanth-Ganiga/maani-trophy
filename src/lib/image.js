// Shrinks a phone photo to a JPEG under maxBytes (keeps the face clear, max 1000px side).
export async function compressImage(file, maxBytes, maxSide = 1000) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // PNG transparency -> white
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  let quality = 0.85;
  let blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality -= 0.1;
    blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
  }
  if (!blob || blob.size > maxBytes) throw new Error("too-large");
  return new File([blob], "player.jpg", { type: "image/jpeg" });
}

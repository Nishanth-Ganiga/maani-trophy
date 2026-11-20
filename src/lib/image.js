// Keeps the player's photo as sharp as possible.
// Used only when the file is bigger than the 2 MB server limit: first lower JPEG quality at FULL resolution,
// and only shrink the pixel size as a last resort.
const toBlob = (canvas, q) => new Promise((r) => canvas.toBlob(r, "image/jpeg", q));

export async function compressImage(file, maxBytes) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  let scale = 1;

  for (let attempt = 0; attempt < 8; attempt++) {
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff"; // PNG transparency -> white
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    for (const q of [0.95, 0.9, 0.85, 0.8, 0.75, 0.7]) {
      const blob = await toBlob(canvas, q);
      if (blob && blob.size <= maxBytes) {
        bitmap.close?.();
        return new File([blob], "player.jpg", { type: "image/jpeg" });
      }
    }
    scale *= 0.85; // still too big at quality 0.7 -> reduce size slightly and retry
  }
  bitmap.close?.();
  throw new Error("too-large");
}

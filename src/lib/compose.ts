import { FRAME } from "@/lib/frame";

function sourceSize(
  photoSource: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement
) {
  if ("videoWidth" in photoSource && photoSource.videoWidth) {
    return { w: photoSource.videoWidth, h: photoSource.videoHeight };
  }
  if ("naturalWidth" in photoSource && photoSource.naturalWidth) {
    return { w: photoSource.naturalWidth, h: photoSource.naturalHeight };
  }
  return { w: photoSource.width, h: photoSource.height };
}

/** CSS object-cover draw metrics for a source into a destination box. */
function coverFit(
  srcW: number,
  srcH: number,
  destW: number,
  destH: number
) {
  const scale = Math.max(destW / srcW, destH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  return {
    drawW,
    drawH,
    dx: (destW - drawW) / 2,
    dy: (destH - drawH) / 2,
  };
}

function loadFrameImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load frame image"));
    img.src = src;
  });
}

/**
 * Capture what the user sees in the square preview (object-cover + optional mirror),
 * then overlay the frame PNG so the photo shows through the transparent circle.
 */
export async function composeFramedPhoto(
  photoSource: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
  options?: { mirror?: boolean; frameSrc?: string }
): Promise<string> {
  const frameImage = await loadFrameImage(options?.frameSrc ?? FRAME.src);
  const size = frameImage.naturalWidth || FRAME.size;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const { w: srcW, h: srcH } = sourceSize(photoSource);
  if (!srcW || !srcH) throw new Error("Camera frame not ready");

  // Match the live preview: full-square object-cover (not circle-only crop)
  const { drawW, drawH, dx, dy } = coverFit(srcW, srcH, size, size);

  ctx.save();
  if (options?.mirror) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(photoSource, dx, dy, drawW, drawH);
  ctx.restore();

  // Frame on top — transparent circle reveals the photo underneath
  ctx.drawImage(frameImage, 0, 0, size, size);

  // JPEG, not PNG: the composed image is fully opaque, and a ~1254px PNG
  // base64s to several MB — past Vercel's 4.5MB request body limit.
  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Decode a user-picked image file onto a canvas, honouring EXIF orientation so
 * portrait phone photos are not laid on their side.
 */
export async function canvasFromFile(file: File): Promise<HTMLCanvasElement> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file is not an image");
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Convert a data URL to a File without fetch() — more reliable in mobile WebViews. */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, data] = dataUrl.split(",");
  if (!data) throw new Error("Invalid image data");

  const mime = /data:(.*?);/.exec(header)?.[1] || "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime, lastModified: Date.now() });
}

function canShareFiles(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  // Older Android / iOS may lack canShare; treat that as "try it".
  if (typeof navigator.canShare !== "function") return true;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

function openWhatsAppText(text: string) {
  const encoded = encodeURIComponent(text);
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // App scheme works more reliably on phones; wa.me for desktop.
  const href = mobile
    ? `whatsapp://send?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.location.href = href;
}

export type ShareImageResult = "shared" | "fallback" | "cancelled";

/**
 * Share the framed JPEG via the OS sheet (image + short text, no URL).
 * Falls back to saving the file and opening WhatsApp with text only.
 */
export async function shareFramedImage(
  photoDataUrl: string,
  text: string
): Promise<ShareImageResult> {
  const file = dataUrlToFile(photoDataUrl, "summit-frame.jpg");

  if (canShareFiles(file)) {
    // Prefer image + caption. No `url` — that forces a link-only share on WhatsApp.
    try {
      await navigator.share({
        files: [file],
        text,
        title: "Kerala Social Work Summit",
      });
      return "shared";
    } catch (err) {
      if (isAbortError(err)) return "cancelled";
    }

    // Some Android builds reject text+files together; retry with the image alone.
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch (err) {
      if (isAbortError(err)) return "cancelled";
    }
  }

  // Last resort: download the image, open WhatsApp with the short message.
  downloadDataUrl(photoDataUrl, `kerala-summit-${Date.now()}.jpg`);
  openWhatsAppText(text);
  return "fallback";
}

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}


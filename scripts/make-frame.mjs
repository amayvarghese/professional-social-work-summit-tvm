import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "frame-source.jpg");
const out = join(root, "public", "frames", "summit-frame.png");

// Tuned for current summit-frame.png (1254×1254) — circular photo window
const WIDTH = 1254;
const HEIGHT = 1254;
const CX = 620;
const CY = 471;
const RADIUS = 400;

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = Buffer.from(data);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const dx = x - CX;
    const dy = y - CY;
    if (dx * dx + dy * dy <= RADIUS * RADIUS) {
      const i = (y * width + x) * channels;
      pixels[i + 3] = 0; // transparent
    }
  }
}

await sharp(pixels, {
  raw: { width, height, channels },
}).png().toFile(out);

console.log(`Frame written to ${out}`);
console.log(`Circle: center=(${CX},${CY}) radius=${RADIUS}`);
console.log(`Size: ${WIDTH}x${HEIGHT}`);

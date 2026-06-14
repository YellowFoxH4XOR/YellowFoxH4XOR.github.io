// One-off generator: rasterizes scripts/fox-favicon.svg into the full favicon set.
// Run with: node scripts/gen-favicon.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SVG = "scripts/fox-favicon.svg";

const png = (size) => sharp(SVG).resize(size, size).png().toBuffer();

// Assemble a multi-resolution .ico from PNG buffers (browsers accept PNG-in-ICO).
function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const bodies = [];
  entries.forEach((e, i) => {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0); // width
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(e.buf.length, b + 8); // size of image data
    dir.writeUInt32LE(offset, b + 12); // offset
    offset += e.buf.length;
    bodies.push(e.buf);
  });
  return Buffer.concat([header, dir, ...bodies]);
}

const [p16, p32, p48, p180, p192, p512] = await Promise.all(
  [16, 32, 48, 180, 192, 512].map(png),
);

const ico = buildIco([
  { size: 16, buf: p16 },
  { size: 32, buf: p32 },
  { size: 48, buf: p48 },
]);

await Promise.all([
  writeFile("public/favicon/favicon.ico", ico),
  writeFile("src/app/favicon.ico", ico),
  writeFile("public/favicon/favicon-16x16.png", p16),
  writeFile("public/favicon/favicon-32x32.png", p32),
  writeFile("public/favicon/apple-touch-icon.png", p180),
  writeFile("public/favicon/android-chrome-192x192.png", p192),
  writeFile("public/favicon/android-chrome-512x512.png", p512),
]);

console.log("favicon set generated.");

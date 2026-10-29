// Canonical source: scripts/fox-favicon.svg. Regenerate every browser/app icon
// together so Next's file-based icon and the fallback/PWA assets never diverge.
// Run with: npm run generate:favicon
import sharp from "sharp";
import { copyFile, mkdir, writeFile } from "node:fs/promises";

const SVG = "scripts/fox-favicon.svg";

const png = (size, opaque = false) => {
  const image = sharp(SVG).resize(size, size);
  // Installed app icons should have an opaque background; the OS applies its
  // own corner mask. Browser favicons retain the rounded tile's transparency.
  if (opaque) image.flatten({ background: "#261c15" });
  return image.png({ compressionLevel: 9 }).toBuffer();
};

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
  [16, 32, 48, 180, 192, 512].map((size) => png(size, size >= 180)),
);

const ico = buildIco([
  { size: 16, buf: p16 },
  { size: 32, buf: p32 },
  { size: 48, buf: p48 },
]);

await mkdir("public/favicon", { recursive: true });
await Promise.all([
  // Served through the App Router and advertised by the layout's SVG icon link.
  copyFile(SVG, "src/app/icon.svg"),
  copyFile(SVG, "public/favicon/favicon.svg"),
  writeFile("public/favicon/favicon.ico", ico),
  writeFile("src/app/favicon.ico", ico),
  writeFile("public/favicon/favicon-16x16.png", p16),
  writeFile("public/favicon/favicon-32x32.png", p32),
  writeFile("public/favicon/apple-touch-icon.png", p180),
  writeFile("public/favicon/android-chrome-192x192.png", p192),
  writeFile("public/favicon/android-chrome-512x512.png", p512),
]);

console.log("Ember fox favicon generated: SVG, 16/32/48px ICO, Apple touch icon, and 192/512px app icons.");

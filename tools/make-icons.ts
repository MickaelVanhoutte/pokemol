/** npm run icons — app icons from a card drawing (Brumouille by default). */
import sharp from 'sharp';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const art = join(root, 'public/cards/009-brumouille.webp');

for (const size of [192, 512]) {
  const pad = Math.round(size * 0.12);
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#7b60c3"/><stop offset="1" stop-color="#2b1f4a"/></radialGradient></defs>
      <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)"/>
    </svg>`,
  );
  const drawing = await sharp(art).resize(size - pad * 2, size - pad * 2, { fit: 'inside' }).toBuffer();
  const meta = await sharp(drawing).metadata();
  await sharp(bg)
    .composite([{ input: drawing, left: Math.round((size - meta.width!) / 2), top: Math.round((size - meta.height!) / 2) }])
    .png()
    .toFile(join(root, `public/icon-${size}.png`));
}
console.log('icons written');

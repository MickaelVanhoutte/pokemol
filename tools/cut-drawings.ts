/**
 * npm run cards [-- <id> ...]
 * Cuts every drawing listed in tools/cards-manifest.json out of its photo and writes
 * public/cards/<id>-<slug>.webp and its overworld miniature public/minis/<id>-<slug>.png, plus
 * tools/out/contact-sheet.png for visual review.
 */
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import { cutout, type CutoutOptions, type Point } from '../src/art/cutout.ts';
import { makeMini } from './minis.ts';

interface Entry {
  id: string;
  slug: string;
  photo: string;
  box: [number, number, number, number];
  erase?: Point[][];
  /** Photo points inside enclosed paper to make see-through. */
  holes?: Point[];
  /** Resize factor applied to the crop before cutting (big phone photos: 0.5). */
  scale?: number;
  options?: Partial<CutoutOptions>;
}

const root = new URL('..', import.meta.url).pathname;
const manifest: { drawings: Entry[] } = JSON.parse(await readFile(join(root, 'tools/cards-manifest.json'), 'utf8'));
const only = process.argv.slice(2);
const outDir = join(root, 'public/cards');
await mkdir(outDir, { recursive: true });
await mkdir(join(root, 'tools/out'), { recursive: true });

const MAX_SIDE = 768;
const tiles: { input: Buffer; label: string }[] = [];

for (const e of manifest.drawings) {
  if (only.length && !only.includes(e.id)) continue;
  const [x0, y0, x1, y1] = e.box;
  const k = e.scale ?? 1;
  const { data, info } = await sharp(join(root, 'img-source', e.photo))
    .rotate()
    .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
    .resize(Math.round((x1 - x0) * k))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const erase = (e.erase ?? []).map((poly) => poly.map(([x, y]) => [(x - x0) * k, (y - y0) * k] as Point));
  const holes = (e.holes ?? []).map(([x, y]) => [(x - x0) * k, (y - y0) * k] as Point);
  const res = cutout({ data, width: info.width, height: info.height }, { ...e.options, erase, holes });
  const png = await sharp(Buffer.from(res.data.buffer), { raw: { width: res.width, height: res.height, channels: 4 } })
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  await sharp(png).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(join(outDir, `${e.id}-${e.slug}.webp`));
  await mkdir(join(root, 'public/minis'), { recursive: true });
  await makeMini(join(outDir, `${e.id}-${e.slug}.webp`), join(root, 'public/minis', `${e.id}-${e.slug}.png`));
  console.log(`✓ ${e.id} ${e.slug} ${res.width}x${res.height}`);
  tiles.push({ input: png, label: `${e.id} ${e.slug}` });
}

// contact sheet on a dark background so leftover paper shows up
const cell = 360, cols = 4, rows = Math.ceil(tiles.length / cols);
const composites: OverlayOptions[] = [];
for (const [i, t] of tiles.entries()) {
  const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
  const thumb = await sharp(t.input).resize({ width: cell - 20, height: cell - 50, fit: 'inside' }).toBuffer();
  composites.push({ input: thumb, left: x + 10, top: y + 10 });
  const svg = `<svg width="${cell}" height="40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="28" font-family="sans-serif" font-size="22" fill="#fff">${t.label}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y + cell - 40 });
}
if (tiles.length) {
  await sharp({ create: { width: cols * cell, height: rows * cell, channels: 4, background: '#3a2f6b' } })
    .composite(composites)
    .png()
    .toFile(join(root, 'tools/out/contact-sheet.png'));
  console.log('contact sheet → tools/out/contact-sheet.png');
}

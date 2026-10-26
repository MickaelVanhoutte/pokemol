/**
 * npm run minis [-- <id> ...]
 * Makes the overworld miniature of each drawing (public/minis/<id>-<slug>.png) from its card in
 * public/cards, plus tools/out/minis-sheet.png (enlarged) for review. `npm run cards` makes the
 * miniature of the drawings it cuts too.
 */
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import { pixelize, type MiniOptions } from '../src/art/mini.ts';

const root = new URL('..', import.meta.url).pathname;
const cards = join(root, 'public/cards');
const outDir = join(root, 'public/minis');

/** Largest miniature before its outline: about one map tile. */
export const MINI_W = 18, MINI_H = 16;

/** Per-drawing tweaks from the manifest's `mini`: palette options, and `saturation` for pale colours. */
export type MiniTweaks = Partial<MiniOptions> & { saturation?: number };

export async function makeMini(card: string, out: string, { saturation = 1.6, ...options }: MiniTweaks = {}): Promise<Buffer> {
  const { data, info } = await sharp(card)
    .ensureAlpha()
    .trim({ threshold: 10 })
    .modulate({ saturation, brightness: 0.96 })
    .resize({ width: MINI_W, height: MINI_H, fit: 'inside', kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = pixelize({ data, width: info.width, height: info.height }, options);
  const png = await sharp(Buffer.from(px.data.buffer), { raw: { width: px.width, height: px.height, channels: 4 } }).png().toBuffer();
  await sharp(png).toFile(out);
  return png;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv.slice(2);
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(cards)).filter((f) => f.endsWith('.webp') && (!only.length || only.includes(f.slice(0, 3)))).sort();
  const manifest: { drawings: { id: string; mini?: MiniTweaks }[] } = JSON.parse(await readFile(join(root, 'tools/cards-manifest.json'), 'utf8'));
  const minis: { png: Buffer; label: string }[] = [];
  for (const f of files) {
    const mini = manifest.drawings.find((d) => d.id === f.slice(0, 3))?.mini;
    const png = await makeMini(join(cards, f), join(outDir, f.replace('.webp', '.png')), mini);
    minis.push({ png, label: f.slice(0, -5) });
    console.log(`✓ ${f.replace('.webp', '.png')}`);
  }
  // review sheet: each miniature ×6 on grass-green
  const cell = 150, cols = 6, rows = Math.ceil(minis.length / cols);
  const composites: OverlayOptions[] = [];
  for (const [i, m] of minis.entries()) {
    const meta = await sharp(m.png).metadata();
    const big = await sharp(m.png).resize({ width: meta.width! * 6, kernel: 'nearest' }).toBuffer();
    composites.push({ input: big, left: (i % cols) * cell + 10, top: Math.floor(i / cols) * cell + 10 });
    const svg = `<svg width="${cell}" height="24" xmlns="http://www.w3.org/2000/svg"><text x="6" y="18" font-family="sans-serif" font-size="13" fill="#fff">${m.label}</text></svg>`;
    composites.push({ input: Buffer.from(svg), left: (i % cols) * cell, top: Math.floor(i / cols) * cell + cell - 26 });
  }
  if (minis.length) {
    await mkdir(join(root, 'tools/out'), { recursive: true });
    await sharp({ create: { width: cols * cell, height: rows * cell, channels: 4, background: '#7cc65a' } }).composite(composites).png().toFile(join(root, 'tools/out/minis-sheet.png'));
    console.log('sheet → tools/out/minis-sheet.png');
  }
}

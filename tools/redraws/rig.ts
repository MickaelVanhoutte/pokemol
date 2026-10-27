/**
 * The battle rig of a Bestiole drawn with moving parts (`c.part()`): its body without them and each part on
 * its own, trimmed like the card (`cutRender` in `src/art/cutout.ts`) and placed on one sheet. Written to
 * public/rigs/<id>-<slug>/ (base.webp, <part>.webp), with each part's box and pivot in src/data/rigs.json
 * (read by src/data/rigs.ts), and drawn on tools/out/rigs-sheet.png to check the cut-outs.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp, { type Sharp } from 'sharp';
import { cutRender, type CutoutResult } from '../../src/art/cutout.ts';
import type { Rig, RigPart } from '../../src/data/rigs.ts';
import { PAPER, type P, type PartDef, type View } from './crayon.ts';

/** The kits' paper, taken to white on the cards and rigs. */
export const SHEET = [1, 3, 5].map((i) => parseInt(PAPER.slice(i, i + 2), 16)) as [number, number, number];

/** Largest side of a rig's pictures: a battle drawing is at most ~250 px, twice that on a phone. */
const SIZE = 512;

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A drawing that has moving parts: its SVG for each view, and where a drawn point lands on the sheet. */
export interface Rigged {
  id: string;
  slug: string;
  parts: PartDef[];
  render: (view: View) => string;
  place: (p: P) => P;
}

/** A point turned by `tilt` degrees around (cx, cy), then moved by (dx, dy): how the kits lay a drawing on its sheet. */
export const turned = (tilt: number, cx: number, cy: number, dx = 0, dy = 0) => ([x, y]: P): P => {
  const a = (tilt * Math.PI) / 180;
  return [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a) + dx, cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a) + dy];
};

/** Draws the rig of `d` (null when it has no moving parts) and writes its pictures under `root`. */
export async function makeRig(d: Rigged, root: string): Promise<{ rig: Rig; sheet: Buffer } | null> {
  const { parts } = d;
  if (!parts.length) return null;
  const cut = async (view: View): Promise<CutoutResult> => {
    const { data, info } = await sharp(Buffer.from(d.render(view))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return cutRender({ data, width: info.width, height: info.height }, SHEET);
  };
  const base = await cut('base');
  const layers = await Promise.all(parts.map((p) => cut({ part: p.name })));
  const all = [base, ...layers];
  const x0 = Math.min(...all.map((r) => r.offset[0])), y0 = Math.min(...all.map((r) => r.offset[1]));
  const x1 = Math.max(...all.map((r) => r.offset[0] + r.width)), y1 = Math.max(...all.map((r) => r.offset[1] + r.height));
  const U = x1 - x0, V = y1 - y0, s = Math.min(1, SIZE / Math.max(U, V));
  const raw = (r: CutoutResult) => sharp(Buffer.from(r.data.buffer), { raw: { width: r.width, height: r.height, channels: 4 } });
  const size = (n: number) => Math.max(1, Math.round(n * s));
  const dir = join(root, 'public/rigs', `${d.id}-${d.slug}`);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const webp = (img: Sharp, file: string) => img.webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(join(dir, file));
  // the body on the whole sheet, so the parts are placed in its box
  const sheetBase = await raw(base)
    .extend({ left: base.offset[0] - x0, top: base.offset[1] - y0, right: x1 - base.offset[0] - base.width, bottom: y1 - base.offset[1] - base.height, background: '#0000' })
    .png().toBuffer();
  await webp(sharp(sheetBase).resize(size(U), size(V)), 'base.webp');
  const rigParts: RigPart[] = [];
  for (const [i, p] of parts.entries()) {
    const r = layers[i];
    await webp(raw(r).resize(size(r.width), size(r.height)), `${p.name}.webp`);
    const [px, py] = d.place(p.pivot);
    const { pivot: _pivot, extra: _extra, ...move } = p;
    rigParts.push({
      ...move,
      left: r1(((r.offset[0] - x0) / U) * 100), top: r1(((r.offset[1] - y0) / V) * 100),
      width: r1((r.width / U) * 100), height: r1((r.height / V) * 100),
      ox: r1(((px - r.offset[0]) / r.width) * 100), oy: r1(((py - r.offset[1]) / r.height) * 100),
    });
  }
  // the check sheet: the rig put back together, each part framed, its pivot a red dot
  const marks = rigParts.map((p) => {
    const x = (p.left / 100) * U, y = (p.top / 100) * V, w = (p.width / 100) * U, h = (p.height / 100) * V;
    return `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='none' stroke='#3a6ad6' stroke-width='3' stroke-dasharray='10 6'/>`
      + `<circle cx='${x + (p.ox / 100) * w}' cy='${y + (p.oy / 100) * h}' r='9' fill='#d64545'/>`
      + `<text x='${x + 6}' y='${y + 22}' font-family='sans-serif' font-size='20' fill='#3a6ad6'>${p.name} · ${p.motion}</text>`;
  }).join('');
  const png = await Promise.all(layers.map((r) => raw(r).png().toBuffer()));
  const placed = (p: RigPart, i: number) => ({ input: png[i], left: Math.round((p.left / 100) * U), top: Math.round((p.top / 100) * V) });
  const sheet = await sharp({ create: { width: U, height: V, channels: 4, background: '#ffffff' } })
    .composite([
      ...rigParts.flatMap((p, i) => (p.behind ? [placed(p, i)] : [])),
      { input: sheetBase, left: 0, top: 0 },
      ...rigParts.flatMap((p, i) => (p.behind ? [] : [placed(p, i)])),
      { input: Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${U}' height='${V}'>${marks}</svg>`), left: 0, top: 0 },
    ])
    .png().toBuffer();
  const small = await sharp(sheet).resize({ width: 420, height: 420, fit: 'contain', background: '#ffffff' }).png().toBuffer();
  return { rig: { slug: d.slug, parts: rigParts }, sheet: small };
}

/** Puts a Bestiole's rig into src/data/rigs.json, or takes it out (null). */
export async function saveRig(root: string, id: string, rig: Rig | null) {
  const file = join(root, 'src/data/rigs.json');
  const rigs: Record<string, Rig> = existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : {};
  if (rig) rigs[id] = rig;
  else delete rigs[id];
  const sorted = Object.fromEntries(Object.entries(rigs).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(file, `${JSON.stringify(sorted, null, 2)}\n`);
}

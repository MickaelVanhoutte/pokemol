/**
 * npm run fair [-- [--try] <id or slug> ...]
 * Draws the fair copies (« mise au propre ») of the final forms and writes their battle rigs to
 * public/fair/<id>-<slug>/, listed in src/data/fairRigs.json. A fair copy is its card's own drawing (tools/redraws)
 * gone over neatly: a crisp black felt-tip outline, flat even colour a little more vivid (crayon's `clean` style), and
 * the gold star of the Feutre d'Or, set by itself on the body. No design of its own: the owner chose this over
 * redesigned fair copies. A brouillon not redrawn yet keeps its hand-drawn module in this folder until it is.
 * Also writes tools/out/fair-sheet.png (the pencil card, its fair copy, the fair copy at battle size), the rigs
 * checked on tools/out/fair-rigs-sheet.png, and each whole fair copy to tools/out/fair/ for the preview pages.
 * `--try` only draws: the pictures and both sheets go to tools/out/fair-try/ (named after the ids), public/ and the
 * list stay as they are.
 */
import { readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { cutRender } from '../../src/art/cutout.ts';
import { FAIR_COPY } from '../../src/data/fairCopies.ts';
import { crayon, type Crayon, type Fair } from '../redraws/crayon.ts';
import { makeRig, saveRig, SHEET, turned } from '../redraws/rig.ts';
import { REDRAWS } from '../redraws/make.ts';

const here = new URL('.', import.meta.url).pathname;
/** The hand-drawn modules of this folder (brouillons not redrawn yet); one that doesn't load is skipped. */
const HAND: Fair[] = (await Promise.all(readdirSync(here)
  .filter((f) => f.endsWith('.ts') && !['make.ts', 'preview.ts'].includes(f))
  .map(async (f) => {
    try {
      return (await import(join(here, f))).default as Fair;
    } catch (e) {
      console.warn(`! ${f} skipped: ${(e as Error).message}`);
      return null;
    }
  })))
  .filter((d): d is Fair => !!d);

/** Every fair copy, sorted by id: from its card's module when it has one, else its hand-drawn module. */
export const FAIRS: Fair[] = Object.keys(FAIR_COPY).flatMap((id): Fair[] => {
  const r = REDRAWS.find((x) => x.id === id);
  if (r) return [{ id: r.id, slug: r.slug, seed: r.seed, size: r.size, tilt: r.tilt, clean: true, draw: (c) => r.draw(c) }];
  const h = HAND.find((x) => x.id === id);
  return h ? [h] : [];
}).sort((a, b) => a.id.localeCompare(b.id));

const root = new URL('../..', import.meta.url).pathname;

/**
 * Where the gold star goes on a clean fair copy: inside the body (the rig's base, not under a part drawn in front), away
 * from the face (on the left: Bestioles face left), as far from the edge as it can be; its radius fits the room there.
 */
async function starSpot(d: Fair): Promise<[number, number, number]> {
  const c = crayon(d.seed, { clean: true });
  d.draw(c);
  const [W, H] = d.size, S = 4;
  const w = Math.round(W / S), h = Math.round(H / S);
  const rgba = async (view: Parameters<Crayon['svg']>[5]) =>
    (await sharp(Buffer.from(c.svg(W, H, 0, W / 2, H / 2, view))).resize(w, h).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;
  const base = await rgba('base');
  const front = await Promise.all(c.parts().filter((p) => !p.behind && !p.extra).map((p) => rgba({ part: p.name })));
  // on the body's main colour only (not on the eyes, the grin, a cheek or a line): the most common colour of the base
  const counts = new Map<number, number>();
  for (let i = 0; i < w * h; i++) if (base[i * 4 + 3] > 200) {
    const k = ((base[i * 4] >> 4) << 8) | ((base[i * 4 + 1] >> 4) << 4) | (base[i * 4 + 2] >> 4);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const main = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
  const near = (i: number) => Math.abs((base[i * 4] >> 4) - (main >> 8)) <= 1 && Math.abs((base[i * 4 + 1] >> 4) - ((main >> 4) & 15)) <= 1 && Math.abs((base[i * 4 + 2] >> 4) - (main & 15)) <= 1;
  const inside = new Uint8Array(w * h).map((_, i) => (base[i * 4 + 3] > 200 && near(i) && front.every((f) => f[i * 4 + 3] < 30) ? 1 : 0));
  // distance to the nearest outside pixel (two-pass chamfer)
  const dist = new Float32Array(w * h).map((_, i) => (inside[i] ? 1e6 : 0));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (x > 0) dist[i] = Math.min(dist[i], dist[i - 1] + 1);
    if (y > 0) dist[i] = Math.min(dist[i], dist[i - w] + 1);
    if (x > 0 && y > 0) dist[i] = Math.min(dist[i], dist[i - w - 1] + 1.4);
    if (x < w - 1 && y > 0) dist[i] = Math.min(dist[i], dist[i - w + 1] + 1.4);
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    if (x < w - 1) dist[i] = Math.min(dist[i], dist[i + 1] + 1);
    if (y < h - 1) dist[i] = Math.min(dist[i], dist[i + w] + 1);
    if (x < w - 1 && y < h - 1) dist[i] = Math.min(dist[i], dist[i + w + 1] + 1.4);
    if (x > 0 && y < h - 1) dist[i] = Math.min(dist[i], dist[i + w - 1] + 1.4);
  }
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let i = 0; i < w * h; i++) if (inside[i]) {
    const x = i % w, y = (i / w) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  let best = -1, at = [W * 0.65, H * 0.6];
  // the lower half first (the face is up and to the left), the middle band if the body has no room there
  for (const [lo, hi] of [[0.45, 0.85], [0.3, 0.85]]) {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      const fy = (y - y0) / (y1 - y0 || 1);
      if (!inside[i] || x < x0 + (x1 - x0) * 0.42 || fy < lo || fy > hi || dist[i] < 5) continue;
      // the thickest part of the body, a little to the right (the flank rather than the face)
      const score = dist[i] + ((x - x0) / (x1 - x0 || 1)) * 3;
      if (score > best) [best, at] = [score, [x * S, y * S]];
    }
    if (best >= 0) break;
  }
  const room = (dist[Math.round(at[1] / S) * w + Math.round(at[0] / S)] ?? 10) * S;
  return [at[0], at[1], Math.max(26, Math.min(44, room * 0.8))];
}

export async function drawFair(d: Fair): Promise<Crayon> {
  if (!d.clean) {
    const c = crayon(d.seed, process.env.FAIR_STYLE === 'marker' ? { marker: true } : { felt: true });
    d.draw(c);
    return c;
  }
  const [x, y, r] = await starSpot(d);
  const c = crayon(d.seed, { clean: true });
  d.draw(c);
  c.star(x, y, r, 12);
  return c;
}

const label = (text: string, w: number) =>
  Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='26'><text x='6' y='19' font-family='sans-serif' font-size='16' fill='#333'>${text}</text></svg>`);

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const trying = args.includes('--try');
  const only = args.filter((a) => !a.startsWith('--'));
  const out = join(root, trying ? 'tools/out/fair-try' : 'tools/out/fair');
  await mkdir(out, { recursive: true });
  const rows: { input: Buffer; left: number; top: number }[] = [];
  const rigSheets: { input: Buffer; left: number; top: number }[] = [];
  const S = 300, ROW = S + 32;
  let n = 0;
  for (const d of FAIRS) {
    if (only.length && !only.includes(d.id) && !only.includes(d.slug)) continue;
    const c = await drawFair(d);
    const [W, H] = d.size;
    const { data, info } = await sharp(Buffer.from(c.svg(W, H, d.tilt ?? 0))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const res = cutRender({ data, width: info.width, height: info.height }, SHEET);
    const whole = join(out, `${d.id}-${d.slug}.webp`);
    await sharp(Buffer.from(res.data.buffer), { raw: { width: res.width, height: res.height, channels: 4 } })
      .resize({ width: 768, height: 768, fit: 'inside' })
      .webp({ quality: 86, alphaQuality: 90, effort: 6 })
      .toFile(whole);
    const made = await makeRig({
      id: d.id, slug: d.slug, parts: c.parts(),
      render: (view) => c.svg(W, H, d.tilt ?? 0, W / 2, H / 2, view), place: turned(d.tilt ?? 0, W / 2, H / 2),
    }, root, trying ? 'tools/out/fair-try/rigs' : 'public/fair');
    if (!made) throw new Error(`${d.id} ${d.slug}: a fair copy needs at least one moving part`);
    if (!trying) await saveRig(root, d.id, made.rig, 'src/data/fairRigs.json');
    rigSheets.push({ input: made.sheet, left: (rigSheets.length % 4) * 430, top: Math.floor(rigSheets.length / 4) * 430 });
    console.log(`✓ ${d.id} ${d.slug} (${c.parts().map((p) => p.name).join(', ')})`);
    const top = n++ * ROW;
    const fit = (file: string, size: number) =>
      sharp(file).resize({ width: size, height: size, fit: 'contain', background: '#ffffff00' }).png().toBuffer();
    rows.push({ input: await fit(join(root, 'public/cards', `${d.id}-${d.slug}.webp`), S), left: 0, top: top + 26 });
    rows.push({ input: await fit(whole, S), left: S + 10, top: top + 26 });
    rows.push({ input: await fit(whole, 140), left: 2 * S + 20, top: top + 26 });
    rows.push({ input: label(`${d.id} ${d.slug} — au crayon / au propre / en combat`, 2 * S + 170), left: 0, top });
  }
  if (n) {
    const name = trying ? `tools/out/fair-try/${only.join('-') || 'all'}` : 'tools/out/fair';
    await sharp({ create: { width: 2 * S + 170, height: n * ROW, channels: 4, background: '#ffffff' } })
      .composite(rows).png().toFile(join(root, `${name}-sheet.png`));
    await sharp({ create: { width: 4 * 430, height: Math.ceil(rigSheets.length / 4) * 430, channels: 4, background: '#ffffff' } })
      .composite(rigSheets).png().toFile(join(root, `${name}-rigs-sheet.png`));
    console.log(`sheets → ${name}-sheet.png, ${name}-rigs-sheet.png`);
  }
}

/**
 * npm run fair [-- [--try] <id or slug> ...]
 * Draws the fair copies (« mise au propre ») of the final forms, in pencil under a felt-tip outline,
 * one module per form in this folder, and writes their battle rigs to public/fair/<id>-<slug>/, listed in
 * src/data/fairRigs.json. Also writes tools/out/fair-sheet.png (the pencil card, its fair copy, the fair copy at
 * battle size), the rigs checked on tools/out/fair-rigs-sheet.png, and each whole fair copy to tools/out/fair/ for
 * the preview pages. `--try` only draws: the pictures and both sheets go to tools/out/fair-try/ (named after the
 * ids), public/ and the list stay as they are.
 */
import { readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { cutRender } from '../../src/art/cutout.ts';
import { crayon, type Crayon, type Fair } from '../redraws/crayon.ts';
import { makeRig, saveRig, SHEET, turned } from '../redraws/rig.ts';

const here = new URL('.', import.meta.url).pathname;
/** Every form drawn so far (each module of this folder but the tools), sorted by id; one that doesn't load is skipped. */
export const FAIRS: Fair[] = (await Promise.all(readdirSync(here)
  .filter((f) => f.endsWith('.ts') && !['make.ts', 'preview.ts'].includes(f))
  .map(async (f) => {
    try {
      return (await import(join(here, f))).default as Fair;
    } catch (e) {
      console.warn(`! ${f} skipped: ${(e as Error).message}`);
      return null;
    }
  })))
  .filter((d): d is Fair => !!d)
  .sort((a, b) => a.id.localeCompare(b.id));

const root = new URL('../..', import.meta.url).pathname;

export function drawFair(d: Fair): Crayon {
  const c = crayon(d.seed, process.env.FAIR_STYLE === 'marker' ? { marker: true } : { felt: true });
  d.draw(c);
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
    const c = drawFair(d);
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

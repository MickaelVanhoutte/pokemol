/**
 * npm run drafts [-- <id or slug> ...]
 * Draws the brouillons (Bestioles drawn in code until the little artist draws them) and makes their
 * card (public/cards) and overworld miniature (public/minis), through the same cutout as the photos.
 * When she draws one, her drawing replaces it: same id and slug in tools/cards-manifest.json, then
 * remove it from DRAFTS here and `draft: true` in src/data/creatures.ts.
 */
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { cutout } from '../../src/art/cutout.ts';
import { makeMini } from '../minis.ts';
import { kid, type Draft, type Kid } from './kid.ts';
import { makeRig, saveRig, turned } from '../redraws/rig.ts';
import clapoflot from './clapoflot.ts';
import tortorrent from './tortorrent.ts';
import bouquetigre from './bouquetigre.ts';
import dragobraise from './dragobraise.ts';
import piafleche from './piafleche.ts';
import luneclat from './luneclat.ts';
import boxouille from './boxouille.ts';
import cailloutou from './cailloutou.ts';
import taupinou from './taupinou.ts';
import givrinou from './givrinou.ts';
import sifflasse from './sifflasse.ts';
import dragounet from './dragounet.ts';
import boulonnet from './boulonnet.ts';
import piafurie from './piafurie.ts';
import musclouille from './musclouille.ts';
import quadripoing from './quadripoing.ts';
import rocailloux from './rocailloux.ts';
import montagnoc from './montagnoc.ts';
import taupitrio from './taupitrio.ts';
import cobrasse from './cobrasse.ts';
import dragopataud from './dragopataud.ts';
import triboulon from './triboulon.ts';
import chantouffe from './chantouffe.ts';
import ciseaumante from './ciseaumante.ts';
import poupochette from './poupochette.ts';
import pterocaille from './pterocaille.ts';

export const DRAFTS: Draft[] = [
  clapoflot, tortorrent, bouquetigre, dragobraise,
  piafleche, luneclat, boxouille, cailloutou,
  taupinou, givrinou, sifflasse, dragounet, boulonnet,
  piafurie, musclouille, quadripoing, rocailloux, montagnoc,
  taupitrio, cobrasse, dragopataud,
  triboulon, chantouffe, ciseaumante, poupochette, pterocaille,
];

const root = new URL('../..', import.meta.url).pathname;

/** The drawing done with the kit (its card, its moving parts). */
export function drawKid(d: Draft): Kid {
  const k = kid(d.seed, { layered: d.layered });
  d.draw(k);
  return k;
}

/** The drawing as it would come out of the scanner: an RGBA picture on paper. */
export async function drawDraft(d: Draft, k = drawKid(d)): Promise<Buffer> {
  const [w, h] = d.size;
  return sharp(Buffer.from(k.svg(w, h, d.tilt, d.pivot[0], d.pivot[1], d.offset?.[0] ?? 0, d.offset?.[1] ?? 0))).png().toBuffer();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv.slice(2);
  await mkdir(join(root, 'public/cards'), { recursive: true });
  const rigSheets: { input: Buffer; left: number; top: number }[] = [];
  for (const d of DRAFTS) {
    if (only.length && !only.includes(d.id) && !only.includes(d.slug)) continue;
    const k = drawKid(d);
    const { data, info } = await sharp(await drawDraft(d, k)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // small bits (water drops, sparks) are part of the drawing
    const res = cutout({ data, width: info.width, height: info.height }, { minComponent: 0.002 });
    const card = join(root, 'public/cards', `${d.id}-${d.slug}.webp`);
    await sharp(Buffer.from(res.data.buffer), { raw: { width: res.width, height: res.height, channels: 4 } })
      .resize({ width: 768, height: 768, fit: 'inside' })
      .webp({ quality: 86, alphaQuality: 90, effort: 6 })
      .toFile(card);
    await makeMini(card, join(root, 'public/minis', `${d.id}-${d.slug}.png`));
    // its battle rig, when it has moving parts
    const [W, H] = d.size;
    const [dx, dy] = d.offset ?? [0, 0];
    const made = await makeRig({
      id: d.id, slug: d.slug, parts: k.parts(),
      render: (view) => k.svg(W, H, d.tilt, d.pivot[0], d.pivot[1], dx, dy, view), place: turned(k.tiltOf(d.tilt), d.pivot[0], d.pivot[1], dx, dy),
    }, root);
    await saveRig(root, d.id, made?.rig ?? null);
    if (made) rigSheets.push({ input: made.sheet, left: (rigSheets.length % 4) * 430, top: Math.floor(rigSheets.length / 4) * 430 });
    console.log(`✓ ${d.id} ${d.slug}${k.parts().length ? ` (${k.parts().map((p) => p.name).join(', ')})` : ''}`);
  }
  if (rigSheets.length) {
    await sharp({ create: { width: 4 * 430, height: Math.ceil(rigSheets.length / 4) * 430, channels: 4, background: '#ffffff' } })
      .composite(rigSheets).png().toFile(join(root, 'tools/out/rigs-drafts-sheet.png'));
    console.log('rigs → tools/out/rigs-drafts-sheet.png');
  }
}

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
import { kid, type Draft } from './kid.ts';
import clapoflot from './clapoflot.ts';
import tortorrent from './tortorrent.ts';
import bouquetigre from './bouquetigre.ts';
import dragobraise from './dragobraise.ts';
import piafleche from './piafleche.ts';
import zigzeclair from './zigzeclair.ts';
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
import banquisette from './banquisette.ts';
import cobrasse from './cobrasse.ts';
import dragondine from './dragondine.ts';
import dragopataud from './dragopataud.ts';
import triboulon from './triboulon.ts';
import chantouffe from './chantouffe.ts';
import ciseaumante from './ciseaumante.ts';
import poupochette from './poupochette.ts';
import pterocaille from './pterocaille.ts';

export const DRAFTS: Draft[] = [
  clapoflot, tortorrent, bouquetigre, dragobraise,
  piafleche, zigzeclair, luneclat, boxouille, cailloutou,
  taupinou, givrinou, sifflasse, dragounet, boulonnet,
  piafurie, musclouille, quadripoing, rocailloux, montagnoc,
  taupitrio, banquisette, cobrasse, dragondine, dragopataud,
  triboulon, chantouffe, ciseaumante, poupochette, pterocaille,
];

const root = new URL('../..', import.meta.url).pathname;

/** The drawing as it would come out of the scanner: an RGBA picture on paper. */
export async function drawDraft(d: Draft): Promise<Buffer> {
  const k = kid(d.seed, { layered: d.layered });
  d.draw(k);
  const [w, h] = d.size;
  return sharp(Buffer.from(k.svg(w, h, d.tilt, d.pivot[0], d.pivot[1], d.offset?.[0] ?? 0, d.offset?.[1] ?? 0))).png().toBuffer();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = process.argv.slice(2);
  await mkdir(join(root, 'public/cards'), { recursive: true });
  for (const d of DRAFTS) {
    if (only.length && !only.includes(d.id) && !only.includes(d.slug)) continue;
    const { data, info } = await sharp(await drawDraft(d)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // small bits (water drops, sparks) are part of the drawing
    const res = cutout({ data, width: info.width, height: info.height }, { minComponent: 0.002 });
    const card = join(root, 'public/cards', `${d.id}-${d.slug}.webp`);
    await sharp(Buffer.from(res.data.buffer), { raw: { width: res.width, height: res.height, channels: 4 } })
      .resize({ width: 768, height: 768, fit: 'inside' })
      .webp({ quality: 86, alphaQuality: 90, effort: 6 })
      .toFile(card);
    await makeMini(card, join(root, 'public/minis', `${d.id}-${d.slug}.png`));
    console.log(`✓ ${d.id} ${d.slug}`);
  }
}

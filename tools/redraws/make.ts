/**
 * npm run redraws [-- [--preview] <id or slug> ...]
 * Draws the Bestioles redrawn in the little artist's style and makes their card (public/cards) and
 * overworld miniature (public/minis), through the same cutout as her photos. Also writes
 * tools/out/redraws-sheet.png: her original, the redraw, the redraw at battle size and its miniature.
 * `--preview` writes the cards and miniatures to tools/out/redraws/ instead of public/.
 */
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { cutout } from '../../src/art/cutout.ts';
import { makeMini } from '../minis.ts';
import { crayon, type Redraw } from './crayon.ts';
import minousse from './minousse.ts';
import braisou from './braisou.ts';
import clapotin from './clapotin.ts';
import zigzou from './zigzou.ts';
import chantouille from './chantouille.ts';
import lunelle from './lunelle.ts';
import papivole from './papivole.ts';
import ronflon from './ronflon.ts';
import brumouille from './brumouille.ts';
import grimouille from './grimouille.ts';
import ombrouille from './ombrouille.ts';
import chenillou from './chenillou.ts';
import piafou from './piafou.ts';
import lamacorne from './lamacorne.ts';
import chrysalou from './chrysalou.ts';
import touffou from './touffou.ts';
import touflot from './touflot.ts';
import toufeu from './toufeu.ts';
import toufoudre from './toufoudre.ts';
import minoufleur from './minoufleur.ts';
import braisaure from './braisaure.ts';
import dormipsy from './dormipsy.ts';
import cuillipsy from './cuillipsy.ts';
import psymagus from './psymagus.ts';
import chapardou from './chapardou.ts';
import pantharuse from './pantharuse.ts';
import fumeron from './fumeron.ts';
import fumerax from './fumerax.ts';
import coquilou from './coquilou.ts';
import coquifort from './coquifort.ts';
import glissonde from './glissonde.ts';
import canarmure from './canarmure.ts';
import clochiflor from './clochiflor.ts';
import clochegueule from './clochegueule.ts';
import gloutoflor from './gloutoflor.ts';
import osselot from './osselot.ts';
import ossagarde from './ossagarde.ts';
import fachinge from './fachinge.ts';
import furisinge from './furisinge.ts';
import hippomine from './hippomine.ts';
import hippoplume from './hippoplume.ts';
import libellune from './libellune.ts';
import noctaile from './noctaile.ts';
import zigzeclair from './zigzeclair.ts';
import banquisette from './banquisette.ts';
import dragondine from './dragondine.ts';
import coconfus from './coconfus.ts';

/** Sorted by id when drawn. */
export const REDRAWS: Redraw[] = [minousse, braisou, clapotin, zigzou, chantouille, lunelle, papivole, ronflon, brumouille, grimouille, ombrouille, chenillou, piafou, lamacorne, chrysalou, touffou, touflot, toufeu, toufoudre, minoufleur, braisaure, dormipsy, cuillipsy, psymagus, chapardou, pantharuse, fumeron, fumerax, coquilou, coquifort, glissonde, canarmure, clochiflor, clochegueule, gloutoflor, osselot, ossagarde, fachinge, furisinge, hippomine, hippoplume, libellune, noctaile, zigzeclair, banquisette, dragondine, coconfus].sort((a, b) => a.id.localeCompare(b.id));

const root = new URL('../..', import.meta.url).pathname;

/** The drawing as it would come out of the scanner: an RGBA picture on paper. */
export async function drawRedraw(d: Redraw): Promise<Buffer> {
  const c = crayon(d.seed, { felt: d.felt });
  d.draw(c);
  const [w, h] = d.size;
  return sharp(Buffer.from(c.svg(w, h, d.tilt ?? 0))).png().toBuffer();
}

const label = (text: string, w: number) =>
  Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='26'><text x='6' y='19' font-family='sans-serif' font-size='16' fill='#333'>${text}</text></svg>`);

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  const only = args.filter((a) => !a.startsWith('--'));
  const cards = join(root, preview ? 'tools/out/redraws/cards' : 'public/cards');
  const minis = join(root, preview ? 'tools/out/redraws/minis' : 'public/minis');
  await mkdir(cards, { recursive: true });
  await mkdir(minis, { recursive: true });
  const rows: { input: Buffer; left: number; top: number }[] = [];
  const S = 300, ROW = S + 32;
  let n = 0;
  for (const d of REDRAWS) {
    if (only.length && !only.includes(d.id) && !only.includes(d.slug)) continue;
    const { data, info } = await sharp(await drawRedraw(d)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const res = cutout({ data, width: info.width, height: info.height }, { minComponent: 0.002 });
    const card = join(cards, `${d.id}-${d.slug}.webp`);
    await sharp(Buffer.from(res.data.buffer), { raw: { width: res.width, height: res.height, channels: 4 } })
      .resize({ width: 768, height: 768, fit: 'inside' })
      .webp({ quality: 86, alphaQuality: 90, effort: 6 })
      .toFile(card);
    const mini = join(minis, `${d.id}-${d.slug}.png`);
    await makeMini(card, mini);
    console.log(`✓ ${d.id} ${d.slug}`);
    // comparison row: her original, the redraw, the redraw small (battle), the miniature
    const top = n++ * ROW;
    const fit = (file: string, size: number, kernel: 'lanczos3' | 'nearest' = 'lanczos3') =>
      sharp(file).resize({ width: size, height: size, fit: 'contain', background: '#ffffff00', kernel }).png().toBuffer();
    const original = [join(root, 'public/originals', `${d.id}-${d.slug}.webp`), join(root, 'public/cards', `${d.id}-${d.slug}.webp`)].find(existsSync);
    if (original && original !== card) rows.push({ input: await fit(original, S), left: 0, top: top + 26 });
    rows.push({ input: await fit(card, S), left: S + 10, top: top + 26 });
    rows.push({ input: await fit(card, 140), left: 2 * S + 20, top: top + 26 });
    rows.push({ input: await fit(mini, 96, 'nearest'), left: 2 * S + 180, top: top + 26 });
    rows.push({ input: label(`${d.id} ${d.slug} — son dessin / redessiné / en combat / mini`, 2 * S + 290), left: 0, top });
  }
  if (n) {
    await sharp({ create: { width: 2 * S + 290, height: n * ROW, channels: 4, background: '#ffffff' } })
      .composite(rows).png().toFile(join(root, 'tools/out/redraws-sheet.png'));
    console.log('sheet → tools/out/redraws-sheet.png');
  }
}

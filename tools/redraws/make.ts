/**
 * npm run redraws [-- [--preview] <id or slug> ...]
 * Draws the Bestioles redrawn in the little artist's style and makes their card (public/cards) and
 * overworld miniature (public/minis), through the same cutout as her photos. Also writes
 * tools/out/redraws-sheet.png: her original, the redraw, the redraw at battle size, its silhouette and its miniature.
 * A Bestiole drawn with moving parts also gets its battle rig (tools/redraws/rig.ts), checked on
 * tools/out/rigs-sheet.png. `--preview` writes the cards and miniatures to tools/out/redraws/ instead of
 * public/, and no rigs.
 */
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { cutRender } from '../../src/art/cutout.ts';
import { makeMini } from '../minis.ts';
import { makeRig, saveRig, SHEET, turned } from './rig.ts';
import { overlap, WARN } from './silhouette.ts';
import { CREATURES } from '../../src/data/creatures.ts';
import { crayon, type Crayon, type Redraw } from './crayon.ts';
import minousse from './minousse.ts';
import braisou from './braisou.ts';
import petillapin from './petillapin.ts';
import brulievre from './brulievre.ts';
import brontopousse from './brontopousse.ts';
import sylvasaure from './sylvasaure.ts';
import clapotin from './clapotin.ts';
import joufflux from './joufflux.ts';
import sifflou from './sifflou.ts';
import lunou from './lunou.ts';
import scaraprisme from './scaraprisme.ts';
import grognours from './grognours.ts';
import brumouille from './brumouille.ts';
import grimouille from './grimouille.ts';
import ombrouille from './ombrouille.ts';
import gloutillon from './gloutillon.ts';
import piafou from './piafou.ts';
import hypnopaon from './hypnopaon.ts';
import coquattend from './coquattend.ts';
import pandoudou from './pandoudou.ts';
import panderive from './panderive.ts';
import pandabraise from './pandabraise.ts';
import pandorage from './pandorage.ts';
import minoufleur from './minoufleur.ts';
import braisaure from './braisaure.ts';
import curiolor from './curiolor.ts';
import malicolor from './malicolor.ts';
import pensacasque from './pensacasque.ts';
import chapardou from './chapardou.ts';
import pantharuse from './pantharuse.ts';
import crapougne from './crapougne.ts';
import brumapaud from './brumapaud.ts';
import ermitou from './ermitou.ts';
import geocrabe from './geocrabe.ts';
import berceluga from './berceluga.ts';
import planacier from './planacier.ts';
import brouticot from './brouticot.ts';
import tetebique from './tetebique.ts';
import ramabouc from './ramabouc.ts';
import chacalune from './chacalune.ts';
import chacrypte from './chacrypte.ts';
import bougombat from './bougombat.ts';
import foncombat from './foncombat.ts';
import fronduline from './fronduline.ts';
import calligrafronde from './calligrafronde.ts';
import libellune from './libellune.ts';
import noctaile from './noctaile.ts';
import foudroule from './foudroule.ts';
import morsommeil from './morsommeil.ts';
import flaquelotl from './flaquelotl.ts';
import coconfus from './coconfus.ts';
import agrafou from './agrafou.ts';
import crocagrafe from './crocagrafe.ts';
import ocrinou from './ocrinou.ts';
import mammouchaud from './mammouchaud.ts';
import faonvole from './faonvole.ts';
import cerfoudre from './cerfoudre.ts';
import cornebraise from './cornebraise.ts';
import fournacorne from './fournacorne.ts';
import lumignon from './lumignon.ts';
import projetoile from './projetoile.ts';
import plissou from './plissou.ts';
import plisserpent from './plisserpent.ts';
import festivouivre from './festivouivre.ts';
import globargot from './globargot.ts';
import moutoussiere from './moutoussiere.ts';
import punaisette from './punaisette.ts';
import punaisaure from './punaisaure.ts';
import lumiver from './lumiver.ts';
import lampyrette from './lampyrette.ts';
import erabou from './erabou.ts';
import erabreuil from './erabreuil.ts';
import nenurette from './nenurette.ts';
import tachou from './tachou.ts';
import tachombre from './tachombre.ts';
import fanetome from './fanetome.ts';
import avrilou from './avrilou.ts';
import leviafarce from './leviafarce.ts';
import medusoie from './medusoie.ts';
import voilamere from './voilamere.ts';
import chiroplie from './chiroplie.ts';
import vampapier from './vampapier.ts';
import poncou from './poncou.ts';
import rapepic from './rapepic.ts';
import galibou from './galibou.ts';
import floconnet from './floconnet.ts';
import givrelynx from './givrelynx.ts';
import gommichon from './gommichon.ts';
import taillou from './taillou.ts';
import baleincre from './baleincre.ts';
import poulpinceau from './poulpinceau.ts';
import octopeintre from './octopeintre.ts';
import aquarelline from './aquarelline.ts';
import gecaillou from './gecaillou.ts';
import sablerette from './sablerette.ts';
import spiragneau from './spiragneau.ts';
import hypnobelier from './hypnobelier.ts';
import ratpiece from './ratpiece.ts';
import guettou from './guettou.ts';
import vigicrocs from './vigicrocs.ts';
import marteaumante from './marteaumante.ts';
import montagnoc from './montagnoc.ts';
import mouffetor from './mouffetor.ts';
import lemurage from './lemurage.ts';
import roupillon from './roupillon.ts';
import orajolotl from './orajolotl.ts';
import faucardoise from './faucardoise.ts';
import frelonchon from './frelonchon.ts';
import gouttelotl from './gouttelotl.ts';
import antennou from './antennou.ts';
import pschitou from './pschitou.ts';
import bouquetigre from './bouquetigre.ts';
import dragobraise from './dragobraise.ts';
import piafurie from './piafurie.ts';
import postrompe from './postrompe.ts';
import tortorock from './tortorock.ts';
import clapoflot from './clapoflot.ts';
import rocailloux from './rocailloux.ts';
import cailloutou from './cailloutou.ts';
import cognecrevette from './cognecrevette.ts';
import squillou from './squillou.ts';
import tenoroc from './tenoroc.ts';
import lunambule from './lunambule.ts';

/** Sorted by id when drawn. */
export const REDRAWS: Redraw[] = [minousse, braisou, clapotin, joufflux, sifflou, lunou, scaraprisme, grognours, brumouille, grimouille, ombrouille, gloutillon, piafou, hypnopaon, coquattend, pandoudou, panderive, pandabraise, pandorage, minoufleur, braisaure, curiolor, malicolor, pensacasque, chapardou, pantharuse, crapougne, brumapaud, ermitou, geocrabe, berceluga, planacier, brouticot, tetebique, ramabouc, chacalune, chacrypte, bougombat, foncombat, fronduline, calligrafronde, libellune, noctaile, foudroule, morsommeil, flaquelotl, coconfus, agrafou, crocagrafe, ocrinou, mammouchaud, faonvole, cerfoudre, cornebraise, fournacorne, lumignon, projetoile, plissou, plisserpent, festivouivre, globargot, moutoussiere, punaisette, punaisaure, lumiver, lampyrette, erabou, erabreuil, nenurette, tachou, tachombre, fanetome, avrilou, leviafarce, medusoie, voilamere, chiroplie, vampapier, poncou, rapepic, galibou, floconnet, givrelynx, gommichon, taillou, baleincre, poulpinceau, octopeintre, aquarelline, gecaillou, sablerette, spiragneau, hypnobelier, ratpiece, guettou, vigicrocs, squillou, cognecrevette, marteaumante, cailloutou, rocailloux, montagnoc, pschitou, mouffetor, antennou, lemurage, roupillon, gouttelotl, orajolotl, frelonchon, faucardoise, bouquetigre, dragobraise, clapoflot, tortorock, postrompe, piafurie, tenoroc, lunambule, petillapin, brulievre, brontopousse, sylvasaure].sort((a, b) => a.id.localeCompare(b.id));

const root = new URL('../..', import.meta.url).pathname;

/** The drawing done with the kit (its card, its moving parts). */
export function drawCrayon(d: Redraw): Crayon {
  const c = crayon(d.seed, { felt: d.felt });
  d.draw(c);
  return c;
}

/** The drawing as an RGBA picture on a see-through sheet. */
export async function drawRedraw(d: Redraw, c = drawCrayon(d)): Promise<Buffer> {
  const [w, h] = d.size;
  return sharp(Buffer.from(c.svg(w, h, d.tilt ?? 0))).png().toBuffer();
}

const label = (text: string, w: number, alert = false) =>
  Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='26'><text x='6' y='19' font-family='sans-serif' font-size='16' fill='${alert ? '#d0201a' : '#333'}'>${text}</text></svg>`);

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  const only = args.filter((a) => !a.startsWith('--'));
  const cards = join(root, preview ? 'tools/out/redraws/cards' : 'public/cards');
  const minis = join(root, preview ? 'tools/out/redraws/minis' : 'public/minis');
  await mkdir(cards, { recursive: true });
  await mkdir(minis, { recursive: true });
  const rows: { input: Buffer; left: number; top: number }[] = [];
  const rigSheets: { input: Buffer; left: number; top: number }[] = [];
  const S = 300, ROW = S + 32;
  let n = 0;
  for (const d of REDRAWS) {
    if (only.length && !only.includes(d.id) && !only.includes(d.slug)) continue;
    const c = drawCrayon(d);
    const { data, info } = await sharp(await drawRedraw(d, c)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const res = cutRender({ data, width: info.width, height: info.height }, SHEET);
    const card = join(cards, `${d.id}-${d.slug}.webp`);
    await sharp(Buffer.from(res.data.buffer), { raw: { width: res.width, height: res.height, channels: 4 } })
      .resize({ width: 768, height: 768, fit: 'inside' })
      .webp({ quality: 86, alphaQuality: 90, effort: 6 })
      .toFile(card);
    const mini = join(minis, `${d.id}-${d.slug}.png`);
    if (c.parts().some((p) => p.decor)) {
      // its scenery (a wave, a splash) stays off the follower: the miniature is made from the card without it
      const [w, h] = d.size;
      const bare = await sharp(Buffer.from(c.svg(w, h, d.tilt ?? 0, w / 2, h / 2, 'mini'))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const cut = cutRender({ data: bare.data, width: bare.info.width, height: bare.info.height }, SHEET);
      const bareCard = join(root, 'tools/out', `${d.id}-${d.slug}-mini-source.webp`);
      await sharp(Buffer.from(cut.data.buffer), { raw: { width: cut.width, height: cut.height, channels: 4 } })
        .resize({ width: 768, height: 768, fit: 'inside' }).webp({ quality: 86, alphaQuality: 90 }).toFile(bareCard);
      await makeMini(bareCard, mini);
    } else await makeMini(card, mini);
    if (!preview) {
      const [W, H] = d.size;
      const made = await makeRig({
        id: d.id, slug: d.slug, parts: c.parts(),
        render: (view) => c.svg(W, H, d.tilt ?? 0, W / 2, H / 2, view), place: turned(d.tilt ?? 0, W / 2, H / 2),
      }, root);
      await saveRig(root, d.id, made?.rig ?? null);
      if (made) rigSheets.push({ input: made.sheet, left: (rigSheets.length % 4) * 430, top: Math.floor(rigSheets.length / 4) * 430 });
    }
    console.log(`✓ ${d.id} ${d.slug}${c.parts().length ? ` (${c.parts().map((p) => p.name).join(', ')})` : ''}`);
    // comparison row: her original, the redraw, the redraw small (battle), the miniature
    const top = n++ * ROW;
    const fit = (file: string, size: number, kernel: 'lanczos3' | 'nearest' = 'lanczos3') =>
      sharp(file).resize({ width: size, height: size, fit: 'contain', background: '#ffffff00', kernel }).png().toBuffer();
    const original = [join(root, 'public/originals', `${d.id}-${d.slug}.webp`), join(root, 'public/cards', `${d.id}-${d.slug}.webp`)].find(existsSync);
    if (original && original !== card) rows.push({ input: await fit(original, S), left: 0, top: top + 26 });
    rows.push({ input: await fit(card, S), left: S + 10, top: top + 26 });
    rows.push({ input: await fit(card, 140), left: 2 * S + 20, top: top + 26 });
    // the silhouette test: its shadow alone, at battle size, must say what it is
    const shadow = await sharp(await fit(card, 140)).ensureAlpha().extractChannel(3).toBuffer();
    rows.push({ input: await sharp({ create: { width: 140, height: 140, channels: 3, background: '#3f3b46' } }).joinChannel(shadow).png().toBuffer(), left: 2 * S + 170, top: top + 26 });
    rows.push({ input: await fit(mini, 96, 'nearest'), left: 2 * S + 330, top: top + 26 });
    // the evolution guard: how much its silhouette overlaps the form before (red when too close)
    const prev = CREATURES.find((x) => x.evolutions?.some((e) => e.to === d.id));
    const prevCard = prev && [join(cards, `${prev.id}-${prev.slug}.webp`), join(root, 'public/cards', `${prev.id}-${prev.slug}.webp`)].find(existsSync);
    const ov = prevCard ? await overlap(card, prevCard) : 0;
    const guard = prev ? ` — silhouette ${Math.round(ov * 100)} % de ${prev.slug}${ov >= WARN ? ' : TROP PROCHE' : ''}` : '';
    rows.push({ input: label(`${d.id} ${d.slug} — son dessin / redessiné / en combat / silhouette / mini${guard}`, 2 * S + 440, ov >= WARN), left: 0, top });
  }
  if (n) {
    await sharp({ create: { width: 2 * S + 440, height: n * ROW, channels: 4, background: '#ffffff' } })
      .composite(rows).png().toFile(join(root, 'tools/out/redraws-sheet.png'));
    console.log('sheet → tools/out/redraws-sheet.png');
  }
  if (rigSheets.length) {
    await sharp({ create: { width: 4 * 430, height: Math.ceil(rigSheets.length / 4) * 430, channels: 4, background: '#ffffff' } })
      .composite(rigSheets).png().toFile(join(root, 'tools/out/rigs-sheet.png'));
    console.log('rigs → tools/out/rigs-sheet.png');
  }
}

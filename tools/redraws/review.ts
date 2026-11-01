/**
 * npm run redraws:review -- <id> ...
 * Writes tools/out/review.html, for the owner to approve redesigned Bestioles one by one (docs/bestioles.md, « Le style
 * maison »). Each one is shown as she drew it (when she did), its old card (copied to tools/out/before/cards/ before
 * redrawing), the new card moving as in battle, the new card at battle size and its miniature, and its fair copy
 * when it has one (moving too). A standalone page (pictures inlined) to show on a phone, where GIFs don't play.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { creature } from '../../src/data/creatures.ts';
import { MOTION_DEFAULTS, type Rig, type RigPart } from '../../src/data/rigs.ts';
import { TYPES } from '../../src/data/types.ts';

const root = new URL('../..', import.meta.url).pathname;
const fr = (t: { fr: string } | string) => (typeof t === 'string' ? t : t.fr);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const uri = async (file: string, width?: number) => {
  const buf = width ? await sharp(file).resize({ width, height: width, fit: 'inside' }).webp({ quality: 82 }).toBuffer() : await readFile(file);
  return `data:image/webp;base64,${buf.toString('base64')}`;
};
const png = async (file: string) => `data:image/png;base64,${(await readFile(file)).toString('base64')}`;

const rigs: Record<string, Rig> = JSON.parse(await readFile(join(root, 'src/data/rigs.json'), 'utf8'));
const fairRigs: Record<string, Rig> = JSON.parse(await readFile(join(root, 'src/data/fairRigs.json'), 'utf8'));

/** The rig moving, as in battle (the same CSS as the battle scene). */
async function moving(dir: string, rig: Rig | undefined, still: string, cls = '') {
  if (!rig) return `<img class="still" src="${await uri(still, 420)}" alt="">`;
  const part = async (p: RigPart, i: number) => {
    const [amp, period] = MOTION_DEFAULTS[p.motion];
    const s = p.period ?? period;
    const style = [`left:${p.left}%`, `top:${p.top}%`, `width:${p.width}%`, `height:${p.height}%`, `transform-origin:${p.ox}% ${p.oy}%`,
      `animation-duration:${s}s`, `animation-delay:${-((p.phase ?? ((i * 7) % 10) / 10)) * s}s`,
      `--amp:${p.motion === 'fold' ? 1 - (p.amp ?? amp) / 100 : `${p.amp ?? amp}deg`}`,
      `--to-x:${p.to?.[0] ?? 0}%`, `--to-y:${p.to?.[1] ?? 0}%`, `--shrink:${p.shrink ?? 1}`, `--fade:${p.fade ? 0 : 1}`].join(';');
    return `<img class="part part--${p.motion}${p.behind ? ' is-behind' : ''}" src="${await uri(join(dir, `${p.name}.webp`))}" style="${style}" alt="">`;
  };
  const behind = await Promise.all(rig.parts.map((p, i) => (p.behind ? part(p, i) : '')));
  const front = await Promise.all(rig.parts.map((p, i) => (p.behind ? '' : part(p, i))));
  const clip = rig.parts.some((p) => p.clip) ? ' rig--clip' : '';
  return `<div class="rig${clip} ${cls}">${behind.join('')}<img class="base" src="${await uri(join(dir, 'base.webp'))}" alt="">${front.join('')}</div>`;
}

const ids = process.argv.slice(2);
const forms: string[] = [];
for (const id of ids) {
  const sp = creature(id), name = `${id}-${sp.slug}`;
  const card = join(root, 'public/cards', `${name}.webp`);
  const before = join(root, 'tools/out/before/cards', `${name}.webp`);
  const original = join(root, 'public/originals', `${name}.webp`);
  const mini = join(root, 'public/minis', `${name}.png`);
  const fairDir = join(root, 'public/fair', name);
  const fairStill = join(root, 'tools/out/fair', `${name}.webp`);
  const fair = fairRigs[id] && existsSync(fairDir) ? await moving(fairDir, fairRigs[id], fairStill) : '';
  const types = [sp.type, sp.type2].filter(Boolean).map((t) => `<span class="type" style="--tc:${TYPES[t!].color}">${esc(fr(TYPES[t!].name))}</span>`).join('');
  forms.push(`<article class="form" id="b${id}">
  <header><h2>${esc(fr(sp.name))}</h2><span class="num">n° ${id}</span><span class="types">${types}</span></header>
  <div class="pics">
    ${existsSync(original) ? `<figure><div class="frame"><img class="still" src="${await uri(original, 360)}" alt=""></div><figcaption>Son dessin</figcaption></figure>` : ''}
    ${existsSync(before) ? `<figure><div class="frame frame--old"><img class="still" src="${await uri(before, 360)}" alt=""></div><figcaption>Avant</figcaption></figure>` : ''}
    <figure class="new"><div class="frame frame--new">${await moving(join(root, 'public/rigs', name), rigs[id], card)}</div><figcaption>Nouveau, comme en combat</figcaption></figure>
  </div>
  <div class="small">
    <figure><div class="battle"><img src="${await uri(card, 140)}" alt=""></div><figcaption>Taille combat</figcaption></figure>
    ${existsSync(mini) ? `<figure><div class="battle"><img class="mini" src="${await png(mini)}" alt=""></div><figcaption>Miniature</figcaption></figure>` : ''}
    ${fair ? `<figure class="fairfig"><div class="frame frame--fair">${fair}</div><figcaption>Au propre</figcaption></figure>` : ''}
  </div>
  <p class="dex">${esc(fr(sp.dex))}</p>
</article>`);
}

const html = `<title>Revue des Bestioles</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet">
<style>
:root { --bg: #f7f3ea; --card: #fffdf8; --ink: #27232d; --soft: #6b6474; --line: #d9d0c0; --gold: #f4b81c; --new: #4f9a4a; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #1d1b22; --card: #29262f; --ink: #f2ece0; --soft: #a99fb5; --line: #3e3946; --new: #7cc777; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #1d1b22; --card: #29262f; --ink: #f2ece0; --soft: #a99fb5; --line: #3e3946; --new: #7cc777; color-scheme: dark; }
body { background: var(--bg); color: var(--ink); font: 18px/1.4 'Patrick Hand', 'Comic Sans MS', system-ui, sans-serif;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 20px 40px; }
main { max-width: 820px; margin: 0 auto; display: grid; gap: 22px; }
h1 { font-size: 34px; margin: 0; text-wrap: balance; }
.intro { color: var(--soft); margin: 4px 0 0; max-width: 62ch; }
.form { background: var(--card); border: 2px solid var(--line); border-radius: 14px; padding: 14px; display: grid; gap: 12px; min-width: 0; }
.form header { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.form h2 { margin: 0; font-size: 28px; font-weight: 400; }
.num { color: var(--soft); }
.types { display: inline-flex; gap: 6px; margin-left: auto; }
.type { background: var(--tc); color: #fff; border-radius: 999px; padding: 1px 12px; font-size: 16px; text-shadow: 0 1px 1px #0005; }
.pics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.pics .new { grid-column: 1 / -1; }
figure { margin: 0; display: grid; gap: 4px; justify-items: center; min-width: 0; }
figcaption { color: var(--soft); font-size: 16px; }
.frame { width: 100%; aspect-ratio: 1; max-width: 100%; display: grid; place-items: center; background: #fff; border-radius: 10px; overflow: hidden; padding: 6px; box-sizing: border-box; }
.frame--old { opacity: 0.85; }
.frame--new { box-shadow: inset 0 0 0 3px var(--new); max-width: 460px; }
.frame--fair { box-shadow: inset 0 0 0 3px var(--gold); }
.still { max-width: 100%; max-height: 100%; }
.small { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; align-items: start; }
.battle { width: 150px; height: 150px; display: grid; place-items: center; background: #fff; border-radius: 10px; }
.battle img { max-width: 140px; max-height: 140px; }
.battle .mini { width: 96px; image-rendering: pixelated; }
.dex { margin: 0; color: var(--soft); font-size: 17px; }
.rig { position: relative; isolation: isolate; width: 92%; transform-origin: 50% 100%; animation: breathe 3.4s ease-in-out infinite; }
.rig--clip { overflow: hidden; }
.base { display: block; width: 100%; position: relative; z-index: 1; }
.part { position: absolute; z-index: 2; max-width: none; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
.part.is-behind { z-index: 0; }
@keyframes breathe { 50% { scale: 1.015 1.035; } }
.part--flap { animation-name: flap; animation-direction: alternate; } @keyframes flap { to { rotate: calc(-1 * var(--amp)); } }
.part--fold { animation-name: fold; animation-direction: alternate; } @keyframes fold { to { scale: var(--amp) 1; } }
.part--swing { animation-name: swing; } @keyframes swing { 25% { rotate: var(--amp); } 75% { rotate: calc(-1 * var(--amp)); } }
.part--nod { animation-name: nod; } @keyframes nod { 0%, 70%, 100% { rotate: 0deg; } 80% { rotate: var(--amp); } 90% { rotate: 0deg; } }
.part--reach { animation-name: reach; } @keyframes reach { 0%, 30%, 100% { rotate: 0deg; } 48%, 68% { rotate: var(--amp); } 85% { rotate: 0deg; } }
.part--peek { animation-name: peek; } @keyframes peek { 0%, 40%, 100% { translate: 0 0; scale: 1; opacity: 1; } 52%, 82% { translate: var(--to-x) var(--to-y); scale: var(--shrink); opacity: var(--fade); } }
.part--flicker { animation-name: flicker; animation-timing-function: steps(1, end); } @keyframes flicker { 0%, 100% { opacity: 0; } 6% { opacity: 1; } 12% { opacity: 0; } 16% { opacity: 1; } 28% { opacity: 0; } 60% { opacity: 1; } 66% { opacity: 0; } }
.part--blink { animation-name: blink; animation-timing-function: steps(1, end); } @keyframes blink { 0%, 100% { opacity: 0; } 93% { opacity: 1; } 97% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .rig, .part { animation: none; } }
</style>
<main>
  <header><h1>Revue des Bestioles</h1><p class="intro">Chaque Bestiole redessinée dans le style maison : son dessin à elle quand il existe, l’ancienne carte, la nouvelle qui bouge comme en combat, sa taille en combat, sa miniature et sa copie au propre. Dis-moi pour chacune : validée, ou ce qu’il faut changer. Rien n’est publié sans ton accord.</p></header>
  ${forms.join('\n')}
</main>`;
await writeFile(join(root, 'tools/out/review.html'), html);
console.log(`tools/out/review.html (${forms.length} Bestioles, ${(html.length / 1024 / 1024).toFixed(1)} MB)`);

/**
 * npm run fair:preview [-- <id> ...]
 * Writes tools/out/fair-preview.html: each fair copy beside its pencil drawing, its moving parts playing as in
 * battle, its types, stats and new talent. A standalone page (pictures inlined) to show the owner on a phone,
 * where GIFs don't play.
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { CREATURES, creature, typesOf } from '../../src/data/creatures.ts';
import { move } from '../../src/data/moves.ts';
import { FAIR_COPY, monTypes } from '../../src/data/fairCopies.ts';
import { MOTION_DEFAULTS, type Rig, type RigPart } from '../../src/data/rigs.ts';
import { talent } from '../../src/data/talents.ts';
import { TYPES } from '../../src/data/types.ts';
import type { StatKey, TypeId } from '../../src/data/schema.ts';

const root = new URL('../..', import.meta.url).pathname;
const fr = (t: { fr: string } | string) => (typeof t === 'string' ? t : t.fr);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const STAT: [StatKey, string][] = [['hp', 'PV'], ['atk', 'Atq'], ['def', 'Déf'], ['spa', 'Atq Spé'], ['spd', 'Déf Spé'], ['spe', 'Vit']];

const uri = async (file: string, width?: number) => {
  const buf = width ? await sharp(file).resize({ width, height: width, fit: 'inside' }).webp({ quality: 82 }).toBuffer() : await readFile(file);
  return `data:image/webp;base64,${buf.toString('base64')}`;
};
const badge = (t: TypeId, fresh = false) =>
  `<span class="type${fresh ? ' type--new' : ''}" style="--tc:${TYPES[t].color}">${esc(fr(TYPES[t].name))}</span>`;

const only = process.argv.slice(2);
// what each fair copy will look like, for the ones not drawn yet (tools/out/fair-looks.json, optional)
const looksFile = join(root, 'tools/out/fair-looks.json');
const looks: Record<string, string> = existsSync(looksFile) ? JSON.parse(await readFile(looksFile, 'utf8')) : {};
const planned: string[] = [];
const rigs: Record<string, Rig> = JSON.parse(await readFile(join(root, 'src/data/fairRigs.json'), 'utf8'));
const cards: string[] = [];
for (const [id, fc] of Object.entries(FAIR_COPY)) {
  if (only.length && !only.includes(id)) continue;
  const sp = creature(id), rig = rigs[id];
  if (!rig) {
    const was = typesOf(id), now = monTypes({ species: id, fair: true });
    const tot = (b: Record<StatKey, number>) => STAT.reduce((n, [k]) => n + b[k], 0);
    const t = fc.talent ? talent(fc.talent) : undefined;
    planned.push(`<li class="plan"><img src="${await uri(join(root, 'public/cards', `${id}-${sp.slug}.webp`), 120)}" alt=""><div><b>${esc(fr(sp.name))}</b> <span class="num">n° ${id}</span>
      <div class="types"><span class="was">${was.map((x) => badge(x)).join('')}</span><span class="arrow">→</span><span>${now.map((x) => badge(x, !was.includes(x))).join('')}</span></div>
      <p>${esc(looks[id] ?? '')}. ${tot(sp.base)} → ${tot(fc.base)} (${STAT.filter(([k]) => fc.base[k] > sp.base[k]).sort(([a], [b]) => (fc.base[b] - sp.base[b]) - (fc.base[a] - sp.base[a])).slice(0, 2).map(([k, n]) => `${n} +${fc.base[k] - sp.base[k]}`).join(', ')}…)${t ? `. <strong>Nouveau talent : ${esc(fr(t.name))}</strong> — ${esc(fr(t.desc))}` : ''}</p></div></li>`);
    continue;
  }
  const dir = join(root, 'public/fair', `${id}-${sp.slug}`);
  const part = async (p: RigPart, i: number) => {
    const [amp, period] = MOTION_DEFAULTS[p.motion];
    const s = p.period ?? period;
    const style = [`left:${p.left}%`, `top:${p.top}%`, `width:${p.width}%`, `height:${p.height}%`, `transform-origin:${p.ox}% ${p.oy}%`,
      `animation-duration:${s}s`, `animation-delay:${-(((i * 7) % 10) / 10) * s}s`,
      `--amp:${p.motion === 'fold' ? 1 - (p.amp ?? amp) / 100 : `${p.amp ?? amp}deg`}`,
      `--to-x:${p.to?.[0] ?? 0}%`, `--to-y:${p.to?.[1] ?? 0}%`, `--shrink:${p.shrink ?? 1}`, `--fade:${p.fade ? 0 : 1}`].join(';');
    return `<img class="part part--${p.motion}${p.behind ? ' is-behind' : ''}" src="${await uri(join(dir, `${p.name}.webp`))}" style="${style}" alt="">`;
  };
  const behind = await Promise.all(rig.parts.map((p, i) => (p.behind ? part(p, i) : '')));
  const front = await Promise.all(rig.parts.map((p, i) => (p.behind ? '' : part(p, i))));
  const pencil = join(root, 'public/cards', `${id}-${sp.slug}.webp`);
  const was = typesOf(id);
  const now = monTypes({ species: id, fair: true });
  const total = (b: Record<StatKey, number>) => STAT.reduce((n, [k]) => n + b[k], 0);
  const rows = STAT.map(([k, name]) => {
    const a = sp.base[k], b = fc.base[k], d = b - a;
    return `<div class="stat"><span class="stat__name">${name}</span><span class="bar"><i style="width:${Math.min(100, (a / 180) * 100)}%"></i><b style="width:${Math.min(100, (d / 180) * 100)}%"></b></span><span class="stat__num">${b}${d ? ` <em>+${d}</em>` : ''}</span></div>`;
  }).join('');
  const own = talent(sp.talents[0]);
  const t = fc.talent ? talent(fc.talent) : undefined;
  // the moves of its new type its family learns by levelling up (the fair copy's type would do nothing without them)
  const family: { name: string; learnset: [number, string][] }[] = [];
  for (let c: typeof sp | undefined = sp; c; c = CREATURES.find((x) => x.evolutions?.some((e) => e.to === c!.id))) family.push({ name: fr(c.name), learnset: c.learnset });
  const seen = new Set<string>();
  const learns = fc.type2 ? family.flatMap((c) => c.learnset.filter(([, mv]) => move(mv).type === fc.type2 && move(mv).power > 0 && !seen.has(mv) && !!seen.add(mv))
    .map(([lv, mv]) => `${esc(fr(move(mv).name))} (${move(mv).power}, ${lv ? `N.${lv}` : 'en évoluant'}${c.name !== fr(sp.name) ? `, ${esc(c.name)}` : ''})`)) : [];
  cards.push(`<article class="form">
  <header><h2>${esc(fr(sp.name))} <span>au propre</span></h2><span class="num">n° ${id}</span></header>
  <div class="pics">
    <figure><div class="frame"><img class="pencil" src="${existsSync(pencil) ? await uri(pencil, 420) : ''}" alt=""></div><figcaption>Au crayon</figcaption></figure>
    <figure><div class="frame frame--fair"><div class="rig">${behind.join('')}<img class="base" src="${await uri(join(dir, 'base.webp'))}" alt="">${front.join('')}</div></div><figcaption>Au propre</figcaption></figure>
  </div>
  <div class="types"><span class="was">${was.map((x) => badge(x)).join('')}</span><span class="arrow">→</span><span>${now.map((x) => badge(x, !was.includes(x))).join('')}</span></div>
  <div class="stats">${rows}<div class="stat stat--total"><span class="stat__name">Total</span><span></span><span class="stat__num">${total(fc.base)} <em>+${total(fc.base) - total(sp.base)}</em></span></div></div>
  <p class="talent">${t ? `<strong>Nouveau talent : ${esc(fr(t.name))}</strong> — ${esc(fr(t.desc))} <span class="old">(au lieu de ${esc(fr(own.name))} : ${esc(fr(own.desc))})</span>` : `Talent gardé : <strong>${esc(fr(own.name))}</strong> — ${esc(fr(own.desc))}`}</p>
  ${fc.type2 ? `<p class="talent">Capacités ${esc(fr(TYPES[fc.type2].name))} apprises : ${learns.join(', ')}</p>` : ''}
</article>`);
}

const html = `<title>Mises au propre</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet">
<style>
:root { --bg: #f7f3ea; --card: #fffdf8; --ink: #27232d; --soft: #6b6474; --line: #d9d0c0; --gold: #f4b81c; --bar: #c9c1b4; --up: #e0a10a; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #1d1b22; --card: #29262f; --ink: #f2ece0; --soft: #a99fb5; --line: #3e3946; --bar: #57505f; --up: #f4c443; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #1d1b22; --card: #29262f; --ink: #f2ece0; --soft: #a99fb5; --line: #3e3946; --bar: #57505f; --up: #f4c443; color-scheme: dark; }
body { background: var(--bg); color: var(--ink); font: 18px/1.4 'Patrick Hand', 'Comic Sans MS', system-ui, sans-serif;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 20px 40px; }
main { max-width: 760px; margin: 0 auto; display: grid; gap: 22px; }
h1 { font-size: 34px; margin: 0; text-wrap: balance; }
.intro { color: var(--soft); margin: 4px 0 0; max-width: 62ch; }
.form { background: var(--card); border: 2px solid var(--line); border-radius: 14px; padding: 14px; display: grid; gap: 12px; min-width: 0; }
.form header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.form h2 { margin: 0; font-size: 26px; font-weight: 400; }
.form h2 span { color: var(--up); }
.num { color: var(--soft); }
.pics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
figure { margin: 0; display: grid; gap: 4px; justify-items: center; min-width: 0; }
figcaption { color: var(--soft); font-size: 16px; }
.frame { width: 100%; aspect-ratio: 1; max-width: 100%; display: grid; place-items: center; background: #fff; border-radius: 10px; overflow: hidden; padding: 6px; box-sizing: border-box; }
.frame--fair { box-shadow: inset 0 0 0 3px var(--gold); }
.pencil { max-width: 100%; max-height: 100%; }
.rig { position: relative; isolation: isolate; width: 92%; transform-origin: 50% 100%; animation: breathe 3.4s ease-in-out infinite; }
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
.types { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.types > span { display: inline-flex; gap: 6px; }
.was { opacity: 0.7; }
.arrow { color: var(--soft); }
.type { background: var(--tc); color: #fff; border-radius: 999px; padding: 1px 12px; font-size: 16px; text-shadow: 0 1px 1px #0005; }
.type--new { box-shadow: 0 0 0 2px var(--card), 0 0 0 4px var(--gold); }
.stats { display: grid; gap: 3px; }
.stat { display: grid; grid-template-columns: 70px 1fr 82px; gap: 8px; align-items: center; font-size: 16px; }
.stat__name { color: var(--soft); }
.stat__num { text-align: right; font-variant-numeric: tabular-nums; }
.stat__num em { color: var(--up); font-style: normal; }
.stat--total { margin-top: 4px; }
.bar { height: 10px; background: color-mix(in srgb, var(--bar) 35%, transparent); border-radius: 6px; display: flex; overflow: hidden; }
.bar i { background: var(--bar); } .bar b { background: var(--up); }
.talent { margin: 0; font-size: 17px; }
.talent .old { color: var(--soft); }
h3 { font-size: 26px; font-weight: 400; margin: 12px 0 0; }
.plans { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.plan { background: var(--card); border: 2px dashed var(--line); border-radius: 12px; padding: 10px; display: grid; grid-template-columns: 76px 1fr; gap: 10px; align-items: start; }
.plan > div { min-width: 0; display: grid; gap: 4px; }
.plan img { width: 76px; height: 76px; object-fit: contain; background: #fff; border-radius: 8px; }
.plan p { margin: 0; font-size: 16px; }
</style>
<main>
  <header><h1>Mises au propre</h1><p class="intro">Each Bestiole as she drew it, and its fair copy: the same drawing grown up, in her pencil under a felt-tip outline, moving as in battle. Under it: its types (it keeps them; the six that take a new one have it ringed in gold, with the moves of it they learn), its stats (+20 %, HP unchanged) and its new talent. Tell me which to keep and what to change.</p></header>
  ${cards.join('\n')}
  ${planned.length ? `<h3>Pas encore dessinées (${planned.length})</h3><p class="intro">The plan for each one (what it already has grows, no costumes): its new type, what grows, where its +20 % goes. Say if an idea should change before I draw it.</p><ul class="plans">${planned.join('')}</ul>` : ''}
</main>`;
await writeFile(join(root, 'tools/out/fair-preview.html'), html);
console.log(`tools/out/fair-preview.html (${cards.length} forms, ${(html.length / 1024 / 1024).toFixed(1)} MB)`);

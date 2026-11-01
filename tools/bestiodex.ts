/**
 * npm run dex
 * Writes tools/out/bestiodex.html: every Bestiole with its card, types, base stats, talents, moves (by level and by
 * stencil), evolutions, weaknesses and fair copy. A page to read on this machine: the cards are linked from public/.
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CREATURES, creature } from '../src/data/creatures.ts';
import { FAIR_COPY, monTypes } from '../src/data/fairCopies.ts';
import { item } from '../src/data/items.ts';
import { move } from '../src/data/moves.ts';
import { talent } from '../src/data/talents.ts';
import { TYPES, effectiveness } from '../src/data/types.ts';
import type { EvolutionRule, MoveDef, TypeId } from '../src/data/schema.ts';

const root = new URL('..', import.meta.url).pathname;
const fr = (t: { fr: string }) => t.fr;

const moveOf = (m: MoveDef) => ({
  name: fr(m.name), type: m.type, cat: m.cat, power: m.power, acc: m.acc, pp: m.pp, priority: m.priority ?? 0, desc: fr(m.desc),
});
const talentOf = (id: string) => ({ name: fr(talent(id).name), desc: fr(talent(id).desc) });
const rule = (r: EvolutionRule) =>
  r.level ? `niveau ${r.level}`
    : r.item ? fr(item(r.item).name)
      : r.friendship ? `amitié ${r.friendship}`
        : r.story ? `fin de l’histoire (${r.story === 1 ? 'retouché' : 'gardé tel quel'})` : '?';
const types = Object.keys(TYPES) as TypeId[];

const dex = CREATURES.map((c, i) => {
  const own: TypeId[] = c.type2 ? [c.type, c.type2] : [c.type];
  const fc = FAIR_COPY[c.id];
  return {
    no: i + 1, id: c.id, slug: c.slug, name: fr(c.name), en: c.name.en, kind: fr(c.kind), types: own,
    base: c.base, catchRate: c.catchRate, baseExp: c.baseExp, rarity: c.rarity, dex: fr(c.dex),
    after: !!c.afterStory, reward: !!c.dexReward,
    final: !c.evolutions?.length, talents: c.talents.map(talentOf), hidden: talentOf(c.hiddenTalent),
    from: c.evolvesFrom ? { id: c.evolvesFrom, name: fr(creature(c.evolvesFrom).name) } : null,
    to: (c.evolutions ?? []).map((r) => ({ id: r.to, name: fr(creature(r.to).name), how: rule(r) })),
    learnset: c.learnset.map(([lv, id]) => ({ lv, ...moveOf(move(id)) })),
    stencils: c.stencils.map((s) => ({ item: fr(item(s).name), ...moveOf(move(item(s).move!)) })),
    weak: Object.fromEntries(types.map((t) => [t, effectiveness(t, own)])),
    fair: fc && {
      types: monTypes({ species: c.id, fair: true }),
      base: fc.base, talent: fc.talent ? talentOf(fc.talent) : null,
    },
  };
});
const typeInfo = Object.fromEntries(types.map((t) => [t, { name: fr(TYPES[t].name), color: TYPES[t].color, light: TYPES[t].light, icon: TYPES[t].icon }]));

const html = /* html */ `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bestiodex</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap">
<style>
:root { --paper:#fbf6ea; --card:#fffdf7; --ink:#3a3330; --soft:#8a7f76; --line:#d9cfc0; --accent:#c0603a; }
@media (prefers-color-scheme: dark) { :root { --paper:#24201d; --card:#2e2925; --ink:#efe6d8; --soft:#a89c8f; --line:#4a423b; --accent:#e89060; color-scheme: dark } }
* { box-sizing: border-box }
body { margin:0; background:var(--paper); color:var(--ink); font:16px/1.35 'Patrick Hand', 'Comic Sans MS', cursive; }
header { position:sticky; top:0; z-index:5; background:var(--paper); border-bottom:2px solid var(--line); padding:10px 16px; display:flex; flex-wrap:wrap; gap:8px; align-items:center }
h1 { margin:0 12px 0 0; font-size:26px; font-weight:normal }
input, select { font:inherit; padding:4px 10px; border:2px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink) }
input { flex:1; min-width:150px }
.count { color:var(--soft) }
.layout { display:grid; grid-template-columns:minmax(220px, 340px) 1fr; gap:16px; padding:16px; align-items:start }
.list { display:grid; grid-template-columns:repeat(auto-fill, minmax(96px, 1fr)); gap:8px; position:sticky; top:70px; max-height:calc(100vh - 86px); overflow:auto; padding-right:4px }
.tile { background:var(--card); border:2px solid var(--line); border-radius:14px; padding:6px 4px; text-align:center; cursor:pointer; min-width:0 }
.tile.on { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent) inset }
.tile img { width:100%; aspect-ratio:1; object-fit:contain }
.tile .n { font-size:13px; color:var(--soft) }
.tile .nm { white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.dots { display:flex; justify-content:center; gap:3px; margin-top:2px }
.dot { width:10px; height:10px; border-radius:50% }
.sheet { background:var(--card); border:2px solid var(--line); border-radius:18px; padding:16px 20px; min-width:0 }
.top { display:grid; grid-template-columns:240px 1fr; gap:20px; align-items:start }
.top img { width:100%; max-width:240px; aspect-ratio:1; object-fit:contain }
.title { font-size:32px; line-height:1.1 }
.sub { color:var(--soft) }
.type { display:inline-flex; align-items:center; gap:4px; padding:1px 10px 1px 4px; border-radius:20px; color:#fff; background:var(--tc); font-size:15px; margin:2px 4px 2px 0; white-space:nowrap }
.type svg { width:16px; height:16px }
.type.small { font-size:13px; padding:0 8px 0 3px } .type.small svg { width:13px; height:13px }
h2 { font-weight:normal; font-size:22px; margin:18px 0 6px; border-bottom:2px dashed var(--line) }
.stats { display:grid; grid-template-columns:auto 3ch 1fr; gap:3px 10px; align-items:center; max-width:520px }
.bar { height:12px; border-radius:6px; background:var(--line); overflow:hidden }
.bar i { display:block; height:100% }
.num { text-align:right }
.facts { display:flex; flex-wrap:wrap; gap:6px 18px; margin-top:8px }
.facts b { font-weight:normal; color:var(--soft) }
.talent { margin:4px 0 } .talent em { color:var(--soft); font-style:normal; font-size:14px }
.moves { display:grid; gap:4px }
.mv { display:grid; grid-template-columns:3.2ch minmax(0,1.4fr) 10ch 5ch repeat(3, 4.5ch); gap:8px; align-items:center; padding:4px 6px; border-radius:8px; cursor:pointer }
.mv:nth-child(odd) { background:color-mix(in srgb, var(--line) 30%, transparent) }
.mv .d { grid-column:2 / -1; color:var(--soft); font-size:14px; display:none }
.mv.open .d { display:block }
.mv.head { cursor:default; color:var(--soft); background:none !important; font-size:14px }
.cat { font-size:13px; color:var(--soft) }
.weak { display:flex; flex-wrap:wrap; gap:8px 16px }
.weak > div { display:flex; flex-wrap:wrap; align-items:center; gap:2px }
.weak b { font-weight:normal; min-width:3.5ch; color:var(--soft) }
.evo { display:flex; flex-wrap:wrap; gap:8px; align-items:center }
.evo a { color:var(--accent); cursor:pointer; text-decoration:underline }
.dextext { font-size:18px; margin-top:10px }
.tag { display:inline-block; font-size:13px; border:1px solid var(--soft); color:var(--soft); border-radius:8px; padding:0 6px; margin-left:6px }
nav { display:flex; gap:4px }
nav button { font:inherit; padding:3px 14px; border:2px solid var(--line); border-radius:10px; background:var(--card); color:var(--ink); cursor:pointer }
nav button.on { border-color:var(--accent); color:var(--accent) }
body.types .layout, body:not(.types) .typesview { display:none }
body.types #q, body.types #sort, body.types #ty, body.types #count { display:none }
.typesview { padding:16px; display:grid; gap:16px; max-width:1100px }
.panel { background:var(--card); border:2px solid var(--line); border-radius:18px; padding:14px 18px; min-width:0 }
.panel h2 { margin-top:0 }
.seg { display:inline-flex; border:2px solid var(--line); border-radius:10px; overflow:hidden }
.seg button { font:inherit; border:0; padding:2px 12px; background:var(--card); color:var(--ink); cursor:pointer }
.seg button.on { background:var(--accent); color:var(--card) }
.controls { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; margin-bottom:10px }
.legend { display:flex; gap:14px; color:var(--soft); font-size:14px; align-items:center }
.sw { display:inline-block; width:14px; height:14px; border-radius:3px; vertical-align:-2px; margin-right:4px; background:var(--soft) }
.sw.hatch { background:repeating-linear-gradient(45deg, var(--soft) 0 3px, transparent 3px 6px); outline:1px solid var(--soft); outline-offset:-1px }
.bars { display:grid; grid-template-columns:max-content 1fr; gap:6px 10px; align-items:center }
.track { display:flex; align-items:center; gap:2px; height:20px; min-width:0 }
.track i { display:block; height:100%; cursor:pointer }
.track i:first-child { border-radius:4px 0 0 4px } .track i:last-of-type { border-radius:0 4px 4px 0 } .track i:only-of-type { border-radius:4px }
.track i.sec { background:repeating-linear-gradient(45deg, var(--tc) 0 4px, color-mix(in srgb, var(--tc) 35%, var(--card)) 4px 8px) !important }
.track .v { margin-left:6px; color:var(--ink); white-space:nowrap; font-size:15px }
.track .v small { color:var(--soft) }
.matrixwrap { overflow-x:auto }
.matrix { border-collapse:separate; border-spacing:2px; font-size:13px }
.matrix th { font-weight:normal; color:var(--soft); padding:0 2px }
.matrix th.col { height:86px; vertical-align:bottom } .matrix th.col span { writing-mode:vertical-rl; transform:rotate(180deg); white-space:nowrap }
.matrix th.row { text-align:right; white-space:nowrap }
.matrix td { width:28px; height:28px; min-width:28px; text-align:center; border-radius:5px; cursor:default }
.matrix td.n { cursor:pointer }
.tip { position:fixed; z-index:20; pointer-events:none; background:var(--card); color:var(--ink); border:2px solid var(--line); border-radius:10px; padding:6px 10px; max-width:280px; font-size:14px; box-shadow:0 4px 14px rgba(0,0,0,.18) }
.tip b { font-weight:normal; font-size:16px }
.note { color:var(--soft); font-size:14px; margin-top:8px }
@media (max-width: 760px) {
  .layout { grid-template-columns:1fr } .list { position:static; max-height:280px }
  .top { grid-template-columns:1fr } .top img { max-width:200px; margin:auto; display:block }
  .mv { grid-template-columns:3.2ch minmax(0,1fr) auto 4ch 4ch 3.5ch; gap:6px } .mv .ca { display:none }
}
</style></head><body>
<header>
  <h1>Bestiodex</h1>
  <nav><button id="tabDex" class="on">Fiches</button><button id="tabTypes">Types</button></nav>
  <input id="q" placeholder="Nom, talent, attaque…">
  <select id="ty"><option value="">Tous les types</option></select>
  <select id="sort"><option value="no">N°</option><option value="total">Total</option><option value="hp">PV</option><option value="atk">Attaque</option><option value="def">Défense</option><option value="spa">Atq. Spé.</option><option value="spd">Déf. Spé.</option><option value="spe">Vitesse</option><option value="name">Nom</option></select>
  <span class="count" id="count"></span>
</header>
<div class="layout"><div class="list" id="list"></div><main class="sheet" id="sheet"></main></div>
<section class="typesview">
  <div class="panel">
    <h2>Répartition des types</h2>
    <div class="controls">
      <div class="seg" id="scope"><button data-v="all" class="on">Toutes les espèces</button><button data-v="final">Formes finales</button></div>
      <div class="seg" id="tsort"><button data-v="count" class="on">Par nombre</button><button data-v="type">Par type</button></div>
      <div class="legend"><span><span class="sw"></span>premier type</span><span><span class="sw hatch"></span>second type</span></div>
    </div>
    <div class="bars" id="bars"></div>
    <div class="note" id="typenote"></div>
  </div>
  <div class="panel">
    <h2>Combinaisons</h2>
    <div class="matrixwrap"><table class="matrix" id="matrix"></table></div>
    <div class="note">Une case = les Bestioles qui ont ces deux types (dans n’importe quel ordre). La diagonale : un seul type.</div>
  </div>
</section>
<div class="tip" id="tip" hidden></div>
<script>
const DEX = ${JSON.stringify(dex)};
const TYPES = ${JSON.stringify(typeInfo)};
const STATS = [['hp','PV'],['atk','Attaque'],['def','Défense'],['spa','Atq. Spé.'],['spd','Déf. Spé.'],['spe','Vitesse']];
const CAT = { phys:'Physique', spec:'Spéciale', status:'Statut' };
const RAR = { common:'commune', uncommon:'peu commune', rare:'rare', legendary:'légendaire' };
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const card = (b) => '../../public/cards/' + b.id + '-' + b.slug + '.webp';
const total = (s) => s.hp + s.atk + s.def + s.spa + s.spd + s.spe;
const badge = (t, small) => '<span class="type' + (small ? ' small' : '') + '" style="--tc:' + TYPES[t].color + '"><svg viewBox="0 0 24 24"><path fill="#fff" d="' + TYPES[t].icon + '"/></svg>' + esc(TYPES[t].name) + '</span>';
const statColor = (v) => v >= 120 ? '#3f9a5a' : v >= 90 ? '#7dbb4a' : v >= 60 ? '#e2b23a' : '#e07a4a';
const stats = (s) => '<div class="stats">' + STATS.map(([k, n]) => '<span>' + n + '</span><span class="num">' + s[k] + '</span><div class="bar"><i style="width:' + Math.min(100, s[k] / 1.6) + '%;background:' + statColor(s[k]) + '"></i></div>').join('') + '<span>Total</span><span class="num">' + total(s) + '</span><span></span></div>';
const mvRow = (m, first) => '<div class="mv"><span>' + first + '</span><span>' + esc(m.name) + (m.priority ? ' <span class="cat">(prio ' + (m.priority > 0 ? '+' : '') + m.priority + ')</span>' : '') + '</span><span class="ty">' + badge(m.type, true) + '</span><span class="cat ca">' + CAT[m.cat] + '</span><span class="num">' + (m.power || '–') + '</span><span class="num">' + (m.acc ?? '∞') + '</span><span class="num">' + m.pp + '</span><div class="d">' + esc(m.desc) + '</div></div>';
const mvHead = (first) => '<div class="mv head"><span>' + first + '</span><span>Attaque</span><span class="ty">Type</span><span class="ca">Cat.</span><span class="num">Puis.</span><span class="num">Préc.</span><span class="num">PP</span></div>';
const talentRow = (t, label) => '<div class="talent">' + esc(t.name) + (label ? '<span class="tag">' + label + '</span>' : '') + '<br><em>' + esc(t.desc) + '</em></div>';
const link = (id, name) => '<a data-id="' + id + '">' + esc(name) + '</a>';

function weak(b) {
  const groups = [[4, '×4'], [2, '×2'], [0.5, '×½'], [0.25, '×¼'], [0, '×0']];
  return '<div class="weak">' + groups.map(([k, l]) => {
    const ts = Object.keys(b.weak).filter((t) => b.weak[t] === k);
    return ts.length ? '<div><b>' + l + '</b>' + ts.map((t) => badge(t, true)).join('') + '</div>' : '';
  }).join('') + '</div>';
}

let current = DEX[0].id;
function show(id) {
  current = id;
  const b = DEX.find((x) => x.id === id);
  const evo = [b.from ? '← ' + link(b.from.id, b.from.name) : '', ...b.to.map((e) => '→ ' + link(e.id, e.name) + ' <span class="sub">(' + esc(e.how) + ')</span>')].filter(Boolean);
  document.getElementById('sheet').innerHTML =
    '<div class="top"><img src="' + card(b) + '" alt=""><div>' +
      '<div class="sub">N° ' + String(b.no).padStart(3, '0') + ' · id ' + b.id + (b.after ? '<span class="tag">après l’histoire</span>' : '') + (b.reward ? '<span class="tag">récompense du Bestiodex</span>' : '') + '</div>' +
      '<div class="title">' + esc(b.name) + '</div><div class="sub">' + esc(b.en) + ' · ' + esc(b.kind) + '</div>' +
      '<div style="margin-top:6px">' + b.types.map((t) => badge(t)).join('') + '</div>' +
      '<div class="dextext">' + esc(b.dex) + '</div>' +
      '<div class="facts"><span><b>Capture</b> ' + b.catchRate + '</span><span><b>XP de base</b> ' + b.baseExp + '</span><span><b>Rareté</b> ' + RAR[b.rarity] + '</span></div>' +
      (evo.length ? '<div class="evo" style="margin-top:8px">' + evo.join('<span class="sub">·</span>') + '</div>' : '<div class="sub" style="margin-top:8px">N’évolue pas</div>') +
    '</div></div>' +
    '<h2>Statistiques de base</h2>' + stats(b.base) +
    '<h2>Talents</h2>' + b.talents.map((t, i) => talentRow(t, i === 0 ? 'pouvoir de la famille' : '')).join('') + talentRow(b.hidden, 'caché, 1 sur 4') +
    '<h2>Faiblesses et résistances</h2>' + weak(b) +
    (b.fair ? '<h2>Mise au propre</h2><div>' + b.fair.types.map((t) => badge(t)).join('') + '</div>' + stats(b.fair.base) + (b.fair.talent ? talentRow(b.fair.talent, 'talent au propre') : '') : '') +
    '<h2>Attaques par niveau</h2><div class="moves">' + mvHead('Niv.') + b.learnset.map((m) => mvRow(m, m.lv === 0 ? 'Évo' : m.lv)).join('') + '</div>' +
    (b.stencils.length ? '<h2>Pochoirs</h2><div class="moves">' + mvHead('') + b.stencils.map((m) => mvRow(m, '')).join('') + '</div>' : '');
  document.querySelectorAll('.tile').forEach((t) => t.classList.toggle('on', t.dataset.id === id));
  try { history.replaceState(null, '', '#' + id); } catch {}
}

function render() {
  const q = document.getElementById('q').value.trim().toLowerCase(), ty = document.getElementById('ty').value, sort = document.getElementById('sort').value;
  let list = DEX.filter((b) => (!ty || b.types.includes(ty)) && (!q || [b.name, b.en, b.kind, b.id, ...b.talents.map((t) => t.name), b.hidden.name, ...b.learnset.map((m) => m.name), ...b.stencils.map((m) => m.name)].join(' ').toLowerCase().includes(q)));
  if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  else if (sort !== 'no') list = [...list].sort((a, b) => (sort === 'total' ? total(b.base) - total(a.base) : b.base[sort] - a.base[sort]));
  document.getElementById('count').textContent = list.length + ' / ' + DEX.length;
  document.getElementById('list').innerHTML = list.map((b) => '<div class="tile" data-id="' + b.id + '"><img loading="lazy" src="' + card(b) + '" alt=""><div class="n">' + String(b.no).padStart(3, '0') + (sort !== 'no' && sort !== 'name' ? ' · ' + (sort === 'total' ? total(b.base) : b.base[sort]) : '') + '</div><div class="nm">' + esc(b.name) + '</div><div class="dots">' + b.types.map((t) => '<span class="dot" style="background:' + TYPES[t].color + '"></span>').join('') + '</div></div>').join('');
  document.querySelectorAll('.tile').forEach((t) => t.classList.toggle('on', t.dataset.id === current));
}

const sel = document.getElementById('ty');
Object.keys(TYPES).forEach((t) => sel.insertAdjacentHTML('beforeend', '<option value="' + t + '">' + esc(TYPES[t].name) + '</option>'));
['q', 'ty', 'sort'].forEach((id) => document.getElementById(id).addEventListener('input', render));
document.getElementById('list').addEventListener('click', (e) => { const t = e.target.closest('.tile'); if (t) { show(t.dataset.id); if (innerWidth <= 760) document.getElementById('sheet').scrollIntoView({ behavior: 'smooth' }); } });
document.getElementById('sheet').addEventListener('click', (e) => {
  const a = e.target.closest('a[data-id]'); if (a) return show(a.dataset.id);
  const m = e.target.closest('.mv:not(.head)'); if (m) m.classList.toggle('open');
});
// the Types view
let scope = 'all', tsort = 'count';
const tip = document.getElementById('tip');
const showTip = (e, html) => { tip.innerHTML = html; tip.hidden = false; const r = tip.getBoundingClientRect(); tip.style.left = Math.min(innerWidth - r.width - 8, e.clientX + 14) + 'px'; tip.style.top = Math.max(8, e.clientY - r.height - 10) + 'px'; };
const names = (list) => list.map((b) => esc(b.name)).join(', ');
function renderTypes() {
  const pool = DEX.filter((b) => scope === 'all' || b.final);
  const rows = Object.keys(TYPES).map((t) => ({ t, first: pool.filter((b) => b.types[0] === t), second: pool.filter((b) => b.types[1] === t) }));
  rows.forEach((r) => (r.n = r.first.length + r.second.length));
  if (tsort === 'count') rows.sort((a, b) => b.n - a.n || b.first.length - a.first.length);
  const max = Math.max(...rows.map((r) => r.n));
  document.getElementById('bars').innerHTML = rows.map((r) =>
    '<span>' + badge(r.t, true) + '</span><div class="track" style="--tc:' + TYPES[r.t].color + '">' +
      (r.first.length ? '<i data-t="' + r.t + '" data-k="first" style="width:' + (r.first.length / max) * 85 + '%;background:var(--tc)"></i>' : '') +
      (r.second.length ? '<i class="sec" data-t="' + r.t + '" data-k="second" style="width:' + (r.second.length / max) * 85 + '%"></i>' : '') +
      '<span class="v">' + r.n + (r.second.length ? ' <small>(' + r.first.length + ' + ' + r.second.length + ')</small>' : '') + '</span></div>').join('');
  const dual = pool.filter((b) => b.types.length > 1).length;
  document.getElementById('typenote').textContent = pool.length + ' Bestioles, dont ' + dual + ' à deux types. Une Bestiole à deux types compte dans chacun.';
  document.getElementById('bars').onmousemove = (e) => {
    const i = e.target.closest('i[data-t]'); if (!i) return (tip.hidden = true);
    const r = rows.find((x) => x.t === i.dataset.t), list = r[i.dataset.k];
    showTip(e, '<b>' + esc(TYPES[r.t].name) + '</b> · ' + (i.dataset.k === 'first' ? 'premier type' : 'second type') + ' : ' + list.length + '<br>' + names(list));
  };
  document.getElementById('bars').onmouseleave = () => (tip.hidden = true);

  // the combinations, as a half matrix
  const ts = Object.keys(TYPES), cell = {};
  for (const b of pool) { const [a, c = a] = b.types; const k = [a, c].sort((x, y) => ts.indexOf(x) - ts.indexOf(y)).join('|'); (cell[k] ||= []).push(b); }
  const cmax = Math.max(...Object.values(cell).map((l) => l.length));
  let h = '<tr><th></th>' + ts.map((t) => '<th class="col"><span>' + esc(TYPES[t].name) + '</span></th>').join('') + '</tr>';
  ts.forEach((r, ri) => {
    h += '<tr><th class="row">' + esc(TYPES[r].name) + '</th>';
    ts.forEach((c, ci) => {
      if (ci > ri) return (h += '<td></td>');
      const l = cell[[c, r].join('|')] || [];
      const a = l.length ? 0.18 + 0.82 * (l.length / cmax) : 0;
      h += l.length
        ? '<td class="n" data-k="' + c + '|' + r + '" style="background:color-mix(in srgb, var(--accent) ' + Math.round(a * 100) + '%, var(--card));color:' + (a > 0.55 ? 'var(--card)' : 'var(--ink)') + '">' + l.length + '</td>'
        : '<td style="background:color-mix(in srgb, var(--line) 35%, transparent)"></td>';
    });
    h += '</tr>';
  });
  const m = document.getElementById('matrix');
  m.innerHTML = h;
  m.onmousemove = (e) => {
    const td = e.target.closest('td.n'); if (!td) return (tip.hidden = true);
    const [a, c] = td.dataset.k.split('|'), l = cell[td.dataset.k];
    showTip(e, '<b>' + esc(TYPES[a].name) + (a !== c ? ' / ' + esc(TYPES[c].name) : ' seul') + '</b> : ' + l.length + '<br>' + names(l));
  };
  m.onmouseleave = () => (tip.hidden = true);
}
const seg = (id, set) => document.getElementById(id).addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('#' + id + ' button').forEach((x) => x.classList.toggle('on', x === b)); set(b.dataset.v); renderTypes();
});
seg('scope', (v) => (scope = v)); seg('tsort', (v) => (tsort = v));
const tab = (types) => { document.body.classList.toggle('types', types); document.getElementById('tabDex').classList.toggle('on', !types); document.getElementById('tabTypes').classList.toggle('on', types); if (types) renderTypes(); try { history.replaceState(null, '', '#' + (types ? 'types' : current)); } catch {} };
document.getElementById('tabDex').addEventListener('click', () => tab(false));
document.getElementById('tabTypes').addEventListener('click', () => tab(true));

render();
const start = location.hash.slice(1);
show(DEX.some((b) => b.id === start) ? start : DEX[0].id);
if (start === 'types') tab(true);
</script></body></html>`;

const out = join(root, 'tools/out/bestiodex.html');
await writeFile(out, html);
console.log(`${dex.length} Bestioles → ${out}`);

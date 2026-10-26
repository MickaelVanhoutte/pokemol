import { useState } from 'preact/hooks';
import { L, locale, tr } from '../../i18n';
import { creature, dexNo, monLabel } from '../../data/creatures';
import { monArtUrl } from '../monArt';
import { evolutionHints } from '../evolutionText';
import { move } from '../../data/moves';
import { STAT_NAMES, TYPES } from '../../data/types';
import { MAX_LEVEL, maxHp, statsOf, xpAt, type Mon } from '../../engine/pk/creature';
import { HpBar, MenuList, PixelIcon, StatusTag, TypeBadge, TypeBadges, Window, XpBar, YesNo, lv } from '../paper';
import { item } from '../../data/items';
import { ivGrade } from '../../engine/pk/judge';
import { nature } from '../../data/natures';
import { talentOf } from '../../data/talents';
import { MAPS } from '../../data/maps';
import type { MetHow } from '../../engine/pk/creature';
import type { StatKey } from '../../data/schema';
import { useMenuNav } from '../paper/nav';
import './views.css';

type Page = 0 | 1 | 2;
const PAGES = [L('INFOS', 'INFO'), L('STATS', 'SKILLS'), L('CAPACITÉS', 'MOVES')];

const MET: Record<MetHow, ReturnType<typeof L>> = {
  starter: L('Choisi au N.{l} — {p}', 'Chosen at Lv{l} — {p}'),
  caught: L('Attrapé au N.{l} — {p}', 'Caught at Lv{l} — {p}'),
  gift: L('Reçu au N.{l} — {p}', 'Received at Lv{l} — {p}'),
  tombola: L('Gagné au N.{l} — {p}', 'Won at Lv{l} — {p}'),
  egg: L('Éclos au N.{l} — {p}', 'Hatched at Lv{l} — {p}'),
};

/** « Attrapé au N.5 — Chemin des Crayons » (nothing for Bestioles from older saves). */
function metLine(mon: Mon): string | null {
  if (!mon.met) return null;
  const place = MAPS[mon.met.map] ? tr(MAPS[mon.met.map].name) : '???';
  return tr(MET[mon.met.how], { l: mon.met.level, p: place });
}

/** Friendship as five hearts (♥ full, ♡ empty). */
const hearts = (f: number) => {
  const n = Math.min(5, Math.round(f / 51));
  return '♥'.repeat(n) + '♡'.repeat(5 - n);
};

/** Letter for what the Bestiole was born with in a stat (E to S). */
function Grade({ mon, k }: { mon: Mon; k: StatKey }) {
  const g = ivGrade(mon.ivs[k]);
  return <i class={`grade grade--${g}`} title={tr(L('Qualité de naissance', 'Born quality'))}>{g}</i>;
}

/** ▲ / ▼ when the nature raises or lowers the stat. */
function NatureMark({ mon, k }: { mon: Mon; k: StatKey }) {
  const n = nature(mon.nature);
  if (k === n.up) return <i class="nat nat--up" aria-label="+10%">▲</i>;
  if (k === n.down) return <i class="nat nat--down" aria-label="−10%">▼</i>;
  return null;
}

/** « Nature rêveuse » / "Dreamy nature". */
const natureLabel = (mon: Mon) => {
  const name = tr(nature(mon.nature).name);
  return locale.value === 'fr' ? `Nature ${name.toLowerCase()}` : `${name} nature`;
};

/**
 * FRLG summary: INFOS / STATS / CAPACITÉS. With `learn`, opens on the moves page with the new
 * move as a 5th row: picking a row forgets it (`null` = give up the new move).
 */
export function SummaryView({ mon, onClose, learn }: {
  mon: Mon; onClose: () => void; learn?: { move: string; onPick: (forget: number | null) => void };
}) {
  const [page, setPage] = useState<Page>(learn ? 2 : 0);
  const [sel, setSel] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const sp = creature(mon.species);
  const color = TYPES[sp.type].color;
  const turn = (d: 1 | -1) => !learn && setPage((p) => (((p + d + 3) % 3) as Page));
  useMenuNav(0, {
    active: confirm === null,
    onSelect: () => undefined,
    onCancel: () => (learn ? setConfirm(4) : onClose()),
  });
  // swipe between pages
  let x0 = 0;
  const down = (e: PointerEvent) => (x0 = e.clientX);
  const up = (e: PointerEvent) => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1);
  };
  const moves = learn ? [...mon.moves.map((m) => m.id), learn.move] : mon.moves.map((m) => m.id);
  const detail = sel !== null ? move(moves[sel]) : null;
  const stats = statsOf(mon);
  const toNext = mon.level >= MAX_LEVEL ? 0 : xpAt(mon.level + 1) - mon.xp;
  const xpPct = mon.level >= MAX_LEVEL ? 100 : ((mon.xp - xpAt(mon.level)) / (xpAt(mon.level + 1) - xpAt(mon.level))) * 100;

  return (
    <div class="frame graph summary" style={{ '--type': color }} onPointerDown={down} onPointerUp={up}>
      <div class="summary__tabs">
        {!learn && <button class="pbtn" onClick={() => turn(-1)} aria-label="◀">◀</button>}
        <div class="summary__tabnames">
          {PAGES.map((p, i) => <span class={i === page ? 'is-on' : ''} onClick={() => !learn && setPage(i as Page)}>{tr(p)}</span>)}
        </div>
        {!learn && <button class="pbtn" onClick={() => turn(1)} aria-label="▶">▶</button>}
      </div>
      <Window class="summary__head">
        <div class="summary__art"><img class="mon-art" src={monArtUrl(mon)} alt="" /></div>
        <div class="summary__id">
          <b class="summary__name">{monLabel(mon)}{mon.shiny && <i class="shiny-mark" title={tr(L('Bestiole pailletée', 'Sparkly Critter'))}> ✦</i>}</b>
          {mon.nickname && <small class="summary__species">{tr(sp.name)}</small>}
          <span>{lv(mon.level)} {mon.status && <StatusTag s={mon.status} />}</span>
          <TypeBadges species={sp.id} />
        </div>
      </Window>

      <div class="summary__page">
        {page === 0 && (
          <Window class="summary__box">
            <dl class="kv">
              <dt>{tr(L('N° Dex', 'Dex No.'))}</dt><dd>{dexNo(sp.id)}</dd>
              <dt>{tr(L('Espèce', 'Kind'))}</dt><dd>{tr(sp.kind)}</dd>
              <dt>{tr(L('Type', 'Type'))}</dt><dd><TypeBadges species={sp.id} /></dd>
              <dt>{tr(L('Nature', 'Nature'))}</dt><dd>{tr(nature(mon.nature).name)}</dd>
              <dt>{tr(L('Talent', 'Talent'))}</dt>
              <dd>
                {tr(talentOf(mon).name)}
                {mon.talent === 2 && <small class="summary__hidden" title={tr(L('Talent caché', 'Hidden talent'))}> ✦ {tr(L('caché', 'hidden'))}</small>}
              </dd>
              <dt>{tr(L('Objet tenu', 'Item'))}</dt>
              <dd class="summary__held">{mon.item ? <><PixelIcon id={mon.item} size={18} /> {tr(item(mon.item).name)}</> : tr(L('Aucun', 'None'))}</dd>
              {evolutionHints(sp).length > 0 && (
                <><dt>{tr(L('Évolution', 'Evolves'))}</dt><dd>{evolutionHints(sp).join(' · ')}</dd></>
              )}
              <dt>{tr(L('Amitié', 'Friendship'))}</dt><dd class="summary__hearts">{hearts(mon.friendship ?? 70)}</dd>
            </dl>
            {metLine(mon) && <p class="summary__met">{metLine(mon)}</p>}
            <p class="summary__talent"><b>{tr(talentOf(mon).name)}</b>{locale.value === 'fr' ? '\u00a0: ' : ': '}{tr(talentOf(mon).desc)}</p>
            <p class="summary__dex">{tr(sp.dex)}</p>
          </Window>
        )}
        {page === 1 && (
          <Window class="summary__box">
            <div class="summary__hp">
              <span class="hp-label">{tr(L('PV', 'HP'))}</span>
              <HpBar hp={mon.hp} max={maxHp(mon)} />
              <span>{mon.hp}/{maxHp(mon)}</span>
              <Grade mon={mon} k="hp" />
            </div>
            <dl class="kv kv--stats">
              {(['atk', 'def', 'spa', 'spd', 'spe'] as const).map((k) => (
                <><dt>{tr(STAT_NAMES[k])} <NatureMark mon={mon} k={k} /></dt><dd>{stats[k]} <Grade mon={mon} k={k} /></dd></>
              ))}
              <dt>{tr(L('Points Exp.', 'Exp. Points'))}</dt><dd>{mon.xp}</dd>
              <dt>{tr(L('Niveau suivant', 'Next Lv.'))}</dt><dd>{toNext || '—'}</dd>
            </dl>
            <div class="summary__xp"><span>EXP</span><XpBar pct={xpPct} /></div>
            <p class="summary__legend">
              {natureLabel(mon)}{nature(mon.nature).up ? ' ▲▼' : ''} · {tr(L('E → S : qualités de naissance', 'E → S: born qualities'))}
            </p>
          </Window>
        )}
        {page === 2 && (
          <>
            {learn && <p class="summary__hint">{tr(L('Quelle capacité oublier ?', 'Which move should be forgotten?'))}</p>}
            <Window class="summary__box summary__moves">
              <MenuList
                active={confirm === null}
                onCursor={(i) => setSel(i)}
                onCancel={() => (learn ? setConfirm(4) : onClose())}
                items={moves.map((id, i) => {
                  const mv = move(id);
                  const pp = i < mon.moves.length ? mon.moves[i].pp : mv.pp;
                  return {
                    label: <span class={`mvline ${learn && i === 4 ? 'is-new' : ''}`}><TypeBadge type={mv.type} /> {tr(mv.name)}</span>,
                    side: `PP ${pp}/${mv.pp}`,
                    onSelect: () => (learn ? setConfirm(i) : setSel(i)),
                  };
                })}
              />
            </Window>
            <Window class="summary__box summary__detail">
              {detail ? (
                <>
                  <p class="summary__stats">
                    {detail.cat === 'status' ? tr(L('Statut', 'Status')) : `${tr(L('Puissance', 'Power'))} ${detail.power}`}
                    {' · '}{tr(L('Précision', 'Accuracy'))} {detail.acc ?? '—'}
                  </p>
                  <p>{tr(detail.desc)}</p>
                </>
              ) : <p>{tr(L('Touche une capacité pour la décrire.', 'Tap a move to read about it.'))}</p>}
            </Window>
          </>
        )}
      </div>

      <div class="frame__foot summary__foot">
        <button class="pbtn pbtn--b" onClick={() => (learn ? setConfirm(4) : onClose())}>{tr(L('Retour', 'Back'))}</button>
      </div>

      {learn && confirm !== null && (
        <div class="view-modal">
          <Window seyes class="view-modal__text">
            {confirm === 4
              ? tr(L('Abandonner l’apprentissage de {m} ?', 'Stop learning {m}?'), { m: tr(move(learn.move).name) })
              : tr(L('Oublier {o} pour apprendre {m} ?', 'Forget {o} to learn {m}?'), { o: tr(move(moves[confirm]).name), m: tr(move(learn.move).name) })}
          </Window>
          <YesNo onAnswer={(yes) => {
            const c = confirm;
            setConfirm(null);
            if (yes) learn.onPick(c === 4 ? null : c);
          }} />
        </div>
      )}
    </div>
  );
}

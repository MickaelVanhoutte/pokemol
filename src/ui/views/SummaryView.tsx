import { useEffect, useRef, useState } from 'preact/hooks';
import { L, locale, tr } from '../../i18n';
import { creature, dexNo, monLabel } from '../../data/creatures';
import { monArtUrl } from '../monArt';
import { evolutionHints } from '../evolutionText';
import { move } from '../../data/moves';
import { STAT_NAMES, TYPES } from '../../data/types';
import { EV_STAT_MAX, EV_TOTAL_MAX, MAX_LEVEL, STAT_KEYS, maxHp, statsOf, xpAt, type Mon } from '../../engine/pk/creature';
import { HpBar, MenuList, MoveInfo, PixelIcon, StatusTag, TypeBadge, TypeBadges, Window, XpBar, YesNo, lv } from '../paper';
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
  trade: L('Échangé au N.{l} — {p} (de {o})', 'Traded at Lv{l} — {p} (from {o})'),
};

/** « Attrapé au N.5 — Chemin des Crayons » (nothing for Bestioles from older saves). */
function metLine(mon: Mon): string | null {
  if (!mon.met) return null;
  const place = MAPS[mon.met.map] ? tr(MAPS[mon.met.map].name) : '???';
  return tr(MET[mon.met.how], { l: mon.met.level, p: place, o: mon.ot ?? '?' });
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

/** Short stat names for the effort bars. */
const SHORT: Record<StatKey, ReturnType<typeof L>> = {
  hp: L('PV', 'HP'), atk: L('Att.', 'Atk'), def: L('Déf.', 'Def'), spa: L('A.Spé', 'SpA'), spd: L('D.Spé', 'SpD'), spe: L('Vit.', 'Spe'),
};

/** Effort points per stat as little crayon bars (from beaten Bestioles and biscuits). */
function Efforts({ mon }: { mon: Mon }) {
  const total = STAT_KEYS.reduce((n, k) => n + mon.evs[k], 0);
  return (
    <div class="efforts">
      <div class="efforts__head"><span>{tr(L('Efforts', 'Effort'))}</span><span>{total}/{EV_TOTAL_MAX}</span></div>
      <div class="efforts__grid">
        {STAT_KEYS.map((k) => (
          <div class="efforts__cell" title={tr(STAT_NAMES[k])}>
            <span>{tr(SHORT[k])}</span>
            <i class="efforts__bar"><i style={{ width: `${(mon.evs[k] / EV_STAT_MAX) * 100}%` }} /></i>
            <b>{mon.evs[k]}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/** « Nature rêveuse » / "Dreamy nature". */
const natureLabel = (mon: Mon) => {
  const name = tr(nature(mon.nature).name);
  return locale.value === 'fr' ? `Nature ${name.toLowerCase()}` : `${name} nature`;
};

interface Learn { move: string; onPick: (forget: number | null) => void }

/**
 * FRLG summary: INFOS / STATS / CAPACITÉS. With `learn`, it is the page to choose which move to forget for
 * the new one (`null` = give up the new move). With `onSwapMoves`, the moves can be put in another order
 * (DÉPLACER, then the row to swap with).
 */
export function SummaryView(props: {
  mon: Mon; onClose: () => void; learn?: Learn; onSwapMoves?: (a: number, b: number) => void;
  /** The ◀ ▶ arrows show the previous or next Bestiole (without it they turn the pages). */
  onMove?: (d: 1 | -1) => void;
}) {
  if (props.mon.egg) return <EggSummary mon={props.mon} onClose={props.onClose} />;
  return props.learn ? <LearnMoves mon={props.mon} learn={props.learn} /> : <SummaryMain {...props} />;
}

/**
 * A Bestiole that knows four moves learning a fifth. Landscape: the new move with the known move being read
 * under it on the left, the list of known moves and the two choices on the right; portrait stacks them. A tap
 * on a known move only reads it, so both can be compared; the button under the list (or A) asks to forget it.
 */
function LearnMoves({ mon, learn }: { mon: Mon; learn: Learn }) {
  const [sel, setSel] = useState(0);
  // the move to forget being confirmed, or 'skip' to give up the new one
  const [confirm, setConfirm] = useState<number | 'skip' | null>(null);
  const name = (id: string) => tr(move(id).name);
  const old = mon.moves[sel];
  // portrait: a move picked in the list shows below it, with the choices: bring them into view
  const acts = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) first.current = false;
    else acts.current?.scrollIntoView?.({ block: 'nearest' });
  }, [sel]);
  return (
    <div class="frame graph learnmv">
      <div class="learnmv__side">
        <p class="summary__hint learnmv__label">{tr(L('Nouvelle capacité', 'New move'))}</p>
        <Window class="summary__box summary__detail learnmv__new"><MoveInfo id={learn.move} /></Window>
        {old && <Window class="summary__box summary__detail learnmv__old"><MoveInfo id={old.id} pp={old.pp} /></Window>}
      </div>
      <div class="learnmv__side">
        <p class="summary__hint learnmv__ask">{tr(L('{n} : quelle capacité oublier ?', '{n}: which move should be forgotten?'), { n: monLabel(mon) })}</p>
        <Window class="summary__box summary__moves learnmv__list">
          <MenuList
            active={confirm === null}
            tapReads
            onCursor={setSel}
            onCancel={() => setConfirm('skip')}
            items={mon.moves.map((m, i) => ({
              label: <span class="mvline"><TypeBadge type={move(m.id).type} /> {name(m.id)}</span>,
              side: `PP ${m.pp}/${move(m.id).pp}`,
              onSelect: () => setConfirm(i),
            }))}
          />
        </Window>
        <div class="learnmv__acts" ref={acts}>
          {old && <button class="pbtn pbtn--accent" onClick={() => setConfirm(sel)}>{tr(L('Oublier {m}', 'Forget {m}'), { m: name(old.id) })}</button>}
          <button class="pbtn" onClick={() => setConfirm('skip')}>{tr(L('Ne pas l’apprendre', 'Don’t learn it'))}</button>
        </div>
      </div>

      {confirm !== null && (
        <div class="view-modal">
          <Window seyes class="view-modal__text">
            {confirm === 'skip'
              ? tr(L('Abandonner l’apprentissage de {m} ?', 'Stop learning {m}?'), { m: name(learn.move) })
              : tr(L('Oublier {o} pour apprendre {m} ?', 'Forget {o} to learn {m}?'), { o: name(mon.moves[confirm].id), m: name(learn.move) })}
          </Window>
          <YesNo onAnswer={(yes) => {
            const c = confirm;
            setConfirm(null);
            if (yes) learn.onPick(c === 'skip' ? null : c);
          }} />
        </div>
      )}
    </div>
  );
}

/** An egg: its drawing and a hint of how soon it hatches. */
function EggSummary({ mon, onClose }: { mon: Mon; onClose: () => void }) {
  useMenuNav(0, { onSelect: () => undefined, onCancel: onClose });
  const steps = mon.egg?.steps ?? 0;
  const hint = steps > 500 ? L('Il ne bouge pas encore. Il faudra marcher longtemps…', 'It doesn’t move yet. You’ll have to walk a long way…')
    : steps > 150 ? L('Il bouge un peu de temps en temps. Ça avance !', 'It moves a little now and then. Getting there!')
    : L('Il bouge beaucoup ! Il va bientôt éclore !', 'It moves a lot! It will hatch soon!');
  return (
    <div class="frame graph summary">
      <Window class="summary__head">
        <div class="summary__art"><img class="mon-art" src={monArtUrl(mon)} alt="" /></div>
        <div class="summary__id"><b class="summary__name">{monLabel(mon)}</b></div>
      </Window>
      <Window seyes class="summary__box"><p>{tr(hint)}</p></Window>
      <div class="frame__foot summary__foot">
        <button class="pbtn pbtn--b" onClick={onClose}>{tr(L('Retour', 'Back'))}</button>
      </div>
    </div>
  );
}

/** Index of the previous or next Bestiole of a list for the summary arrows, skipping eggs. */
export function nextMon(list: Mon[], i: number, d: 1 | -1): number {
  for (let k = 1; k < list.length; k++) {
    const j = (i + d * k + list.length * k) % list.length;
    if (!list[j].egg) return j;
  }
  return i;
}

function SummaryMain({ mon, onClose, onSwapMoves, onMove }: {
  mon: Mon; onClose: () => void; onSwapMoves?: (a: number, b: number) => void; onMove?: (d: 1 | -1) => void;
}) {
  const [page, setPage] = useState<Page>(0);
  const [sel, setSel] = useState<number | null>(null);
  // the move being moved: the next row picked takes its place
  const [moving, setMoving] = useState<number | null>(null);
  const pickMove = (i: number) => {
    if (moving !== null) {
      if (i !== moving) onSwapMoves?.(moving, i);
      setMoving(null);
    }
    setSel(i);
  };
  const back = () => (moving !== null ? setMoving(null) : onClose());
  const sp = creature(mon.species);
  const color = TYPES[sp.type].color;
  const turn = (d: 1 | -1) => setPage((p) => (((p + d + 3) % 3) as Page));
  const arrow = (d: 1 | -1) => (onMove ? onMove(d) : turn(d));
  // another Bestiole: same page, nothing selected
  useEffect(() => {
    setSel(null);
    setMoving(null);
  }, [mon.uid]);
  useEffect(() => {
    if (!onMove) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      onMove(e.key === 'ArrowLeft' ? -1 : 1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onMove]);
  useMenuNav(0, { onSelect: () => undefined, onCancel: back });
  // swipe between pages
  let x0 = 0;
  const down = (e: PointerEvent) => (x0 = e.clientX);
  const up = (e: PointerEvent) => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1);
  };
  const moves = mon.moves.map((m) => m.id);
  // on a small phone the details sit below the list: bring them into view when a move is picked
  const detailBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sel !== null && page === 2) detailBox.current?.scrollIntoView?.({ block: 'nearest' });
  }, [sel, page]);
  const detail = sel !== null ? move(moves[sel]) : null;
  const stats = statsOf(mon);
  const toNext = mon.level >= MAX_LEVEL ? 0 : xpAt(mon.level + 1) - mon.xp;
  const xpPct = mon.level >= MAX_LEVEL ? 100 : ((mon.xp - xpAt(mon.level)) / (xpAt(mon.level + 1) - xpAt(mon.level))) * 100;

  return (
    <div class="frame graph summary" style={{ '--type': color, '--th': `var(--hatch-t-${sp.type})` }} onPointerDown={down} onPointerUp={up}>
      <div class="summary__tabs">
        <button class="pbtn" onClick={() => arrow(-1)} aria-label="◀">◀</button>
        <div class="summary__tabnames">
          {PAGES.map((p, i) => <button class={`summary__tab ${i === page ? 'is-on' : ''}`} onClick={() => setPage(i as Page)}>{tr(p)}</button>)}
        </div>
        <button class="pbtn" onClick={() => arrow(1)} aria-label="▶">▶</button>
      </div>
      <Window class="summary__head">
        <div class="summary__art"><img class="mon-art" src={monArtUrl(mon)} alt="" /></div>
        <div class="summary__id">
          <b class="summary__name">{monLabel(mon)}{mon.shiny && <i class="shiny-mark" title={tr(L('Bestiole pailletée', 'Sparkly Critter'))}> ✦</i>}</b>
          {mon.nickname && <small class="summary__species">{tr(sp.name)}</small>}
          <span class="summary__lvl">{lv(mon.level)} {mon.status && <StatusTag s={mon.status} />} <TypeBadges species={sp.id} /></span>
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
            <Efforts mon={mon} />
            <p class="summary__legend">
              {natureLabel(mon)}{nature(mon.nature).up ? ' ▲▼' : ''} · {tr(L('E → S : qualités de naissance', 'E → S: born qualities'))} · {tr(L('efforts : combats et biscuits', 'effort: battles and biscuits'))}
            </p>
          </Window>
        )}
        {page === 2 && (
          <>
            {moving !== null && <p class="summary__hint">{tr(L('Où mettre {m} ?', 'Where should {m} go?'), { m: tr(move(moves[moving]).name) })}</p>}
            <Window class="summary__box summary__moves">
              <MenuList
                onCursor={(i) => setSel(i)}
                onCancel={back}
                items={moves.map((id, i) => {
                  const mv = move(id);
                  return {
                    label: <span class={`mvline ${i === moving ? 'is-moving' : ''}`}><TypeBadge type={mv.type} /> {tr(mv.name)}</span>,
                    side: `PP ${mon.moves[i].pp}/${mv.pp}`,
                    onSelect: () => pickMove(i),
                  };
                })}
              />
            </Window>
            <Window class="summary__box summary__detail">
              {detail && sel !== null ? (
                <>
                  <MoveInfo id={moves[sel]} pp={mon.moves[sel].pp} />
                  {onSwapMoves && moving === null && mon.moves.length > 1 && (
                    <button class="pbtn summary__move-btn" onClick={() => setMoving(sel)}>{tr(L('Déplacer', 'Move'))}</button>
                  )}
                </>
              ) : <p>{tr(L('Touche une capacité pour la décrire.', 'Tap a move to read about it.'))}</p>}
            </Window>
            <div ref={detailBox} />
          </>
        )}
      </div>

      <div class="frame__foot summary__foot">
        <button class="pbtn pbtn--b" onClick={back}>{tr(L('Retour', 'Back'))}</button>
      </div>

    </div>
  );
}

/**
 * The small moments of the GBA games, drawn on paper: a badge handed over (it spins in among rays and sparkles),
 * an item received (its icon big over the world while the line is said), and the Bestiodex page of a species caught
 * for the first time (the page slides in, « Enregistré ! » is stamped on it). MOUVEMENTS : DOUX keeps fades only.
 */
import { useEffect, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { badgeDef } from '../../data/badges';
import { TYPES } from '../../data/types';
import { artUrl, creature, dexNo } from '../../data/creatures';
import { iconUrl } from '../icons';
import { TypeBadges, Window } from '../paper';
import { useMenuNav } from '../paper/nav';
import { sfx } from '../../audio/sfx';
import './moments.css';

/** Before a press can close the badge (the badge has spun in) and the Bestiodex page (it is stamped), ms. */
export const BADGE_READY_MS = 1300;
export const STAMP_MS = 750;
export const DEX_READY_MS = 1200;

/** Calls `fn` after `ms`, once (cleared when the view goes). */
function useAfter(ms: number, fn: () => void) {
  useEffect(() => {
    const t = setTimeout(fn, ms);
    return () => clearTimeout(t);
  }, []);
}

/** A little four-pointed sparkle, drawn in CSS (`--x`, `--y` its place, `--d` its delay). */
const Sparkle = ({ x, y, d, s = 1 }: { x: number; y: number; d: number; s?: number }) => (
  <span class="moment__spark" style={{ '--x': `${x}%`, '--y': `${y}%`, '--d': `${d}ms`, '--s': s }} />
);

const SPARKS: [number, number, number, number][] = [
  [14, 22, 900, 1], [84, 18, 1050, 0.8], [8, 62, 1200, 0.7], [90, 58, 1000, 1.1], [26, 86, 1300, 0.8], [74, 88, 1150, 0.9], [50, 4, 950, 0.7], [50, 98, 1250, 0.6],
];

/** A badge handed over by an Atelier Master: « {name} reçoit le Badge … de … ! ». */
export function BadgeGetView({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const def = badgeDef(id);
  const [ready, setReady] = useState(false);
  useAfter(BADGE_READY_MS, () => {
    setReady(true);
    sfx.sparkle();
  });
  const close = () => ready && onClose();
  useMenuNav(1, { onSelect: close, onCancel: close });
  if (!def) return null;
  const line = tr(L('{name} reçoit le {b} de {l} !', '{name} received the {b} from {l}!'), { name, b: tr(def.name), l: tr(def.leader) });
  return (
    <div class="moment moment--badge" style={{ '--b': def.color }} onClick={close}>
      <div class="moment__stage">
        <div class="moment__rays" aria-hidden="true" />
        <div class="badgeget">
          <span class="badgeget__sticker">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={TYPES[def.type].icon} fill="#fff" /></svg>
            <span class="badgeget__shine" aria-hidden="true" />
          </span>
        </div>
        {SPARKS.map(([x, y, d, s]) => <Sparkle key={`${x}-${y}`} x={x} y={y} d={d} s={s} />)}
      </div>
      <Window class="moment__caption">{line}</Window>
      <button class={`pbtn pbtn--accent moment__ok${ready ? '' : ' is-waiting'}`} onClick={(e) => { e.stopPropagation(); close(); }}>OK ▶</button>
    </div>
  );
}

/** The item just received, big over the world while its line is said (no input of its own). */
export function ItemGet({ id }: { id: string }) {
  return (
    <div class="itemget" aria-hidden="true">
      <div class="itemget__rays" />
      <Window class="itemget__box">
        <img class="itemget__icon" src={iconUrl(id)} alt="" />
      </Window>
    </div>
  );
}

/** The Bestiodex page of a species just caught for the first time, stamped « Enregistré ! ». */
export function DexPageView({ species, onClose }: { species: string; onClose: () => void }) {
  const sp = creature(species);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    sfx.page();
    const stamp = setTimeout(() => sfx.stamp(), STAMP_MS);
    const done = setTimeout(() => setReady(true), DEX_READY_MS);
    return () => {
      clearTimeout(stamp);
      clearTimeout(done);
    };
  }, []);
  const close = () => ready && onClose();
  useMenuNav(1, { onSelect: close, onCancel: close });
  return (
    <div class="moment moment--dex" onClick={close}>
      <div class="dexpage">
        <p class="dexpage__title">{tr(L('Bestiodex', 'Critterdex'))} · N°{dexNo(sp.id)}</p>
        <Window class="dex__entry dexpage__entry">
          <div class="dex__paper">
            <img class="mon-art" src={artUrl(sp)} alt="" />
            <span class="dexpage__stamp" aria-hidden="true">{tr(L('Enregistré !', 'Registered!'))}</span>
          </div>
          <div class="dex__facts">
            <b class="dex__name">{tr(sp.name)}</b>
            <span>{tr(sp.kind)}</span>
            <TypeBadges species={sp.id} />
          </div>
        </Window>
        <Window seyes class="dex__text dexpage__text">
          <p>{tr(sp.dex)}</p>
        </Window>
      </div>
      <button class={`pbtn pbtn--accent moment__ok${ready ? '' : ' is-waiting'}`} onClick={(e) => { e.stopPropagation(); close(); }}>OK ▶</button>
    </div>
  );
}

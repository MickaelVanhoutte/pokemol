import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { L, locale, tr } from '../../i18n';
import { BADGES } from '../../data/badges';
import { MAPS } from '../../data/maps';
import { TOWNS, WORLD, placeOf, playerSpot, townOfTrainer } from '../../data/worldmap';
import { currentObjective, leaderOf } from '../../story/objective';
import type { SaveData } from '../../save/schema';
import { Frame, Window } from '../paper';
import { VIEW, paintTownMap } from './townMapArt';
import './views.css';

/** Places the cursor can stop on (other floors of a dungeon are part of its first floor). */
const PLACES = Object.keys(WORLD).filter((id) => !WORLD[id].of);
/** The towns the Pencil Balloon flies to. */
const FLY = TOWNS.map((t) => t.map);
const centre = (id: string) => {
  const r = WORLD[id].rects[0];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
const BADGE_OF_TOWN = Object.fromEntries(BADGES.map((b) => [townOfTrainer(leaderOf(b.id).id), b]));
/** What the Inn's helpers of a town do (« Surnoms », « Natures »…). */
const innServices = (town: string) => (MAPS.centre.npcs ?? []).filter((n) => n.service && n.fromMap?.includes(town)).map((n) => tr(n.service!));
/** Position on the drawn part of the map, in %. */
const px = (v: number) => `${((v - VIEW.x) / VIEW.w) * 100}%`;
const py = (v: number) => `${((v - VIEW.y) / VIEW.h) * 100}%`;

/** The Pencil Balloon, as drawn over the Town Map (its trip, and the towns it can fly to). */
export function BalloonIcon({ class: cls, style }: { class: string; style?: Record<string, string> }) {
  return (
    <svg class={cls} style={style} viewBox="0 0 40 56" aria-hidden="true">
      <path d="M20 3c9 0 16 7 16 16 0 8-6 13-10 17h-12C10 32 4 27 4 19 4 10 11 3 20 3z" fill="#f2c14e" stroke="#2a2238" stroke-width="2" />
      <path d="M14 5c-4 5-5 14 0 31M26 5c4 5 5 14 0 31" fill="none" stroke="#2a2238" stroke-width="1.4" />
      <path d="M14 5c-4 5-5 14 0 31L14 36C10 32 4 27 4 19 4 12 8 7 14 5z" fill="#e0453a" />
      <path d="M26 5c4 5 5 14 0 31L26 36c4-4 10-9 10-17 0-7-4-12-10-14z" fill="#5b8ad6" />
      <path d="M14 36 15 44M26 36 25 44" stroke="#2a2238" stroke-width="1.4" />
      <rect x="13" y="44" width="14" height="9" rx="1.5" fill="#b07a45" stroke="#2a2238" stroke-width="2" />
      <path d="M9 13c1-3 3-5 5-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

/** The Pencil Balloon's pilot asks where to: `here` is the town it is moored in. */
export interface BalloonPick {
  here: string;
  onPick: (town: string) => void;
}

/**
 * FRLG Town Map on a sheet of paper: the player's head blinks where they are, a pencil star marks
 * the next objective (written on top), and the cursor (arrows or a tap) names every place.
 * With `pick`, it is the Pencil Balloon's map: the cursor goes from town to town, a little balloon marks each one
 * it can fly to (the towns not visited yet stay grey), and A or a second tap takes off.
 */
export function TownMapView({ save, avatar, onClose, pick }: { save: SaveData; avatar: string; onClose: () => void; pick?: BalloonPick }) {
  const visited = (id: string) => id === 'bourg' || !!save.flags[`visit:${id}`];
  const art = useMemo(() => paintTownMap(visited, !!save.bag['carte-fonds']), [save.flags, save.bag]);
  const me = playerSpot(save.player);
  const goal = currentObjective(save);
  const places = pick ? FLY : PLACES;
  const canFly = (id: string) => !!pick && FLY.includes(id) && visited(id) && id !== pick.here;
  const [cursor, setCursor] = useState(pick ? pick.here : me ? placeOf(me.place) : 'bourg');
  const at = useRef(cursor);
  at.current = cursor;

  const step = (dx: number, dy: number) => setCursor((cur) => {
    const a = centre(cur);
    let best = cur, bestScore = Infinity;
    for (const id of places) {
      const b = centre(id);
      const along = (b.x - a.x) * dx + (b.y - a.y) * dy;
      if (id === cur || along <= 0) continue;
      const across = Math.abs((b.x - a.x) * dy) + Math.abs((b.y - a.y) * dx);
      const score = along + across * 2;
      if (score < bestScore) [best, bestScore] = [id, score];
    }
    return best;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = ({ ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] } as Record<string, number[]>)[e.key];
      if (pick && ['Enter', ' ', 'z', 'Z'].includes(e.key)) {
        e.preventDefault();
        if (canFly(at.current)) pick.onPick(at.current);
        return;
      }
      if (!d) return;
      e.preventDefault();
      step(d[0], d[1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tap = (e: MouseEvent) => {
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = VIEW.x + ((e.clientX - box.left) / box.width) * VIEW.w, y = VIEW.y + ((e.clientY - box.top) / box.height) * VIEW.h;
    let best: string | null = null, bestD = 2.5;
    for (const id of places) {
      for (const r of WORLD[id].rects) {
        const dx = Math.max(r.x - x, 0, x - (r.x + r.w)), dy = Math.max(r.y - y, 0, y - (r.y + r.h));
        const d = Math.hypot(dx, dy);
        if (d < bestD) [best, bestD] = [id, d];
      }
    }
    if (!best) return;
    // the balloon's map: a second tap on a town takes off
    if (pick && best === cursor && canFly(best)) pick.onPick(best);
    else setCursor(best);
  };

  const target = goal ? placeOf(goal.target) : null;
  const gc = goal ? centre(goal.target) : null;
  const rects = WORLD[cursor].rects;
  const bx = Math.min(...rects.map((r) => r.x)), by = Math.min(...rects.map((r) => r.y));
  const bw = Math.max(...rects.map((r) => r.x + r.w)) - bx, bh = Math.max(...rects.map((r) => r.y + r.h)) - by;
  const badge = BADGE_OF_TOWN[cursor];
  const notes = pick ? [
    cursor === pick.here ? tr(L('Tu es ici !', 'You are here!')) : !visited(cursor) ? tr(L('Pas encore visité', 'Not visited yet')) : '',
  ].filter(Boolean) : [
    me && placeOf(me.place) === cursor ? tr(L('Tu es ici !', 'You are here!')) : '',
    cursor === target ? tr(L('★ Ton objectif', '★ Your goal')) : '',
    WORLD[cursor].kind === 'town' && cursor !== 'bordPage' && !visited(cursor) ? tr(L('Pas encore visité', 'Not visited yet')) : '',
    badge ? `${tr(badge.name)} ${save.badges.includes(badge.id) ? '✓' : '—'}` : '',
    visited(cursor) && innServices(cursor).length ? `${tr(L('Auberge', 'Inn'))}${locale.value === 'fr' ? '\u00a0: ' : ': '}${innServices(cursor).join(', ')}` : '',
  ].filter(Boolean);

  return (
    <Frame title={pick ? tr(L('Ballon-Crayon', 'Pencil Balloon')) : tr(L('Carte', 'Map'))} onBack={onClose} class="tmap">
      <Window seyes class="tmap__goal-text">
        {pick
          ? tr(L('Où veux-tu aller ? Touche une ville au petit ballon.', 'Where to? Tap a town with a little balloon.'))
          : <><b>{tr(L('Objectif', 'Next'))} :</b> {goal ? tr(goal.text, goal.vars?.(save)) : tr(L('Tout est fini ! Tu es un vrai artiste de Papeterre.', 'All done! You’re a true artist of Papeterra.'))}</>}
      </Window>
      <div class="tmap__sheet">
        <div class="tmap__map" style={{ '--ratio': VIEW.w / VIEW.h }} onClick={tap}>
          <img class="tmap__art" src={art} alt="" />
          <span class="tmap__cursor" style={{ left: px(bx), top: py(by), width: `${(bw / VIEW.w) * 100}%`, height: `${(bh / VIEW.h) * 100}%` }} />
          {!pick && gc && <span class="tmap__star" style={{ left: px(gc.x), top: py(gc.y) }} aria-label="★">★</span>}
          {pick && FLY.filter(canFly).map((id) => {
            const c = centre(id);
            return <BalloonIcon class="tmap__fly" style={{ left: px(c.x), top: py(c.y) }} />;
          })}
          {me && <img class="tmap__me picon" src={avatar} alt="" style={{ left: px(me.x), top: py(me.y) }} />}
        </div>
      </div>
      <Window class="tmap__info">
        <b>{tr(MAPS[cursor].name)}</b>
        {notes.map((n) => <span>{n}</span>)}
        {pick && (
          <button class="pbtn pbtn--accent tmap__go" disabled={!canFly(cursor)} onClick={() => pick.onPick(cursor)}>
            {tr(L('Décoller !', 'Lift off!'))}
          </button>
        )}
      </Window>
    </Frame>
  );
}

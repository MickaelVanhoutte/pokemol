import { useEffect, useMemo, useState } from 'preact/hooks';
import { L, locale, tr } from '../../i18n';
import { BADGES } from '../../data/badges';
import { MAPS } from '../../data/maps';
import { WORLD, placeOf, playerSpot, townOfTrainer } from '../../data/worldmap';
import { currentObjective, leaderOf } from '../../story/objective';
import type { SaveData } from '../../save/schema';
import { Frame, Window } from '../paper';
import { VIEW, paintTownMap } from './townMapArt';
import './views.css';

/** Places the cursor can stop on (other floors of a dungeon are part of its first floor). */
const PLACES = Object.keys(WORLD).filter((id) => !WORLD[id].of);
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

/**
 * FRLG Town Map on a sheet of paper: the player's head blinks where they are, a pencil star marks
 * the next objective (written on top), and the cursor (arrows or a tap) names every place.
 */
export function TownMapView({ save, avatar, onClose }: { save: SaveData; avatar: string; onClose: () => void }) {
  const visited = (id: string) => id === 'bourg' || !!save.flags[`visit:${id}`];
  const art = useMemo(() => paintTownMap(visited), [save.flags]);
  const me = playerSpot(save.player);
  const goal = currentObjective(save);
  const [cursor, setCursor] = useState(me ? placeOf(me.place) : 'bourg');

  const step = (dx: number, dy: number) => setCursor((cur) => {
    const a = centre(cur);
    let best = cur, bestScore = Infinity;
    for (const id of PLACES) {
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
    for (const id of PLACES) {
      for (const r of WORLD[id].rects) {
        const dx = Math.max(r.x - x, 0, x - (r.x + r.w)), dy = Math.max(r.y - y, 0, y - (r.y + r.h));
        const d = Math.hypot(dx, dy);
        if (d < bestD) [best, bestD] = [id, d];
      }
    }
    if (best) setCursor(best);
  };

  const target = goal ? placeOf(goal.target) : null;
  const gc = goal ? centre(goal.target) : null;
  const rects = WORLD[cursor].rects;
  const bx = Math.min(...rects.map((r) => r.x)), by = Math.min(...rects.map((r) => r.y));
  const bw = Math.max(...rects.map((r) => r.x + r.w)) - bx, bh = Math.max(...rects.map((r) => r.y + r.h)) - by;
  const badge = BADGE_OF_TOWN[cursor];
  const notes = [
    me && placeOf(me.place) === cursor ? tr(L('Tu es ici !', 'You are here!')) : '',
    cursor === target ? tr(L('★ Ton objectif', '★ Your goal')) : '',
    WORLD[cursor].kind === 'town' && cursor !== 'bordPage' && !visited(cursor) ? tr(L('Pas encore visité', 'Not visited yet')) : '',
    badge ? `${tr(badge.name)} ${save.badges.includes(badge.id) ? '✓' : '—'}` : '',
    visited(cursor) && innServices(cursor).length ? `${tr(L('Auberge', 'Inn'))}${locale.value === 'fr' ? '\u00a0: ' : ': '}${innServices(cursor).join(', ')}` : '',
  ].filter(Boolean);

  return (
    <Frame title={tr(L('Carte', 'Map'))} onBack={onClose} class="tmap">
      <Window seyes class="tmap__goal-text">
        <b>{tr(L('Objectif', 'Next'))} :</b> {goal ? tr(goal.text, goal.vars?.(save)) : tr(L('Tout est fini ! Tu es un vrai artiste de Papeterre.', 'All done! You’re a true artist of Papeterra.'))}
      </Window>
      <div class="tmap__sheet">
        <div class="tmap__map" style={{ '--ratio': VIEW.w / VIEW.h }} onClick={tap}>
          <img class="tmap__art" src={art} alt="" />
          <span class="tmap__cursor" style={{ left: px(bx), top: py(by), width: `${(bw / VIEW.w) * 100}%`, height: `${(bh / VIEW.h) * 100}%` }} />
          {gc && <span class="tmap__star" style={{ left: px(gc.x), top: py(gc.y) }} aria-label="★">★</span>}
          {me && <img class="tmap__me picon" src={avatar} alt="" style={{ left: px(me.x), top: py(me.y) }} />}
        </div>
      </div>
      <Window class="tmap__info">
        <b>{tr(MAPS[cursor].name)}</b>
        {notes.map((n) => <span>{n}</span>)}
      </Window>
    </Frame>
  );
}

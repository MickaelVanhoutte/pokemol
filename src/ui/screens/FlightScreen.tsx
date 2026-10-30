import { useEffect, useMemo, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { MAPS } from '../../data/maps';
import { WORLD } from '../../data/worldmap';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { VIEW, paintTownMap } from '../views/townMapArt';
import '../views/views.css';

const centre = (id: string) => {
  const r = WORLD[id].rects[0];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
};
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * The Pencil Balloon's trip (`scripts.balloon`): over the Town Map, the little balloon drifts from one town to the
 * other on an arc, a pencil trail of dots behind it, then lands. A tap skips it.
 */
export function FlightScreen({ from, to }: { from: string; to: string }) {
  const d = save.value!;
  const art = useMemo(() => paintTownMap((id) => id === 'bourg' || !!d.flags[`visit:${id}`], !!d.bag['carte-fonds']), []);
  const a = centre(from), b = centre(to);
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const ms = Math.min(3600, 1600 + dist * 120);
  // the arc's peak: above the straight line, higher for a longer trip
  const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 1.5 - dist * 0.15 };
  const at = (t: number) => ({
    x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
    y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
  });
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0, left = false;
    const end = () => { if (!left) { left = true; backToWorld(); } };
    const tick = () => {
      const u = Math.min(1, (performance.now() - start) / ms);
      setT(u);
      if (u < 1) raf = requestAnimationFrame(tick);
      else setTimeout(end, 350);
    };
    raf = requestAnimationFrame(tick);
    // the page hidden: frames stop, the trip still ends
    const safety = setTimeout(end, ms + 1500);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, []);
  const pos = at(ease(t));
  const px = (v: number) => `${((v - VIEW.x) / VIEW.w) * 100}%`;
  const py = (v: number) => `${((v - VIEW.y) / VIEW.h) * 100}%`;
  const dots = Array.from({ length: 14 }, (_, i) => (i + 1) / 15).filter((u) => u < ease(t) - 0.03).map((u) => at(u));
  return (
    <div class="flight" onClick={() => t > 0.15 && backToWorld()}>
      <p class="flight__where">{tr(L('En route pour {town} !', 'Off to {town}!'), { town: tr(MAPS[to].name) })}</p>
      <div class="flight__map" style={{ '--ratio': VIEW.w / VIEW.h }}>
        <img class="tmap__art" src={art} alt="" />
        {dots.map((p) => <span class="flight__dot" style={{ left: px(p.x), top: py(p.y) }} />)}
        <svg class="flight__balloon" style={{ left: px(pos.x), top: py(pos.y), transform: `translate(-50%, -85%) rotate(${Math.sin(t * 18) * 6}deg)` }} viewBox="0 0 40 56" aria-hidden="true">
          <path d="M20 3c9 0 16 7 16 16 0 8-6 13-10 17h-12C10 32 4 27 4 19 4 10 11 3 20 3z" fill="#f2c14e" stroke="#2a2238" stroke-width="2" />
          <path d="M14 5c-4 5-5 14 0 31M26 5c4 5 5 14 0 31" fill="none" stroke="#2a2238" stroke-width="1.4" />
          <path d="M14 5c-4 5-5 14 0 31L14 36C10 32 4 27 4 19 4 12 8 7 14 5z" fill="#e0453a" />
          <path d="M26 5c4 5 5 14 0 31L26 36c4-4 10-9 10-17 0-7-4-12-10-14z" fill="#5b8ad6" />
          <path d="M14 36 15 44M26 36 25 44" stroke="#2a2238" stroke-width="1.4" />
          <rect x="13" y="44" width="14" height="9" rx="1.5" fill="#b07a45" stroke="#2a2238" stroke-width="2" />
          <path d="M9 13c1-3 3-5 5-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </div>
  );
}

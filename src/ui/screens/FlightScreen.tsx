import { useEffect, useMemo, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { MAPS } from '../../data/maps';
import { WORLD } from '../../data/worldmap';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { VIEW, paintTownMap } from '../views/townMapArt';
import { BalloonIcon } from '../views/TownMapView';
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
        <BalloonIcon class="flight__balloon" style={{ left: px(pos.x), top: py(pos.y), transform: `translate(-50%, -85%) rotate(${Math.sin(t * 18) * 6}deg)` }} />
      </div>
    </div>
  );
}

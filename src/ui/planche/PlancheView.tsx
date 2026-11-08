import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { tr } from '../../i18n';
import { sceneNow } from '../../anim/sceneClock';
import { calmMotion } from '../../anim/calm';
import { playSound, sfx } from '../../audio/sfx';
import { beatAt, nextStop, plancheOverlay, PLANCHE_OUT_MS, scratchAt, soundsBetween, type Kit } from './planche';
import './planche.css';

/** Frames drawn at most every this many ms (30 a second: the planches have blurs and masks). */
const FRAME_MS = 30;

/**
 * The planche playing (`plancheOverlay`), over the world: its canvas redrawn from scene time, its caption, and a
 * press (A, a tap) jumping to the next beat. Holding B hurries it like any scene.
 */
export function PlancheView() {
  const run = plancheOverlay.value!;
  const p = run.planche;
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [beat, setBeat] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const live = useRef({ run, t: 0, skip: 0, jumped: false, ended: false, gone: false, waiting: false });
  live.current.run = run;

  const leave = () => {
    const s = live.current;
    if (s.gone) return;
    s.gone = true;
    setLeaving(true);
    setTimeout(() => {
      const r = live.current.run;
      if (plancheOverlay.peek()?.planche === p) plancheOverlay.value = null;
      if (r.keep) r.closed?.();
      else r.reached();
    }, PLANCHE_OUT_MS);
  };

  const press = () => {
    const s = live.current;
    if (s.gone) return;
    if (s.t < p.ms) {
      // to the next beat (its sounds on the way are skipped)
      s.skip += nextStop(p, s.t) - s.t;
      s.jumped = true;
    } else if (s.waiting) {
      leave();
    }
  };

  useLayoutEffect(() => {
    const cv = canvas.current!, el = host.current!;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    const size = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const scratch: HTMLCanvasElement[] = [];
    const imgs: Record<string, HTMLImageElement> = {};
    const kit: Kit = {
      img: (name) => imgs[name],
      scratch: (i, sw, sh) => {
        const c = (scratch[i] ??= document.createElement('canvas'));
        if (c.width !== sw || c.height !== sh) {
          c.width = sw;
          c.height = sh;
        } else {
          c.getContext('2d')!.clearRect(0, 0, sw, sh);
        }
        return c;
      },
      calm: calmMotion(),
    };
    const s = live.current;
    let raf = 0, start = 0, prev = 0, lastDraw = -Infinity, lastScratch = 0, lastBeat = -1, ready = false;
    const paint = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      p.draw(ctx, t, w, h, kit);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (p.veil) {
        const v = p.veil(t);
        el.style.setProperty('backdrop-filter', v);
        el.style.setProperty('-webkit-backdrop-filter', v);
      }
    };
    const frame = (real: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready) return;
      const t = sceneNow() - start + s.skip;
      if (s.jumped) s.jumped = false;
      else for (const id of soundsBetween(p, prev, t)) playSound(id);
      prev = t;
      s.t = t;
      const scratching = scratchAt(p, t);
      if (scratching && real - lastScratch > (scratching === 'rub' ? 230 : 120 + Math.random() * 90)) {
        if (scratching === 'rub') sfx.rub();
        else sfx.pencil(0.8);
        lastScratch = real;
      }
      const b = beatAt(p, t);
      if (b !== lastBeat) {
        lastBeat = b;
        setBeat(b);
      }
      if (t >= p.ms && !s.ended) {
        s.ended = true;
        if (live.current.run.keep) live.current.run.reached();
        else if (p.end === 'auto') leave();
        else {
          s.waiting = true;
          setWaiting(true);
        }
      }
      if (real - lastDraw < FRAME_MS) return;
      lastDraw = real;
      paint(t);
    };
    // the pictures first (data URLs: quick), then the clock starts
    const srcs = p.images?.() ?? {};
    const loads = Object.entries(srcs).map(([name, src]) => {
      const im = new Image();
      im.src = src;
      imgs[name] = im;
      return im.decode().catch(() => undefined);
    });
    const begin = () => {
      start = sceneNow();
      ready = true;
      paint(0);
    };
    if (loads.length === 0) begin();
    else void Promise.all(loads).then(begin);
    raf = requestAnimationFrame(frame);
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const a = e.key === 'z' || e.key === 'Z' || e.key === 'Enter' || e.key === ' ';
      const b = e.key === 'x' || e.key === 'X';
      // B hurries while it plays; at the end it closes, like A
      if (a || (b && live.current.waiting)) {
        if (live.current.ended && live.current.run.keep) return;
        e.preventDefault();
        press();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      for (const c of scratch) c.width = 0;
      cv.width = 0;
    };
  }, []);

  // a kept planche goes when the script is done with it
  useEffect(() => {
    if (run.closing) leave();
  }, [run.closing]);

  const caption = p.beats[beat]?.caption;
  return (
    <div
      ref={host}
      class={`planche${p.veil ? ' is-see' : ''}${leaving ? ' is-leaving' : ''}`}
      style={{ transitionDuration: `${PLANCHE_OUT_MS}ms` }}
      onClick={() => {
        if (!(live.current.ended && run.keep)) press();
      }}
    >
      <canvas ref={canvas} class="planche__canvas" aria-hidden="true" />
      {caption && !(run.keep && live.current.ended) && (
        <div class="planche__cap">
          <p key={beat} class="planche__caption">
            {tr(caption)}
            {waiting && <span class="planche__more" aria-hidden="true" />}
          </p>
        </div>
      )}
    </div>
  );
}

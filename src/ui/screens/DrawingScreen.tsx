import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr, type LText } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { fxSound, sfx } from '../../audio/sfx';
import { backToWorld } from '../../overworld/controller';
import './drawing.css';

/**
 * The last page of the sketchbook, awake (src/story/finale.ts): Coconfus, last night's unfinished butterfly,
 * becomes Libellune (ending 1: rubbed out with the eraser, then drawn again, better) or Noctaile (ending 2:
 * nothing is rubbed out, its smudges grow into the drawing). Drawn on a canvas; a tap skips to the end.
 */
type Step = { at: number; text: LText };

const STEPS: Record<1 | 2, Step[]> = {
  1: [
    { at: 0, text: L('Sur la dernière page de ton cahier, le papillon d’hier soir… pas fini.', 'On the last page of your sketchbook, last night’s butterfly… unfinished.') },
    { at: 1600, text: L('Tu prends ta gomme. Doucement, cette fois.', 'You pick up your eraser. Gently, this time.') },
    { at: 4600, text: L('Et tu recommences, en prenant ton temps.', 'And you start again, taking your time.') },
    { at: 9400, text: L('Libellune ! Ses ailes sont enfin finies.', 'Glassfly! Its wings are finished at last.') },
  ],
  2: [
    { at: 0, text: L('Sur la dernière page de ton cahier, le papillon d’hier soir… pas fini.', 'On the last page of your sketchbook, last night’s butterfly… unfinished.') },
    { at: 1600, text: L('Tu ne gommes rien. Les taches deviennent des spirales…', 'You rub nothing out. The smudges turn into spirals…') },
    { at: 4800, text: L('… et le trou devient un œil, au milieu de ses ailes.', '… and the hole becomes an eye, right in its wings.') },
    { at: 8200, text: L('Noctaile ! Ton dessin, avec toutes ses taches.', 'Nightmoth! Your drawing, smudges and all.') },
  ],
};
const END = { 1: 11000, 2: 9800 };

const load = (src: string) => new Promise<HTMLImageElement>((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(img);
  img.src = src;
});

export function DrawingScreen({ ending }: { ending: 1 | 2 }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState(STEPS[ending][0].text);
  const [done, setDone] = useState(false);
  const skip = useRef(false);

  useEffect(() => {
    const cv = ref.current!;
    const g = cv.getContext('2d')!;
    let raf = 0, alive = true;
    (async () => {
      const [cocoon, dream] = await Promise.all([load(artUrl(creature('073'))), load(artUrl(creature(ending === 1 ? '071' : '072')))]);
      if (!alive) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      g.scale(dpr, dpr);
      const S = Math.min(W * 0.86, H * 0.62);
      const cx = W / 2, cy = H * 0.42;
      const fit = (img: HTMLImageElement) => {
        const k = S / Math.max(img.naturalWidth || 1, img.naturalHeight || 1);
        return { w: (img.naturalWidth || 1) * k, h: (img.naturalHeight || 1) * k };
      };
      const box = (img: HTMLImageElement, scale = 1) => {
        const { w, h } = fit(img);
        return [cx - (w * scale) / 2, cy - (h * scale) / 2, w * scale, h * scale] as const;
      };
      // the cocoon on its own layer, so the eraser can rub it out
      const layer = document.createElement('canvas');
      layer.width = W;
      layer.height = H;
      const lg = layer.getContext('2d')!;
      lg.drawImage(cocoon, ...box(cocoon, 0.78));
      // the pencil strokes that reveal the new drawing
      const mask = document.createElement('canvas');
      mask.width = W;
      mask.height = H;
      const mg = mask.getContext('2d')!;
      const reveal = document.createElement('canvas');
      reveal.width = W;
      reveal.height = H;
      const rg = reveal.getContext('2d')!;
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const crumbs: { x: number; y: number; vy: number }[] = [];
      let strokes = 0, lastSound = 0;
      const page = () => {
        g.fillStyle = '#fbf6ea';
        g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(120, 150, 210, 0.35)';
        g.lineWidth = 1;
        for (let y = 40; y < H; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        g.strokeStyle = 'rgba(220, 90, 90, 0.5)';
        g.beginPath(); g.moveTo(34, 0); g.lineTo(34, H); g.stroke();
      };
      const pencil = (x: number, y: number) => {
        g.save();
        g.translate(x, y);
        g.rotate(-0.7);
        g.fillStyle = '#f2c14e'; g.fillRect(0, -5, 46, 10);
        g.fillStyle = '#e8c9a0'; g.beginPath(); g.moveTo(0, -5); g.lineTo(-12, 0); g.lineTo(0, 5); g.fill();
        g.fillStyle = '#3f3b46'; g.beginPath(); g.moveTo(-8, -2); g.lineTo(-12, 0); g.lineTo(-8, 2); g.fill();
        g.restore();
      };
      const eraser = (x: number, y: number) => {
        g.save();
        g.translate(x, y);
        g.rotate(-0.35);
        g.fillStyle = '#f29ab8'; g.fillRect(-22, -12, 26, 24);
        g.fillStyle = '#5b8ad6'; g.fillRect(4, -12, 22, 24);
        g.strokeStyle = '#2a2238'; g.lineWidth = 2; g.strokeRect(-22, -12, 48, 24);
        g.restore();
      };
      const start = performance.now();
      const frame = (now: number) => {
        if (!alive) return;
        let t = now - start;
        if (skip.current) t = END[ending];
        page();
        const [dx, dy, dw, dh] = box(dream);
        if (ending === 1) {
          if (t < 4600) {
            // the eraser goes back and forth over the cocoon
            g.globalAlpha = Math.min(1, t / 900);
            if (t > 1600) {
              const k = (t - 1600) / 3000, rows = 7, row = Math.min(rows - 1, Math.floor(k * rows)), f = k * rows - row;
              const [bx, by, bw, bh] = box(cocoon, 0.82);
              const ex = bx + (row % 2 ? 1 - f : f) * bw, ey = by + ((row + 0.5) / rows) * bh;
              lg.globalCompositeOperation = 'destination-out';
              lg.beginPath(); lg.arc(ex, ey, S * 0.11, 0, Math.PI * 2); lg.fill();
              if (rnd() < 0.5) crumbs.push({ x: ex + (rnd() - 0.5) * 30, y: ey + 10, vy: 0.5 + rnd() });
              g.drawImage(layer, 0, 0);
              g.globalAlpha = 1;
              eraser(ex, ey);
              if (now - lastSound > 380) { fxSound('whoosh'); lastSound = now; }
            } else g.drawImage(layer, 0, 0);
            g.globalAlpha = 1;
          } else {
            // drawn again, stroke by stroke
            const k = Math.min(1, (t - 5000) / 4200);
            const want = Math.floor(Math.max(0, k) * 260);
            mg.strokeStyle = '#000';
            mg.lineCap = 'round';
            let px = cx, py = cy;
            for (; strokes < want; strokes++) {
              const ang = -0.9 + (rnd() - 0.5) * 0.4, len = S * (0.25 + rnd() * 0.35);
              px = dx + rnd() * dw; py = dy + rnd() * dh;
              mg.lineWidth = S * (0.05 + rnd() * 0.05);
              mg.beginPath(); mg.moveTo(px - Math.cos(ang) * len / 2, py - Math.sin(ang) * len / 2); mg.lineTo(px + Math.cos(ang) * len / 2, py + Math.sin(ang) * len / 2); mg.stroke();
            }
            if (k >= 1) { mg.fillRect(0, 0, W, H); }
            rg.clearRect(0, 0, W, H);
            rg.globalCompositeOperation = 'source-over';
            rg.drawImage(mask, 0, 0);
            rg.globalCompositeOperation = 'source-in';
            rg.drawImage(dream, dx, dy, dw, dh);
            g.drawImage(reveal, 0, 0);
            if (k > 0 && k < 1) {
              pencil(px, py);
              if (now - lastSound > 300) { fxSound('slash'); lastSound = now; }
            }
          }
          for (const c of crumbs) { c.y = Math.min(H - 6, c.y + c.vy); g.fillStyle = '#e8a0b0'; g.fillRect(c.x, c.y, 3, 2); }
        } else {
          // the smudges grow: the new drawing spreads out from the cocoon's middle
          const k = Math.max(0, Math.min(1, (t - 1600) / 5600));
          g.globalAlpha = Math.min(1, t / 900) * (1 - k * 0.9);
          g.drawImage(layer, 0, 0);
          g.globalAlpha = 1;
          if (k > 0) {
            const r = k * Math.hypot(dw, dh) * 0.62;
            mg.clearRect(0, 0, W, H);
            mg.fillStyle = '#000';
            mg.beginPath();
            for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.12) {
              const rr = r * (0.86 + 0.14 * Math.sin(a * 7 + k * 9));
              const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
              if (a === 0) mg.moveTo(x, y); else mg.lineTo(x, y);
            }
            mg.fill();
            rg.clearRect(0, 0, W, H);
            rg.globalCompositeOperation = 'source-over';
            rg.drawImage(mask, 0, 0);
            rg.globalCompositeOperation = 'source-in';
            rg.drawImage(dream, dx, dy, dw, dh);
            g.drawImage(reveal, 0, 0);
            // dark pencil spirals running out from the middle
            g.strokeStyle = `rgba(58, 49, 96, ${(0.6 * (1 - k) * (1 - k)).toFixed(3)})`;
            g.lineWidth = 2;
            for (let s = 0; s < 3; s++) {
              g.beginPath();
              for (let i = 0; i < 40 * k; i++) {
                const a = i * 0.35 + s * 2.1, rr = i * 2.4;
                const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
                if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
              }
              g.stroke();
            }
            if (k < 1 && now - lastSound > 420) { fxSound('slash'); lastSound = now; }
          }
        }
        const steps = STEPS[ending];
        const step = [...steps].reverse().find((s) => t >= s.at)!;
        setText(step.text);
        if (t >= END[ending]) {
          setDone(true);
          sfx.sparkle();
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [ending]);

  const tap = () => {
    if (done) backToWorld();
    else skip.current = true;
  };
  return (
    <div class="drawing" onClick={tap}>
      <canvas ref={ref} class="drawing__page" aria-hidden="true" />
      <p class="drawing__caption">{tr(text)}</p>
      {done && <p class="drawing__next">{tr(L('Touche pour continuer', 'Tap to continue'))}</p>}
    </div>
  );
}

import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr, type LText } from '../../i18n';
import { fadeOutMusic, playMusic } from '../../audio/music';
import { sfx } from '../../audio/sfx';

/**
 * Before the Prof's speech: falling asleep at the desk, seen through heavy eyelids. A lamp, a sketchbook
 * page, a pencil trying a wing again and again; everything blurs and sways, the eyes close, and the dream
 * opens in white. Vague on purpose: it hints at the dream without saying it. A tap goes to the next beat.
 * Only the pencil and the eraser are heard at first; the game's theme fades in once the eyes are shut, among
 * the fireflies of the dream, and goes on under the Prof's speech.
 */
const BEATS: { at: number; text: LText }[] = [
  { at: 0, text: L('… encore un dessin… juste un dernier…', '… one more drawing… just one more…') },
  { at: 4600, text: L('… ses ailes… je n’arrive pas à faire ses ailes…', '… its wings… I can’t get its wings right…') },
  { at: 9400, text: L('… zzz …', '… zzz …') },
];
/** The eyes are shut: the fireflies of the dream, and the music fading in. */
const SHUT = 10400;
/** The dream opens in white. */
const LIGHT = 17000;
const END = LIGHT + 1700;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => clamp(v) * clamp(v) * (3 - 2 * clamp(v));
/** A bump from 0 to 1 and back between `a` and `b`. */
const bump = (t: number, a: number, b: number) => (t < a || t > b ? 0 : Math.sin(((t - a) / (b - a)) * Math.PI));

/** How closed the eyes are (0 open, 1 shut). */
function lids(t: number): number {
  return Math.max(
    0.5 * bump(t, 3000, 3500),
    0.8 * bump(t, 6600, 7600),
    0.9 * bump(t, 8300, 9600),
    // shut for good: the dream's white light rises from the dark, not from the room
    ease((t - 9700) / 1100),
  );
}

/** The wing she keeps trying (a big upper lobe and a smaller lower one), as points along the pencil line. */
function wing(s: number, wobble: number, seed: number): [number, number][] {
  type P = [number, number];
  const bez = (p0: P, p1: P, p2: P, p3: P, n: number): P[] => Array.from({ length: n }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  });
  const k = (x: number, y: number): P => [x * s, y * s];
  const pts = [
    ...bez(k(-0.7, 0), k(-0.4, -1.3), k(1.2, -1.4), k(1.1, -0.5), 30),
    ...bez(k(1.1, -0.5), k(1, -0.1), k(0, -0.05), k(-0.7, 0), 14),
    ...bez(k(-0.7, 0), k(-0.1, 0.25), k(0.8, 0.3), k(0.55, 0.75), 16),
    ...bez(k(0.55, 0.75), k(0.3, 1.1), k(-0.5, 0.6), k(-0.7, 0.02), 14),
  ];
  // a hand that isn't quite steady, more so the second time
  return pts.map(([x, y], i) => [x + Math.sin(i * 0.7 + seed) * wobble * s * 0.05, y + Math.cos(i * 0.5 + seed) * wobble * s * 0.05]);
}

export function SleepIntroView({ onDone }: { onDone: () => void }) {
  const scene = useRef<HTMLCanvasElement>(null);
  const eyes = useRef<HTMLCanvasElement>(null);
  const [beat, setBeat] = useState(0);
  const jump = useRef<number | null>(null);
  const now = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    const sc = scene.current!, ey = eyes.current!;
    const g = sc.getContext('2d')!, e = ey.getContext('2d')!;
    const W = sc.clientWidth, H = sc.clientHeight;
    for (const c of [sc, ey]) { c.width = W; c.height = H; }
    let start = performance.now(), raf = 0, last = -1, lastSound = 0, music = false;
    // the title music fades away: only the pencil is heard
    fadeOutMusic(1.2);
    const specks = Array.from({ length: 42 }, (_, i) => ({
      x: (i * 97) % W, y: (i * 233) % H, r: 1.2 + (i % 4) * 0.8, col: ['#f6a7c8', '#bfe2fa', '#f7e37a', '#c9ec9a', '#d9ccf5'][i % 5],
      v: 0.15 + (i % 5) * 0.06, phase: (i * 1.7) % 6.28, at: SHUT + (i % 7) * 380,
    }));
    const done = () => {
      if (finished.current) return;
      finished.current = true;
      onDone();
    };
    const frame = (now: number) => {
      if (jump.current !== null) { start = now - jump.current; jump.current = null; }
      const t = now - start;
      nowRef(t);
      const b = t >= BEATS[2].at ? 2 : t >= BEATS[1].at ? 1 : 0;
      if (b !== last) { last = b; setBeat(b); }
      // the scene: dimmer, blurrier and swaying more as sleep comes
      const sleepy = clamp(t / 10500);
      sc.style.filter = `blur(${(1 + sleepy * 7).toFixed(2)}px) saturate(${(1 - sleepy * 0.4).toFixed(2)})`;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#120f1c';
      g.fillRect(0, 0, W, H);
      const lamp = g.createRadialGradient(W * 0.8, H * 0.12, 10, W * 0.8, H * 0.12, Math.max(W, H) * (0.85 + 0.05 * Math.sin(t / 700)));
      lamp.addColorStop(0, 'rgba(255, 214, 140, 0.75)');
      lamp.addColorStop(0.45, 'rgba(240, 170, 90, 0.22)');
      lamp.addColorStop(1, 'rgba(0, 0, 0, 0)');
      g.fillStyle = lamp;
      g.fillRect(0, 0, W, H);
      const sway = Math.sin(t / 1300) * 0.02 * (0.3 + sleepy);
      g.translate(W / 2, H * 0.6);
      g.rotate(-0.1 + sway);
      g.scale(1 + sleepy * 0.08, 1 + sleepy * 0.08);
      const pw = W * 0.9, ph = H * 0.5;
      g.fillStyle = '#e9dcbd';
      g.fillRect(-pw / 2, -ph / 2, pw, ph);
      // notebook lines, wavier and wavier
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(110, 140, 200, 0.45)';
      for (let y = -ph / 2 + 18; y < ph / 2; y += 20) {
        g.beginPath();
        for (let x = -pw / 2; x <= pw / 2; x += 12) g.lineTo(x, y + Math.sin(x / 40 + t / 600 + y) * sleepy * 5);
        g.stroke();
      }
      g.strokeStyle = 'rgba(210, 90, 90, 0.55)';
      g.beginPath(); g.moveTo(-pw / 2 + 26, -ph / 2); g.lineTo(-pw / 2 + 26, ph / 2); g.stroke();
      // the wing: drawn, rubbed out, drawn again, then the pencil stops
      const s = Math.min(pw, ph) * 0.3;
      const first = wing(s, 0.3, 1), second = wing(s, 1.2, 4);
      const drawn = (pts: [number, number][], k: number) => {
        const n = Math.floor(clamp(k) * (pts.length - 1));
        g.strokeStyle = '#3f3b46';
        g.lineWidth = 2.2;
        g.lineCap = 'round';
        g.beginPath();
        for (let i = 0; i <= n; i++) g.lineTo(pts[i][0], pts[i][1]);
        g.stroke();
        return pts[n];
      };
      let tip: [number, number] | null = null;
      if (t < 6000) {
        tip = drawn(first, (t - 500) / 3000);
        if (t > 4600) {
          // rubbed out: the paper comes back over it, with a grey smudge
          const k = clamp((t - 4600) / 1300);
          g.fillStyle = `rgba(233, 220, 189, ${k.toFixed(2)})`;
          g.fillRect(-s * 1.4, -s, s * 2.8, s * 1.7);
          g.fillStyle = `rgba(150, 140, 160, ${(0.25 * k).toFixed(2)})`;
          g.fillRect(-s * 1.2, -s * 0.2, s * 2.4, s * 0.35);
          tip = null;
        }
      } else {
        g.fillStyle = 'rgba(150, 140, 160, 0.25)';
        g.fillRect(-s * 1.2, -s * 0.2, s * 2.4, s * 0.35);
        tip = drawn(second, (t - 6100) / 3200);
        if (t > 9300) tip = null;
      }
      // the pencil scratches while it draws, the eraser rubs
      const rubbing = t > 4600 && t < 5900;
      if ((tip || rubbing) && now - lastSound > (rubbing ? 230 : 120 + Math.random() * 90)) {
        if (rubbing) sfx.rub();
        else sfx.pencil(1 - sleepy * 0.6);
        lastSound = now;
      }
      if (tip) {
        // the pencil, at the end of the line
        g.save();
        g.translate(tip[0], tip[1]);
        g.rotate(-0.8);
        g.fillStyle = '#f2c14e'; g.fillRect(0, -5, 60, 10);
        g.fillStyle = '#e8c9a0'; g.beginPath(); g.moveTo(0, -5); g.lineTo(-13, 0); g.lineTo(0, 5); g.fill();
        g.fillStyle = '#3f3b46'; g.beginPath(); g.moveTo(-8, -2); g.lineTo(-13, 0); g.lineTo(-8, 2); g.fill();
        g.restore();
      }
      // the eyelids, and the first colours of the dream behind them
      e.clearRect(0, 0, W, H);
      const l = lids(t);
      if (l > 0) {
        e.fillStyle = '#07050b';
        // an almond-shaped opening: the lids meet at the corners first
        const edge = (H / 2) * l, corner = Math.min(H / 2 + 2, edge * 1.6 + l * 40), mid = edge * (0.3 + 0.7 * l);
        e.beginPath();
        e.moveTo(0, 0); e.lineTo(W, 0); e.lineTo(W, corner);
        e.quadraticCurveTo(W / 2, 2 * mid - corner, 0, corner);
        e.fill();
        e.beginPath();
        e.moveTo(0, H); e.lineTo(W, H); e.lineTo(W, H - corner);
        e.quadraticCurveTo(W / 2, H - (2 * mid - corner), 0, H - corner);
        e.fill();
      }
      // the fireflies of the dream, behind the shut eyes, one after the other
      const dream = t < LIGHT ? 1 : 1 - clamp((t - LIGHT) / 700);
      if (t > SHUT) {
        for (const p of specks) {
          const on = clamp((t - p.at) / 1400) * dream;
          if (on <= 0) continue;
          const y = (p.y - (t - SHUT) * p.v * 0.04) % H;
          const x = p.x + Math.sin(t / 1100 + p.phase) * 14, yy = y < 0 ? y + H : y;
          const glow = on * (0.35 + 0.35 * Math.sin(t / 520 + p.phase));
          const halo = e.createRadialGradient(x, yy, 0, x, yy, p.r * 6);
          halo.addColorStop(0, p.col);
          halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
          e.globalAlpha = glow * 0.6;
          e.fillStyle = halo;
          e.beginPath(); e.arc(x, yy, p.r * 6, 0, Math.PI * 2); e.fill();
          e.globalAlpha = Math.min(1, glow * 1.6);
          e.fillStyle = p.col;
          e.beginPath(); e.arc(x, yy, p.r, 0, Math.PI * 2); e.fill();
        }
        e.globalAlpha = 1;
      }
      // the game's theme fades in while the eyes are shut, and plays on under the Prof's speech
      if (!music && t > SHUT - 200) {
        music = true;
        playMusic('title', false, 6);
      }
      // the dream opens: a white light from the middle
      const light = clamp((t - LIGHT) / 1400);
      if (light > 0) {
        const r = Math.hypot(W, H) * ease(light);
        const glow = e.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(1, r));
        glow.addColorStop(0, 'rgba(255, 252, 244, 1)');
        glow.addColorStop(0.7, 'rgba(255, 252, 244, 0.9)');
        glow.addColorStop(1, 'rgba(255, 252, 244, 0)');
        e.fillStyle = glow;
        e.fillRect(0, 0, W, H);
      }
      if (t >= END) return done();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'z' || ev.key === 'a') {
        ev.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  /** A tap goes to the next beat, then straight to the dream opening. */
  function advance() {
    if (now.current >= LIGHT) return;
    jump.current = BEATS.find((x) => x.at > now.current)?.at ?? (now.current < SHUT ? SHUT : LIGHT);
  }
  function nowRef(t: number) {
    now.current = t;
  }

  return (
    <div class="sleepintro" onClick={advance}>
      <canvas ref={scene} class="sleepintro__scene" aria-hidden="true" />
      <canvas ref={eyes} class="sleepintro__eyes" aria-hidden="true" />
      <p key={beat} class="sleepintro__text">{tr(BEATS[beat].text)}</p>
    </div>
  );
}

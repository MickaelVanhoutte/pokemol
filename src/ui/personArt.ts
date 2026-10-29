import { lookKey, type Appearance } from '../data/appearance';
import { seeded, type Rand } from './paper/pencilCanvas';

/**
 * Characters drawn in coloured pencil, like the Bestioles: dense crayon strokes over a light wash,
 * one wobbly graphite line, a chibi with a big round head. Drawn once per look and view on a canvas
 * and kept as a data URL (battle intros, the player's back in battle, the prologue, the trainer card).
 */

type P = [number, number];
export type View = 'front' | 'back';

/** Drawing space: 200 × 260, the character standing in the middle, drawn at ×2. */
const W = 200, H = 260, K = 2;
const INK = '#3f3b46', PAPER = '#fbf6ea', SHOE = '#5a3a2a';
/** Team Gomme: black gloves and boots, a dark mask, the blue band of a school eraser. */
const GLOVE = '#3a3346', BOOT = '#2a2238', MASK = '#2e2440', BAND = '#4a7ee0';

const cache = new Map<string, string>();

function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${[c(n >> 16), c((n >> 8) & 255), c(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** A smooth closed (or open) curve through the points (Catmull-Rom). */
function curve(pts: P[], closed: boolean, per = 6): P[] {
  const n = pts.length, out: P[] = [];
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const [a, b, c, d] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      const f = (p0: number, p1: number, p2: number, p3: number) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
      out.push([f(a[0], b[0], c[0], d[0]), f(a[1], b[1], c[1], d[1])]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 14, a0 = 0): P[] =>
  Array.from({ length: n }, (_, i) => {
    const a = a0 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });

/** The outline of a thick line along a path, from width w0 to w1. */
function band(path: P[], w0: number, w1 = w0): P[] {
  const a: P[] = [], b: P[] = [];
  path.forEach((p, i) => {
    const q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)];
    const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1, w = (w0 + ((w1 - w0) * i) / Math.max(1, path.length - 1)) / 2;
    a.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]);
    b.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
  });
  return [...a, ...b.reverse()];
}

/** Bumps all round a circle (curls, a cloud of hair). */
function bumpy(cx: number, cy: number, r: number, n: number, depth: number, a0 = 0, a1 = Math.PI * 2): P[] {
  const out: P[] = [];
  const full = a1 - a0 >= Math.PI * 2 - 0.01;
  const steps = n * 2;
  for (let i = 0; i <= steps - (full ? 1 : 0); i++) {
    const a = a0 + ((a1 - a0) * i) / steps, rr = i % 2 ? r : r - depth;
    out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return out;
}

/** Spikes pointing out of a path (spiky hair). */
function spiky(path: P[], h: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [a, b] = [path[i], path[i + 1]];
    const nx = b[1] - a[1], ny = -(b[0] - a[0]), l = Math.hypot(nx, ny) || 1;
    out.push(a, [(a[0] + b[0]) / 2 + (nx / l) * h, (a[1] + b[1]) / 2 + (ny / l) * h]);
  }
  out.push(path[path.length - 1]);
  return out;
}

class Crayon {
  constructor(private g: CanvasRenderingContext2D, public r: Rand) {}

  private path(pts: P[], closed: boolean, round: boolean) {
    const p = round ? curve(pts, closed) : pts;
    const g = this.g;
    g.beginPath();
    g.moveTo(p[0][0], p[0][1]);
    for (const q of p.slice(1)) g.lineTo(q[0], q[1]);
    if (closed) g.closePath();
  }

  /** Coloured-pencil colouring: paper underneath, a light wash, strokes packed close, a second pass across. */
  colour(pts: P[], col: string, o: { angle?: number; press?: number; round?: boolean; over?: number; paper?: boolean } = {}) {
    const { g, r } = this;
    const round = o.round ?? true, press = o.press ?? 1;
    if (o.paper ?? true) {
      this.path(pts, true, round);
      g.fillStyle = PAPER;
      g.fill();
    }
    g.save();
    this.path(pts, true, round);
    g.clip();
    g.globalAlpha = 0.4 * press;
    g.fillStyle = col;
    g.fill();
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 4;
    g.strokeStyle = col;
    g.lineCap = 'round';
    const layer = (deg: number, gap: number, alpha: number, from: number, to: number) => {
      const a = (deg * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
      for (let k = from; k < to; k += gap * (0.6 + r() * 0.8)) {
        g.globalAlpha = Math.min(1, alpha * (0.6 + r() * 0.5));
        g.lineWidth = 1.15 * (0.75 + r() * 0.5);
        const px = cx - uy * k, py = cy + ux * k, reach = R * (0.9 + r() * 0.2), wob = (r() - 0.5) * 1.4;
        g.beginPath();
        g.moveTo(px - ux * reach - uy * wob, py - uy * reach + ux * wob);
        g.lineTo(px + ux * reach + uy * wob, py + uy * reach - ux * wob);
        g.stroke();
      }
    };
    const deg = o.angle ?? 70;
    layer(deg, 1.9, 0.8 * press, -R, R);
    const over = o.over ?? 0.4;
    if (over > 0) {
      const span = 2 * R * over, from = -R + r() * (2 * R - span);
      layer(deg + 30 + (r() - 0.5) * 20, 3, 0.65 * press, from, from + span);
    }
    g.restore();
    g.globalAlpha = 1;
  }

  /** One graphite line with a slow wobble; a closed one overshoots its start a little. */
  line(pts: P[], closed: boolean, o: { w?: number; col?: string; round?: boolean } = {}) {
    const { g, r } = this;
    let p = (o.round ?? true) ? curve(pts, closed) : pts;
    const f1 = 0.25 + r() * 0.3, ph = r() * 6;
    p = p.map(([x, y], i) => [x + Math.sin(i * f1 + ph) * 0.7, y + Math.cos(i * f1 * 1.7 + ph) * 0.6]);
    if (closed && p.length > 2) p = [...p, p[0], [p[0][0] + (p[1][0] - p[0][0]) * 0.6, p[0][1] + (p[1][1] - p[0][1]) * 0.6]];
    g.strokeStyle = o.col ?? INK;
    g.lineWidth = (o.w ?? 1.9) * (0.9 + r() * 0.2);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.globalAlpha = 0.92;
    g.beginPath();
    g.moveTo(p[0][0], p[0][1]);
    for (const q of p.slice(1)) g.lineTo(q[0], q[1]);
    g.stroke();
    g.globalAlpha = 1;
  }

  shape(pts: P[], col: string, o: { angle?: number; press?: number; round?: boolean; over?: number; w?: number } = {}) {
    this.colour(pts, col, o);
    this.line(pts, true, { w: o.w, round: o.round });
  }

  dot(x: number, y: number, rx: number, ry = rx, col = INK) {
    const g = this.g;
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  }
}

/** The hair in front of the face (and over the head from behind). */
function hairFront(c: Crayon, a: Appearance, view: View) {
  const col = a.hairColor;
  if (view === 'back') {
    // from behind the hair covers the head down to the nape (longer styles go further)
    const nape = a.hair === 'carre' ? 120 : a.hair === 'long' ? 176 : a.hair === 'boucles' ? 112 : 106;
    if (a.hair === 'boucles') c.shape(bumpy(100, 74, 62, 11, 7), col, { angle: 60 });
    else if (a.hair === 'pique') c.shape([...spiky([[47, 92], [45, 62], [60, 36], [100, 26], [140, 36], [155, 62], [153, 92]], 17), [140, nape - 4], [100, nape + 4], [60, nape - 4]], col, { angle: 70, round: false });
    else if (a.hair === 'long') c.shape([[46, 96], [44, 62], [60, 36], [100, 26], [140, 36], [156, 62], [154, 96], [150, 140], [146, nape], [100, nape + 6], [54, nape], [50, 140]], col, { angle: 80 });
    else c.shape([[47, 92], [45, 62], [60, 36], [100, 26], [140, 36], [155, 62], [153, 92], [140, nape - 4], [100, nape + 4], [60, nape - 4]], col, { angle: 70 });
    if (a.hair === 'queue') {
      c.shape(band([[100, 70], [104, 110], [98, 150], [104, 170]], 30, 12), col, { angle: 85 });
      c.shape(ellipse(100, 70, 9, 7, 10), '#e8506a', { over: 0 });
    }
    if (a.hair === 'chignon') c.shape(ellipse(100, 40, 20, 18, 12), col, { angle: 50 });
    for (const s of a.hair === 'couettes' ? [-1, 1] : []) {
      c.shape(band([[100 + s * 48, 76], [100 + s * 64, 100], [100 + s * 70, 134]], 28, 12), col, { angle: 80 });
      c.shape(ellipse(100 + s * 49, 76, 7, 7, 10), '#e8506a', { over: 0 });
    }
    return;
  }
  // a cap of hair over the top of the head, its fringe across the forehead
  const top: P[] = [[46, 96], [44, 68], [54, 44], [76, 30], [100, 26], [124, 30], [146, 44], [156, 68], [154, 96]];
  const fringes: Record<string, P[]> = {
    court: [[146, 92], [146, 66], [132, 62], [120, 70], [106, 60], [92, 70], [78, 60], [64, 68], [54, 66], [54, 92]],
    pique: [[146, 92], [146, 66], [132, 58], [120, 70], [106, 56], [92, 70], [78, 56], [64, 68], [54, 66], [54, 92]],
    carre: [[148, 112], [146, 66], [100, 64], [54, 66], [52, 112]],
    long: [[150, 120], [146, 64], [122, 56], [96, 62], [70, 74], [54, 92], [52, 120]],
    queue: [[146, 84], [146, 62], [120, 56], [94, 60], [70, 70], [54, 84]],
    couettes: [[146, 88], [146, 64], [100, 62], [54, 64], [54, 88]],
    boucles: [[150, 96], [146, 66], [134, 70], [122, 60], [110, 70], [100, 60], [90, 70], [78, 60], [66, 70], [54, 66], [50, 96]],
    chignon: [[146, 84], [146, 62], [124, 54], [100, 58], [76, 54], [54, 62], [54, 84]],
  };
  // the spikes stand out from the cap, so its valleys stay over the head (no skull between them)
  if (a.hair === 'pique') c.shape([...spiky(top, 18), ...fringes.pique], col, { angle: 60, round: false });
  else if (a.hair === 'boucles') c.shape([...bumpy(100, 74, 60, 9, 7, Math.PI * 0.95, Math.PI * 2.05), ...fringes.boucles], col, { angle: 60 });
  else c.shape([...top, ...fringes[a.hair]], col, { angle: 70 });
  // a few strands
  c.line([[100, 32], [96, 48]], false, { w: 1.2 });
  if (a.hair !== 'pique' && a.hair !== 'boucles') c.line([[118, 36], [124, 50]], false, { w: 1.2 });
}

/** Hair behind the head and body (long hair, a bob, tails, curls, a bun). */
function hairBack(c: Crayon, a: Appearance) {
  const col = shade(a.hairColor, 0.88);
  switch (a.hair) {
    case 'long': c.shape([[50, 80], [44, 130], [50, 172], [100, 178], [150, 172], [156, 130], [150, 80]], col, { angle: 85 }); break;
    case 'carre': c.shape([[48, 80], [42, 112], [52, 122], [148, 122], [158, 112], [152, 80]], col, { angle: 80 }); break;
    case 'boucles': c.shape(bumpy(100, 76, 66, 12, 8), col, { angle: 60 }); break;
    case 'chignon': c.shape(ellipse(100, 26, 19, 17, 12), a.hairColor, { angle: 50 }); break;
    case 'queue':
      c.shape(band([[144, 48], [170, 66], [180, 100], [172, 138]], 30, 12), a.hairColor, { angle: 80 });
      c.shape(ellipse(148, 50, 8, 8, 10), '#e8506a', { over: 0 });
      break;
    case 'couettes':
      for (const s of [-1, 1]) {
        c.shape(band([[100 + s * 50, 72], [100 + s * 68, 96], [100 + s * 74, 132]], 28, 12), a.hairColor, { angle: 80 });
        c.shape(ellipse(100 + s * 50, 72, 7, 7, 10), '#e8506a', { over: 0 });
      }
      break;
  }
}

function legs(c: Crayon, a: Appearance) {
  const skin = a.skin, col = a.bottomColor;
  if (a.bottom === 'pantalon' || a.top === 'blouse') {
    for (const x of [87, 113]) c.shape(band([[x, 170], [x + (x < 100 ? -1 : 1), 226]], 24, 22), col, { angle: 85 });
  } else {
    for (const x of [88, 112]) c.shape(band([[x, 186], [x + (x < 100 ? -1 : 1), 226]], 16, 15), skin, { angle: 80, press: 0.7 });
    if (a.bottom === 'short') c.shape([[72, 168], [128, 168], [131, 202], [103, 204], [100, 192], [97, 204], [69, 202]], col, { angle: 85, round: false });
    else c.shape([[76, 166], [124, 166], [142, 206], [100, 212], [58, 206]], col, { angle: 85 });
  }
  if (a.top === 'uniforme') for (const x of [87, 113]) c.shape([[x - 13, 204], [x + 13, 204], [x + 13, 228], [x - 13, 228]], BOOT, { angle: 85, over: 0 });
  for (const x of [84, 116]) c.shape(ellipse(x, 232, 15, 8, 12), a.top === 'uniforme' ? BOOT : SHOE, { angle: 0, over: 0 });
}

function body(c: Crayon, a: Appearance, view: View) {
  const col = a.top === 'blouse' ? '#f4f4f8' : a.topColor;
  const longSleeves = a.top !== 'tshirt';
  const hand = a.top === 'uniforme' ? GLOVE : a.skin;
  // the neck, then the body
  c.shape([[93, 112], [107, 112], [108, 130], [92, 130]], a.skin, { press: 0.7, round: false });
  const torso: P[] = a.top === 'blouse'
    ? [[72, 124], [128, 124], [136, 150], [140, 206], [60, 206], [64, 150]]
    : [[72, 124], [128, 124], [134, 150], [130, 180], [70, 180], [66, 150]];
  c.shape(torso, col, { angle: 80 });
  if (a.top === 'rayures') {
    for (const y of [140, 156, 172]) c.colour(band([[68, y], [132, y]], 6), '#fbf6ea', { angle: 0, over: 0, press: 1.3 });
    c.line(torso, true);
  }
  if (a.top === 'uniforme') {
    // a black belt with a silver buckle; on the chest, Team Gomme's sign: a pink and blue eraser
    c.shape(band([[69, 174], [131, 174]], 9), BOOT, { angle: 0, over: 0 });
    c.shape([[94, 170], [106, 170], [106, 178], [94, 178]], '#c8c8d0', { round: false, over: 0 });
    if (view === 'front') {
      const at = ([x, y]: P): P => [100 + (x - 100) * Math.cos(-0.35) - (y - 148) * Math.sin(-0.35), 148 + (x - 100) * Math.sin(-0.35) + (y - 148) * Math.cos(-0.35)];
      c.shape([[84, 140], [116, 140], [116, 156], [84, 156]].map((p) => at(p as P)), '#f27fa0', { over: 0, round: false });
      c.shape([[106, 140], [116, 140], [116, 156], [106, 156]].map((p) => at(p as P)), BAND, { over: 0, round: false });
    }
  } else if (view === 'front') {
    if (a.top === 'blouse') {
      // the shirt in the V of the lab coat, buttons
      c.shape([[90, 124], [110, 124], [100, 152]], a.topColor, { over: 0, round: false });
      c.line([[100, 152], [100, 204]], false, { w: 1.3 });
      for (const y of [166, 186]) c.dot(104, y, 1.8);
    } else if (a.top === 'pull') c.line([[82, 160], [118, 160], [116, 176], [84, 176]], true, { w: 1.3, round: false });
    else c.line([[90, 125], [100, 134], [110, 125]], false, { w: 1.4 });
  }
  // arms down at the sides, hands
  for (const s of [-1, 1]) {
    const x = 100 + s * 28;
    if (longSleeves) c.shape(band([[x, 130], [x + s * 10, 156], [x + s * 12, 176]], 16, 14), col, { angle: 80 });
    else {
      c.shape(band([[x + s * 4, 146], [x + s * 10, 160], [x + s * 12, 176]], 12, 11), a.skin, { angle: 80, press: 0.7 });
      c.shape(band([[x, 128], [x + s * 6, 148]], 18, 17), col, { angle: 80 });
    }
    c.shape(ellipse(x + s * 12, 182, 7.5, 7.5, 10), hand, { press: hand === a.skin ? 0.7 : 1, over: 0 });
  }
}

function head(c: Crayon, a: Appearance, view: View) {
  for (const s of [-1, 1]) c.shape(ellipse(100 + s * 51, 86, 8, 10, 10), a.skin, { press: 0.7, over: 0 });
  c.shape(ellipse(100, 80, 52, 47, 18), a.skin, { angle: 60, press: 0.7, over: 0.25 });
  if (view === 'back') return;
  if (a.face === 'blank') {
    // the Great Eraser: a face rubbed out, a grey smudge and crumbs where it was
    c.colour(ellipse(100, 94, 32, 16, 14), '#a8a4b4', { paper: false, press: 0.6, angle: 10, over: 0.6 });
    for (const [x, y] of [[66, 112], [134, 110], [74, 120], [128, 118]] as P[]) c.dot(x, y, 1.6, 1.2, '#8a8698');
    return;
  }
  if (a.mask) {
    // a dark mask with white eye holes
    c.shape([[58, 88], [66, 77], [88, 80], [100, 86], [112, 80], [134, 77], [142, 88], [134, 101], [112, 99], [100, 93], [88, 99], [66, 101]], MASK, { angle: 20, over: 0.5 });
    for (const x of [82, 118]) {
      c.shape(ellipse(x, 90, 7.5, 5.5, 12), '#ffffff', { over: 0, press: 0.2 });
      c.dot(x + (x < 100 ? 1.5 : -1.5), 90.5, 2.8, 3.2);
    }
  } else {
    for (const x of [82, 118]) {
      c.dot(x, 90, 5.5, a.face === 'mean' ? 6 : 7.5);
      c.dot(x - 1.8, 87.5, 1.8, 2.2, '#ffffff');
    }
  }
  if (a.face === 'mean') {
    // frowning brows and a smirk
    c.line([[70, 77], [91, 85]], false, { w: 2.8 });
    c.line([[130, 77], [109, 85]], false, { w: 2.8 });
    c.line([[90, 109], [102, 108], [110, 103]], false, { w: 1.8 });
    return;
  }
  // round eyes with a glint, pink cheeks, a small smile
  for (const x of [68, 132]) c.colour(ellipse(x, 103, 9, 5, 10), '#f28aa0', { over: 0, paper: false, press: 0.7 });
  c.line([[93, 106], [100, 111], [107, 106]], false, { w: 1.6 });
}

/** Team Gomme's ranks wear a cape: behind them seen from the front, over their back from behind. */
function cape(c: Crayon, a: Appearance) {
  if (a.cape) c.shape([[68, 122], [132, 122], [150, 170], [158, 228], [42, 228], [50, 170]], a.cape, { angle: 80 });
}

/** …and a high collar standing up behind the head. */
function collar(c: Crayon, a: Appearance) {
  if (a.cape) c.shape([[64, 134], [48, 96], [74, 108], [100, 120], [126, 108], [152, 96], [136, 134]], shade(a.cape, 0.8), { angle: 70, round: false });
}

function extras(c: Crayon, a: Appearance, view: View) {
  const col = a.extraColor ?? a.topColor;
  switch (a.extra) {
    case 'casquette':
      c.shape([[46, 64], [52, 40], [76, 25], [100, 21], [124, 25], [148, 40], [154, 64], [100, 58]], col, { angle: 60 });
      if (view === 'front') c.shape([[40, 64], [70, 56], [100, 54], [130, 56], [160, 64], [150, 74], [100, 68], [50, 74]], shade(col, 0.85), { angle: 0 });
      else c.shape([[86, 58], [114, 58], [112, 66], [88, 66]], shade(col, 0.85), { round: false, over: 0 });
      break;
    case 'bonnet':
      c.shape([[46, 62], [52, 38], [76, 22], [100, 18], [124, 22], [148, 38], [154, 62]], col, { angle: 75 });
      c.shape(band([[46, 62], [100, 66], [154, 62]], 13), shade(col, 0.8), { angle: 90 });
      c.shape(ellipse(100, 16, 10, 9, 10), '#f4f4f8', { over: 0 });
      break;
    case 'noeud':
      c.shape([[136, 40], [116, 24], [114, 54]], col, { round: false, over: 0 });
      c.shape([[136, 40], [156, 24], [158, 54]], col, { round: false, over: 0 });
      c.shape(ellipse(136, 40, 6, 6, 10), shade(col, 0.8), { over: 0 });
      break;
    case 'lunettes':
      if (view === 'front') {
        for (const x of [82, 118]) {
          c.colour(ellipse(x, 89, 12, 11, 16), '#bfe2fa', { paper: false, press: 0.35, over: 0 });
          c.line(ellipse(x, 89, 12, 11, 16), true, { w: 2 });
        }
        c.line([[94, 88], [100, 85], [106, 88]], false, { w: 2 });
      } else for (const s of [-1, 1]) c.line([[100 + s * 40, 84], [100 + s * 52, 82]], false, { w: 2 });
      break;
    case 'gomme': {
      // a school eraser for a cap: pink, worn at a corner, its blue band over the brow, Team Gomme's G
      c.shape([[47, 66], [47, 40], [64, 20], [140, 20], [153, 32], [153, 66]], col, { angle: 60, round: false });
      c.shape([[46, 50], [154, 50], [154, 67], [46, 67]], BAND, { angle: 0, round: false, over: 0 });
      if (view === 'front') c.line([[108, 28], [96, 26], [88, 33], [90, 42], [100, 44], [106, 38], [99, 37]], false, { w: 2.4, col: '#ffffff' });
      break;
    }
    case 'fleur':
      for (let i = 0; i < 5; i++) {
        const t = (i / 5) * Math.PI * 2;
        c.shape(ellipse(140 + Math.cos(t) * 7, 44 + Math.sin(t) * 7, 6, 6, 10), '#f29ac8', { over: 0 });
      }
      c.shape(ellipse(140, 44, 4.5, 4.5, 10), '#f2c14e', { over: 0 });
      break;
  }
}

/** A character drawn in coloured pencil (PNG data URL), from the front or from behind. */
export function personUrl(a: Appearance, view: View = 'front'): string {
  const key = `${lookKey(a)}|${view}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return '';
  const cv = document.createElement('canvas');
  cv.width = W * K;
  cv.height = H * K;
  const g = cv.getContext('2d')!;
  g.scale(K, K);
  // each part draws its own strokes, the same whatever the face and the hat: two looks that differ only there
  // differ only there, so one fades into the other (the Great Eraser's face coming back, src/story/finale.ts)
  const same = `${lookKey({ ...a, face: undefined, extra: 'aucun', extraColor: undefined })}|${view}`;
  const c = new Crayon(g, seeded(hash(same)));
  const part = (name: string, draw: () => void) => {
    c.r = seeded(hash(`${same}|${name}`));
    draw();
  };
  if (view === 'front') part('cape', () => cape(c, a));
  if (view === 'front') part('hairBack', () => hairBack(c, a));
  part('legs', () => legs(c, a));
  part('body', () => body(c, a, view));
  if (view === 'back') part('cape', () => cape(c, a));
  part('collar', () => collar(c, a));
  part('head', () => head(c, a, view));
  part('hairFront', () => hairFront(c, a, view));
  part('extras', () => extras(c, a, view));
  const url = cv.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

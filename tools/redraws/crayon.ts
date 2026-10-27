/**
 * Drawing like the little artist: the kit for the Bestioles redrawn in code in her style (her own
 * drawings are kept as the originals, in the credits and the museum).
 *
 * What her drawings look like, and what this kit copies:
 * - colouring with coloured pencils: thin strokes packed close together, mostly in one direction
 *   for a whole part, gone over a second time across in places (darker patches), little white specks
 *   of paper, and colour running a bit past the line;
 * - one thin graphite outline (or a black felt-tip one), with a slow wobble and ends that don't
 *   quite meet;
 * - lopsided shapes, stick legs, zig-zag fur, oval eyes filled with colour.
 *
 * Parts are drawn whole, one after the other, so what is in front hides what is behind.
 *
 * A part that moves in battle (a wing, a trunk) is drawn inside `c.part(name, { pivot, motion… }, () => …)`:
 * the card keeps it, and `npm run redraws` also cuts it out on its own for the battle rig, over (or with
 * `behind`, under) the rest. An `extra` part is only in the rig (sparks, closed eyelids): draw it last, so
 * the card's random strokes stay the same.
 */
import type { PartMove } from '../../src/data/rigs.ts';

export type P = [number, number];
export const GRAPHITE = '#3f3b46';
export const FELT = '#27232d';
export const PAPER = '#f7f3ea';

export type Crayon = ReturnType<typeof crayon>;

/** A moving part, as drawn: its name and pivot (drawing coordinates), how it moves, where it sits. */
export interface PartDef extends PartMove {
  name: string;
  pivot: P;
  behind?: boolean;
  extra?: boolean;
}

/** What `svg()` draws: the card, the rig's body without its moving parts, or one part alone. */
export type View = 'card' | 'base' | { part: string };

export interface Colour {
  /** Main stroke direction in degrees (90 = up and down). */
  angle?: number;
  /** Distance between strokes (px). */
  gap?: number;
  /** Stroke width (px). */
  w?: number;
  /** How hard she pressed: 0.6 light, 1 normal, 1.3 hard. */
  press?: number;
  /** Share of the strokes she skipped (white paper left). */
  miss?: number;
  /** Second layer across the first, in part of the shape (0 none, 1 everywhere). */
  over?: number;
  /** How far the colour runs past the line (px). */
  spill?: number;
  /** Strength of the light wash of colour under the strokes (0 for loose scribbles). */
  wash?: number;
}

export interface Line {
  w?: number;
  felt?: boolean;
  /** Outline colour when it isn't graphite (eyes in red pencil…). */
  col?: string;
}

export function crayon(seed0: number, style: { felt?: boolean } = {}) {
  let seed = seed0;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const j = (n: number) => (rnd() - 0.5) * n;
  const r1 = (n: number) => Math.round(n * 10) / 10;

  function smooth(pts: P[], closed: boolean): string {
    const n = pts.length;
    const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
    }
    return closed ? d + 'Z' : d;
  }
  /** Points along the smooth curve through `pts` (so a wobble can follow curves, not straight sides). */
  function curve(pts: P[], closed: boolean, per = 6): P[] {
    const n = pts.length;
    const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    const out: P[] = [];
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  /** Straight segments, for sharp corners (spikes, zig-zag fur). */
  const sharp = (pts: P[], closed: boolean) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + (closed ? 'Z' : '');

  const potato = (cx: number, cy: number, rx: number, ry: number, n = 10, mess = 0.08): P[] => {
    const a0 = rnd() * 6;
    return Array.from({ length: n }, (_, i) => {
      const a = a0 + (i / n) * Math.PI * 2 + j(0.15);
      return [cx + Math.cos(a) * rx * (1 + j(mess * 2)), cy + Math.sin(a) * ry * (1 + j(mess * 2))];
    });
  };
  const shake = (pts: P[], n: number): P[] => pts.map(([x, y]) => [x + j(n), y + j(n)]);
  /** A slow wobble along a path, like a hand that isn't quite steady (no jitter). */
  const wobble = (pts: P[], amp: number): P[] => {
    const f1 = 0.2 + rnd() * 0.3, f2 = 0.5 + rnd() * 0.5, ph = rnd() * 6;
    return pts.map(([x, y], i) => [x + Math.sin(i * f1 + ph) * amp, y + Math.cos(i * f2 + ph) * amp * 0.8]);
  };
  /** Extra points along each side so long sides wobble too, corners stay corners. */
  const densify = (pts: P[], step = 40, closed = true): P[] => {
    const out: P[] = [];
    const n = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const k = Math.max(1, Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) / step));
      for (let s = 0; s < k; s++) out.push([p[0] + ((q[0] - p[0]) * s) / k, p[1] + ((q[1] - p[1]) * s) / k]);
    }
    if (!closed) out.push(pts[pts.length - 1]);
    return out;
  };
  /** The outline of a thick line along a path (legs, tails, arms), from width w0 to w1. */
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
  /** Zig-zag spikes along a path, pointing to its left (fur, flames, fringes). */
  function spikes(path: P[], n: number, h: number): P[] {
    const out: P[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const [a, b] = [path[i], path[i + 1]];
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
      for (let k = 0; k < n; k++) {
        const hh = h * (0.6 + rnd() * 0.8), lean = j(0.3);
        out.push([a[0] + (b[0] - a[0]) * (k / n), a[1] + (b[1] - a[1]) * (k / n)]);
        const t = (k + 0.5 + lean) / n;
        out.push([a[0] + (b[0] - a[0]) * t + (nx / l) * hh, a[1] + (b[1] - a[1]) * t + (ny / l) * hh]);
      }
    }
    out.push(path[path.length - 1]);
    return out;
  }
  /** Pushes a closed shape out (or in) by d pixels. */
  function grow(pts: P[], d: number): P[] {
    const n = pts.length;
    let area = 0;
    for (let i = 0; i < n; i++) area += pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1];
    const s = area > 0 ? 1 : -1;
    return pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      return [p[0] + (dy / l) * d * s, p[1] - (dx / l) * d * s];
    });
  }

  let defs = '', seq = '', ids = 0;
  // the drawing in pieces, each with the moving part it belongs to (if any)
  const chunks: { part?: string; svg: string }[] = [];
  const parts: PartDef[] = [];
  let inPart: string | undefined;
  const cut = () => {
    if (seq) chunks.push({ part: inPart, svg: seq });
    seq = '';
  };

  /** Coloured-pencil colouring of a shape (no outline). */
  function colour(shape: P[], col: string, o: Colour = {}, round = true): string {
    const id = `c${ids++}`;
    const clip = grow(shape, o.spill ?? 4 + rnd() * 4);
    defs += `<clipPath id='${id}'><path d='${round ? smooth(clip, true) : sharp(clip, true)}'/></clipPath>`;
    const xs = shape.map((p) => p[0]), ys = shape.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 12;
    const press = o.press ?? 1;
    let s = '';
    const layer = (deg: number, gap: number, w: number, alpha: number, from: number, to: number, miss: number) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.cos(a), Math.sin(a)], v: P = [-u[1], u[0]];
      // back-and-forth strokes, cut into runs of a few strokes with their own pressure
      let run: P[] = [];
      let side = rnd() < 0.5 ? 1 : -1;
      const flush = () => {
        if (run.length > 1 && rnd() > miss) {
          const op = Math.min(1, alpha * (0.65 + rnd() * 0.5));
          s += `<path d='${sharp(run, false)}' fill='none' stroke='${col}' stroke-width='${r1(w * (0.8 + rnd() * 0.45))}' stroke-opacity='${r1(op * 100) / 100}' stroke-linejoin='round' stroke-linecap='round'/>`;
        }
        run = run.slice(-1);
      };
      for (let k = from; k < to; k += gap * (0.6 + rnd() * 0.8)) {
        const reach = R * (0.85 + rnd() * 0.3);
        const drift = j(0.12);
        run.push([cx + v[0] * k + u[0] * side * reach + v[0] * drift * reach, cy + v[1] * k + u[1] * side * reach + v[1] * drift * reach]);
        side = -side;
        if (run.length > 5 + rnd() * 8) flush();
      }
      flush();
    };
    const deg = o.angle ?? 70 + j(40);
    layer(deg, o.gap ?? 3.8, o.w ?? 5.2, 0.85 * press, -R, R, o.miss ?? 0.05);
    // over a part of it, a second pass across, pressed harder
    const over = o.over ?? 0.45;
    if (over > 0) {
      const span = 2 * R * over, from = -R + rnd() * (2 * R - span);
      layer(deg + 25 + j(30), (o.gap ?? 3.8) * 1.7, (o.w ?? 5.2) * 0.9, 0.75 * press, from, from + span, 0.15);
    }
    // a light wash of the colour under the strokes: her strokes overlap, little paper shows
    const wash = `<path d='${round ? smooth(shape, true) : sharp(shape, true)}' fill='${col}' opacity='${r1((o.wash ?? 0.38) * press * 100) / 100}'/>`;
    return `<path d='${round ? smooth(shape, true) : sharp(shape, true)}' fill='${PAPER}'/><g clip-path='url(#${id})' filter='url(#grain)'>${wash}${s}</g>`;
  }

  /** A pencil (or felt-tip) line: one pass, a slow wobble, ends that miss each other a little. */
  function line(pts: P[], closed: boolean, o: Line = {}, round = true): string {
    const felt = o.felt ?? style.felt;
    let p = wobble(round ? curve(pts, closed) : densify(pts, 24, closed), felt ? 1.8 : 2.6);
    if (closed) {
      const k = Math.floor(rnd() * p.length);
      p = [...p.slice(k), ...p.slice(0, k)];
      // back to the start: over it a little, or not quite
      const a = p[0], b = p[1];
      p.push(rnd() < 0.6 ? [a[0] + (b[0] - a[0]) * 0.35 + j(5), a[1] + (b[1] - a[1]) * 0.35 + j(5)] : [a[0] + j(7), a[1] + j(7)]);
    }
    const w = r1((o.w ?? (felt ? 6.5 : 5)) * (0.9 + rnd() * 0.2));
    const col = o.col ?? (felt ? FELT : GRAPHITE);
    const path = `<path d='${sharp(p, false)}' fill='none' stroke='${col}' stroke-width='${w}' stroke-opacity='${felt ? 0.95 : 0.9}' stroke-linecap='round' stroke-linejoin='round'/>`;
    return felt ? path : `<g filter='url(#lead)'>${path}</g>`;
  }

  return {
    rnd, j, potato, shake, wobble, densify, band, spikes, grow, smooth,
    /** A coloured part with its outline. `round: false` keeps sharp corners (spikes). */
    shape(pts: P[], col: string, o: Colour = {}, l: Line = {}, round = true) {
      seq += colour(pts, col, o, round) + line(pts, true, l, round);
    },
    /** A part left white (paper), with its outline: wings, a collar of fur… */
    paper(pts: P[], l: Line = {}, round = true) {
      seq += `<path d='${round ? smooth(pts, true) : sharp(pts, true)}' fill='${PAPER}'/>` + line(pts, true, l, round);
    },
    /** Colour with no outline (a glow, cheeks, a bit of shading). */
    tint(pts: P[], col: string, o: Colour = {}) {
      seq += colour(pts, col, { over: 0, spill: 0, ...o }).replace(/<path d='[^']*' fill='#f7f3ea'\/>/, '');
    },
    /** An open line (a mouth, a whisker, an antenna, fur marks). */
    stroke(pts: P[], l: Line = {}, round = true) {
      seq += line(pts, false, l, round);
    },
    /** A filled pencil blob (pupils, nose). */
    dot(x: number, y: number, rx: number, ry = rx, col = style.felt ? FELT : GRAPHITE) {
      seq += `<g${style.felt ? '' : ` filter='url(#lead)'`}><ellipse cx='${r1(x + j(3))}' cy='${r1(y + j(3))}' rx='${rx}' ry='${ry}' fill='${col}' transform='rotate(${r1(j(20))} ${x} ${y})'/></g>`;
    },
    /** Raw SVG on top. */
    raw(svg: string) {
      seq += svg;
    },
    /**
     * A part that moves in battle (see the top of this file). A part drawn in several goes (bits behind and
     * in front of something else) is called again with the same name; its first description counts.
     */
    part(name: string, def: Omit<PartDef, 'name'>, draw: () => void) {
      cut();
      inPart = name;
      draw();
      cut();
      inPart = undefined;
      if (!parts.some((p) => p.name === name)) parts.push({ name, ...def });
    },
    /** The moving parts drawn so far. */
    parts: () => parts,
    /** The whole drawing on a see-through sheet, tilted a little around (cx, cy); or a `view` of it for the battle rig. */
    svg(W: number, H: number, tilt = 0, cx = W / 2, cy = H / 2, view: View = 'card'): string {
      cut();
      const extra = new Set(parts.filter((p) => p.extra).map((p) => p.name));
      const body = chunks.filter((k) => (view === 'card' ? !k.part || !extra.has(k.part) : view === 'base' ? !k.part : k.part === view.part))
        .map((k) => k.svg).join('');
      return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><defs>${defs}`
        // paper tooth: white specks where the pencil skipped over the grain
        + `<filter id='grain' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' seed='${seed0 % 97}' result='n'/>`
        + `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -5 3.85' result='m'/><feComposite in='SourceGraphic' in2='m' operator='in'/></filter>`
        + `<filter id='lead' x='-2%' y='-2%' width='104%' height='104%'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${(seed0 + 5) % 97}' result='n'/>`
        + `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.5' result='m'/><feComposite in='SourceGraphic' in2='m' operator='in'/></filter>`
        + `</defs><g transform='rotate(${r1(tilt)} ${cx} ${cy})'>${body}</g></svg>`;
    },
  };
}

/** One Bestiole redrawn in her style. */
export interface Redraw {
  id: string;
  slug: string;
  seed: number;
  /** Black felt-tip lines instead of graphite. */
  felt?: boolean;
  size: [number, number];
  tilt?: number;
  draw(c: Crayon): void;
}

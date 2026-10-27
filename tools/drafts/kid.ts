/**
 * Drawing like a 6-year-old in five minutes, for the « brouillons »: Bestioles drawn in code while
 * the little artist hasn't drawn them yet. Potato shapes, pencil lines gone over twice that don't
 * quite close, quick zig-zag colouring that misses bits and runs over the lines.
 *
 * Two ways to draw: by default every colour goes down first and every line on top (lines cross
 * each other, like a quick sketch); `layered` draws part by part, so front parts hide back ones.
 * A layered drawing can have moving parts for its battle rig, like the crayon kit's (`k.part()`).
 */
import type { PartDef, View } from '../redraws/crayon.ts';

export type P = [number, number];
export const PENCIL = '#2e2a35';

export type Kid = ReturnType<typeof kid>;

export function kid(seed0: number, opts: { layered?: boolean } = {}) {
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
  const potato = (cx: number, cy: number, rx: number, ry: number, n = 9, mess = 0.16): P[] => {
    const a0 = rnd() * 6;
    return Array.from({ length: n }, (_, i) => {
      const a = a0 + (i / n) * Math.PI * 2 + j(0.25);
      return [cx + Math.cos(a) * rx * (1 + j(mess * 2)), cy + Math.sin(a) * ry * (1 + j(mess * 2))];
    });
  };
  const shake = (pts: P[], n: number): P[] => pts.map(([x, y]) => [x + j(n), y + j(n)]);
  /** Extra points along each side, so the smooth curve keeps its corners (flames, spikes). */
  const densify = (pts: P[], n = 3): P[] => pts.flatMap((p, i) => {
    const q = pts[(i + 1) % pts.length];
    return Array.from({ length: n }, (_, k) => [p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n] as P);
  });

  let defs = '', ids = 0, colours = '', lines = '', seq = '';
  // the drawing in pieces, each with the moving part it belongs to (layered drawings only, see crayon.ts)
  const chunks: { part?: string; svg: string }[] = [];
  const parts: PartDef[] = [];
  let inPart: string | undefined;
  const cut = () => {
    if (seq) chunks.push({ part: inPart, svg: seq });
    seq = '';
  };
  /** A part that moves in battle (as in the crayon kit). */
  function part(name: string, def: Omit<PartDef, 'name'>, draw: () => void) {
    if (!opts.layered) throw new Error(`moving part ${name}: the drawing must be layered`);
    cut();
    inPart = name;
    draw();
    cut();
    inPart = undefined;
    if (!parts.some((p) => p.name === name)) parts.push({ name, ...def });
  }
  // the sheet's little extra tilt, drawn once: the card and the rig's pieces line up
  let jitter: number | undefined;
  const tiltOf = (tilt: number) => r1(tilt + (jitter ??= j(4)));
  // layered: each part is drawn whole, in order, so what is in front hides what is behind
  const put = (kind: 'c' | 'l', svg: string) => {
    if (opts.layered) seq += svg;
    else if (kind === 'c') colours += svg;
    else lines += svg;
  };
  function line(pts: P[], closed = false, w = 7): string {
    let p = shake(pts, 10);
    if (closed) {
      const k = Math.floor(rnd() * p.length);
      p = [...p.slice(k), ...p.slice(0, k)];
      const a = p[0], b = p[1];
      p.push(rnd() < 0.5 ? [a[0] + j(18), a[1] + j(18)] : [a[0] - (b[0] - a[0]) * 0.4 + j(8), a[1] - (b[1] - a[1]) * 0.4 + j(8)]);
    }
    let s = `<path d='${smooth(p, false)}' fill='none' stroke='${PENCIL}' stroke-width='${r1(w * (0.85 + rnd() * 0.35))}' stroke-linecap='round' stroke-linejoin='round'/>`;
    if (rnd() < 0.55) s += `<path d='${smooth(shake(p.slice(0, Math.max(2, Math.ceil(p.length * (0.4 + rnd() * 0.6)))), 9), false)}' fill='none' stroke='${PENCIL}' stroke-width='${r1(w * 0.6)}' stroke-opacity='.8' stroke-linecap='round'/>`;
    return `<g filter='url(#lead)'>${s}</g>`;
  }
  type Fill = { angle?: number; gap?: number; w?: number; miss?: number; wash?: number };
  function scribble(shape: P[], col: string, o: Fill = {}): string {
    const id = `c${ids++}`;
    const cx = shape.reduce((s, p) => s + p[0], 0) / shape.length, cy = shape.reduce((s, p) => s + p[1], 0) / shape.length;
    const big = shape.map(([x, y]) => [cx + (x - cx) * 1.06 + j(10), cy + (y - cy) * 1.06 + j(10)] as P);
    defs += `<clipPath id='${id}'><path d='${smooth(big, true)}'/></clipPath>`;
    const a = ((o.angle ?? -60 + j(30)) * Math.PI) / 180, u: P = [Math.cos(a), Math.sin(a)], v: P = [-u[1], u[0]];
    const xs = shape.map((p) => p[0]), ys = shape.map((p) => p[1]);
    const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 20;
    let s = '';
    for (let pass = 0; pass < 2; pass++) {
      const pts: P[] = [];
      const from = -R + rnd() * R * 0.25, to = R - rnd() * R * (o.miss ?? 0.25);
      for (let k = from, side = 1; k < to; k += (o.gap ?? 16) * (0.6 + rnd() * 0.9), side = -side) {
        const reach = R * (0.75 + rnd() * 0.4);
        pts.push([cx + v[0] * k + u[0] * side * reach + j(20), cy + v[1] * k + u[1] * side * reach + j(20)]);
      }
      let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
      for (const p of pts.slice(1)) d += `L${r1(p[0])} ${r1(p[1])}`;
      s += `<path d='${d}' fill='none' stroke='${col}' stroke-width='${r1((o.w ?? 13) * (pass ? 0.7 : 1))}' stroke-opacity='${pass ? 0.55 : 0.8}' stroke-linejoin='round' stroke-linecap='round'/>`;
    }
    return `<g clip-path='url(#${id})' filter='url(#grain)'>${s}</g>`;
  }
  /** A coloured part: its colouring, then its outline (sometimes gone round twice). */
  const shape = (pts: P[], col: string, o: Fill = {}, w = 6.8) => {
    if (opts.layered) put('c', `<path d='${smooth(pts, true)}' fill='#f7f3ea'/><path d='${smooth(pts, true)}' fill='${col}' opacity='${o.wash ?? 0.45}' filter='url(#grain)'/>`);
    put('c', scribble(pts, col, { gap: 19, w: 13, miss: 0.3, ...o }));
    put('l', line(pts, true, w));
    if (rnd() < 0.6) put('l', line(pts, true, w * 0.7));
  };
  /** Just colour, no outline (fire, water). */
  const colourOnly = (pts: P[], col: string, o: Fill = {}) => { put('c', scribble(pts, col, { gap: 15, w: 13, miss: 0.1, ...o })); };
  const stroke = (pts: P[], w = 6.5) => { put('l', line(pts, false, w * 1.15)); };
  /** Solid pencil blobs (eyes, nostrils). */
  const dot = (x: number, y: number, rx: number, ry = rx, rot = 0) => {
    put('l', `<g filter='url(#lead)'><ellipse cx='${r1(x + j(6))}' cy='${r1(y + j(6))}' rx='${rx}' ry='${ry}' fill='${PENCIL}' transform='rotate(${rot} ${x} ${y})'/></g>`);
  };
  const raw = (svg: string, under = false) => put(under ? 'c' : 'l', svg);
  /** Round lobes pushed out along a path (waves, fluff, clouds, petals). */
  function bumps(path: P[], n: number, h: number): P[] {
    const out: P[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const [a, b] = [path[i], path[i + 1]];
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
      for (let k = 0; k < n; k++) {
        const hh = h * (0.7 + rnd() * 0.6);
        for (const [f, up] of [[0, 0], [0.18, 0.7], [0.5, 1], [0.82, 0.7]] as P[]) {
          const t = (k + f) / n;
          out.push([a[0] + (b[0] - a[0]) * t + (nx / l) * hh * up, a[1] + (b[1] - a[1]) * t + (ny / l) * hh * up]);
        }
      }
    }
    out.push(path[path.length - 1]);
    return out;
  }
  /** Zig-zag spikes along a path, all pointing to one side. */
  function spikes(path: P[], n: number, h: number): P[] {
    const out: P[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const [a, b] = [path[i], path[i + 1]];
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
      for (let k = 0; k < n; k++) {
        const hh = h * (0.7 + rnd() * 0.6);
        out.push([a[0] + (b[0] - a[0]) * (k / n), a[1] + (b[1] - a[1]) * (k / n)]);
        out.push([a[0] + (b[0] - a[0]) * ((k + 0.5) / n) + (nx / l) * hh, a[1] + (b[1] - a[1]) * ((k + 0.5) / n) + (ny / l) * hh]);
      }
    }
    out.push(path[path.length - 1]);
    return out;
  }
  /** The outline of a thick line along a path (tails, snakes, arms), from width w0 to w1. */
  function band(path: P[], w0: number, w1 = w0): P[] {
    const a: P[] = [], b: P[] = [];
    path.forEach((p, i) => {
      const q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)];
      const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1, w = w0 + ((w1 - w0) * i) / Math.max(1, path.length - 1);
      a.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]);
      b.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
    });
    return [...a, ...b.reverse()];
  }
  /** Straight-ish polygon with sharp corners (spikes) drawn with the pencil. */
  const sharpLine = (pts: P[], w = 6) => {
    let d = '';
    for (const [x, y] of shake(pts, 6)) d += `${d ? 'L' : 'M'}${r1(x)} ${r1(y)}`;
    put('l', `<g filter='url(#lead)'><path d='${d}' fill='none' stroke='${PENCIL}' stroke-width='${w}' stroke-linejoin='round' stroke-linecap='round'/></g>`);
  };

  /** The whole drawing, on paper, tilted a little around (cx, cy) and moved by (dx, dy). */
  function svg(W: number, H: number, tilt = 0, cx = W / 2, cy = H / 2, dx = 0, dy = 0, view: View = 'card'): string {
    cut();
    const extra = new Set(parts.filter((p) => p.extra).map((p) => p.name));
    const body = chunks.filter((k) => (view === 'card' ? !k.part || !extra.has(k.part) : view === 'base' ? !k.part : k.part === view.part))
      .map((k) => k.svg).join('');
    return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><defs>${defs}`
      + `<filter id='grain' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3' result='n'/>`
      + `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6' result='m'/><feComposite in='SourceGraphic' in2='m' operator='in'/></filter>`
      + `<filter id='lead' x='-2%' y='-2%' width='104%' height='104%'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' seed='9' result='n'/>`
      + `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2 1.75' result='m'/><feComposite in='SourceGraphic' in2='m' operator='in'/></filter>`
      + `</defs><rect width='${W}' height='${H}' fill='#f7f3ea'/><g transform='translate(${dx} ${dy}) rotate(${tiltOf(tilt)} ${cx} ${cy})'>${colours}${lines}${body}</g></svg>`;
  }
  const outline = (pts: P[], closed: boolean, w: number) => put('l', line(pts, closed, w));
  return { rnd, j, potato, shake, densify, band, shape, colourOnly, stroke, outline, dot, raw, bumps, spikes, sharpLine, svg, smooth, part, parts: () => parts, tiltOf };
}

/** One brouillon: where its card goes, how it is drawn and framed. */
export interface Draft {
  id: string;
  slug: string;
  seed: number;
  layered?: boolean;
  size: [number, number];
  /** Tilt (degrees) around `pivot`, then moved by `offset`, so the drawing fits its sheet. */
  tilt: number;
  pivot: P;
  offset?: P;
  draw(k: Kid): void;
}

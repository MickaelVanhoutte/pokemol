/**
 * The hand-drawn look of the interface, drawn once at start-up as SVG data URIs in CSS custom
 * properties on <html>:
 * - `--pencil-frame`, `--frame-<colour>`: hand-drawn pencil rectangles (two passes, crossing at the
 *   corners) used as 9-slice border images with `stretch` (tiled SVG borders leave a gap in Chrome),
 *   so a long box gets long, calm waves;
 * - `--hatch-<colour>`: coloured-pencil strokes on a seamless tile, for fills;
 * - `--blob-<colour>`: a sketched round button (A/B, cursor dots…), outline and hatching included;
 * - `--rule`: a wobbly pencil line that tiles horizontally (panel edges, separators).
 * Everything is seeded, so the lines are the same at every start.
 */

import { TYPES } from '../../data/types';

export const INK = '#2b2536';
/** Pencil lead: a soft grey, not ink. */
export const GRAPHITE = '#4d4858';

/** Paper grain: noise eats into what it is applied to, like a pencil on rough paper. */
const grain = (id: string, freq: number, seed: number) =>
  `<filter id='${id}' x='-5%' y='-5%' width='110%' height='110%'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' seed='${seed}' result='n'/>`
  + `<feColorMatrix in='n' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.5' result='m'/><feComposite in='SourceGraphic' in2='m' operator='in'/></filter>`;

/** Pastel crayons: base fill, then the darker shade its hatching is drawn with. */
export const PASTELS = {
  paper: ['#fffaf0', '#d9c9a6'],
  pink: ['#fcd6e0', '#ee9db6'],
  coral: ['#fbc4bc', '#ec8f84'],
  peach: ['#fde0c2', '#f1ad73'],
  butter: ['#fdf0b8', '#ecc85a'],
  mint: ['#d3f0d3', '#8ccc94'],
  sky: ['#d3e7f8', '#8ebde6'],
  lavender: ['#e5daf6', '#ae97dd'],
} as const;
export type Pastel = keyof typeof PASTELS;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n: number) => Math.round(n * 10) / 10;
export const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** A periodic wobble (period `len`, starting at `from`): a few sine waves with random phases. */
function wobble(r: () => number, amp: number, len: number, from: number) {
  const waves = [1, 2, 3].map((k) => ({ k, a: amp * (0.9 / k) * (0.5 + r()), p: r() * Math.PI * 2 }));
  return (t: number) => waves.reduce((s, w) => s + w.a * Math.sin((2 * Math.PI * w.k * (t - from)) / len + w.p), 0);
}

export interface FrameOptions {
  /** SVG size and the 9-slice cut (CSS: `border-image: <frame> <slice> / <width> round`). */
  size?: number;
  slice?: number;
  /** Distance of the line from the outer edge, stroke width and wobble, in SVG units. */
  inset?: number;
  weight?: number;
  amp?: number;
  ink?: string;
}

/** A pencil rectangle filled with `fill` inside its line (the border area of the box). */
export function frame(seed: number, fill: string, o: FrameOptions = {}): string {
  const S = o.size ?? 200, C = o.slice ?? 24, b = o.inset ?? 7, w = o.weight ?? 4.2, amp = o.amp ?? 1.5, ink = o.ink ?? GRAPHITE;
  const L = S - 2 * C;
  const r = rng(seed);
  // each side: position along it (t) → distance from its edge
  const sides = [0, 1, 2, 3].map(() => ({ main: wobble(r, amp, L, C), second: wobble(r, amp, L, C), light: wobble(r, amp * 1.3, L, C), shift: 1.4 + r() * 1.4, gap: (r() - 0.5) * 2.4 }));
  const pt = (side: number, t: number, d: number): [number, number] =>
    side === 0 ? [t, d] : side === 1 ? [S - d, t] : side === 2 ? [S - t, S - d] : [d, S - t];
  const seg = 8;
  const segs = L / seg;
  let strokes = '';
  for (let s = 0; s < 4; s++) {
    const { main, second, light, shift, gap } = sides[s];
    // the line overshoots its corners a little, like a quick pencil stroke
    const t0 = 1 + r() * 4, t1 = S - 1 - r() * 4;
    // pressure changes along the line; it repeats with the middle slice, so the edge has no seam
    const look: { w: number; o: number }[] = Array.from({ length: segs }, () => ({ w: w * (0.75 + r() * 0.3), o: 0.72 + r() * 0.28 }));
    const lookAt = (t: number) => (t >= C && t < S - C ? look[Math.floor((t - C) / seg) % segs] : { w: w * (0.75 + r() * 0.3), o: 0.72 + r() * 0.28 });
    // the lead lifts off at both ends
    const taper = (t: number) => Math.min(1, 0.35 + Math.min(t - t0, t1 - t) / 18);
    for (let t = t0; t < t1; t += seg) {
      const e = Math.min(t + seg + 0.6, t1);
      const a = pt(s, t, b + main(t)), m = pt(s, (t + e) / 2, b + main((t + e) / 2)), z = pt(s, e, b + main(e));
      const { w: sw, o } = lookAt(t);
      strokes += `<path d='M${f1(a[0])} ${f1(a[1])}Q${f1(m[0])} ${f1(m[1])} ${f1(z[0])} ${f1(z[1])}' stroke-width='${f1(sw * taper(t))}' stroke-opacity='${f1(o * 100) / 100}'/>`;
    }
    // a second stroke over the first, never quite on it
    let d2 = '';
    const v0 = t0 + 2 + r() * 8, v1 = t1 - 2 - r() * 8;
    for (let t = v0; t <= v1; t += 4) {
      const p = pt(s, Math.min(t, v1), b + gap + second(t) * 0.8);
      d2 += `${d2 ? 'L' : 'M'}${f1(p[0])} ${f1(p[1])}`;
    }
    strokes += `<path d='${d2}' stroke-width='${f1(w * 0.55)}' stroke-opacity='.5'/>`;
    // second, lighter pass
    let d = '';
    const u0 = 3 + r() * 6, u1 = S - 3 - r() * 6;
    for (let t = u0; t <= u1; t += 4) {
      const p = pt(s, Math.min(t, u1), b + shift + light(t));
      d += `${d ? 'L' : 'M'}${f1(p[0])} ${f1(p[1])}`;
    }
    strokes += `<path d='${d}' stroke-width='${f1(w * 0.35)}' stroke-opacity='.3'/>`;
  }
  // the paper inside the line
  let fillPath = '';
  for (let s = 0; s < 4; s++) {
    for (let t = b; t < S - b; t += 4) {
      const p = pt(s, t, b + sides[s].main(t) + w * 0.3);
      fillPath += `${fillPath ? 'L' : 'M'}${f1(p[0])} ${f1(p[1])}`;
    }
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${S}' height='${S}' viewBox='0 0 ${S} ${S}'><defs>${grain('g', 0.6, seed % 97)}</defs>`
    + `<path d='${fillPath}Z' fill='${fill}'/>`
    + `<g fill='none' stroke='${ink}' stroke-linecap='round' stroke-linejoin='round' filter='url(#g)'>${strokes}</g></svg>`;
}

/** Coloured-pencil strokes on a seamless square tile. */
export function hatch(seed: number, color: string, o: { size?: number; strokes?: number; angle?: number; opacity?: number } = {}): string {
  const S = o.size ?? 72, n = o.strokes ?? 30, base = ((o.angle ?? -58) * Math.PI) / 180, op = o.opacity ?? 1;
  const r = rng(seed);
  let paths = '';
  for (let i = 0; i < n; i++) {
    const x = r() * S, y = r() * S, len = 9 + r() * 20, a = base + (r() - 0.5) * 0.25, bend = (r() - 0.5) * 3;
    const dx = (Math.cos(a) * len) / 2, dy = (Math.sin(a) * len) / 2;
    const sw = f1(0.9 + r() * 1.4), so = f1((0.22 + r() * 0.38) * op * 100) / 100;
    // copies across the edges keep the tile seamless
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      const cx = x + ox, cy = y + oy;
      if (cx + Math.abs(dx) < -2 || cx - Math.abs(dx) > S + 2 || cy + Math.abs(dy) < -2 || cy - Math.abs(dy) > S + 2) continue;
      paths += `<path d='M${f1(cx - dx)} ${f1(cy - dy)}q${f1(dx + bend)} ${f1(dy - bend)} ${f1(dx * 2)} ${f1(dy * 2)}' stroke-width='${sw}' stroke-opacity='${so}'/>`;
    }
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${S}' height='${S}'><defs>${grain('g', 0.7, seed % 97)}</defs><g fill='none' stroke='${color}' stroke-linecap='round' filter='url(#g)'>${paths}</g></svg>`;
}

/** A sketched round button: an uneven disc coloured in with hatching, outlined twice. */
export function blob(seed: number, fill: string, shade: string): string {
  const S = 64, R = 27.5, r = rng(seed);
  const edge = wobble(r, 1.2, Math.PI * 2, 0), edge2 = wobble(r, 1.4, Math.PI * 2, 0);
  const ring = (rad: (t: number) => number, from: number, to: number) => {
    let d = '';
    for (let t = from; t <= to; t += 0.12) d += `${d ? 'L' : 'M'}${f1(S / 2 + Math.cos(t) * rad(t))} ${f1(S / 2 + Math.sin(t) * rad(t))}`;
    return d;
  };
  const start = r() * Math.PI * 2;
  let strokes = '';
  for (let i = 0; i < 26; i++) {
    const x = 8 + r() * 48, y = 8 + r() * 48, len = 8 + r() * 14, a = -1 + (r() - 0.5) * 0.3;
    strokes += `<path d='M${f1(x)} ${f1(y)}l${f1(Math.cos(a) * len)} ${f1(Math.sin(a) * len)}' stroke-width='${f1(1.2 + r() * 1.4)}' stroke-opacity='${f1(0.3 + r() * 0.4)}'/>`;
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${S}' height='${S}' viewBox='0 0 ${S} ${S}'>`
    + `<defs><clipPath id='c'><path d='${ring((t) => R - 1 + edge(t), 0, Math.PI * 2)}Z'/></clipPath></defs>`
    + `<path d='${ring((t) => R + edge(t), 0, Math.PI * 2)}Z' fill='${fill}'/>`
    + `<defs>${grain('g', 0.8, seed % 97)}</defs>`
    + `<g clip-path='url(#c)' fill='none' stroke='${shade}' stroke-linecap='round' filter='url(#g)'>${strokes}</g>`
    + `<g fill='none' stroke='${GRAPHITE}' stroke-linecap='round' stroke-linejoin='round' filter='url(#g)'>`
    + `<path d='${ring((t) => R + edge(t), start, start + Math.PI * 2.12)}' stroke-width='2.6'/>`
    + `<path d='${ring((t) => R + 1.3 + edge2(t), start + 1, start + 1 + Math.PI * 1.7)}' stroke-width='1.1' stroke-opacity='.4'/></g></svg>`;
}

/** A wobbly pencil line that tiles horizontally (`repeat-x`, height 8px). */
export function rule(seed: number, o: { width?: number; weight?: number } = {}): string {
  const W = o.width ?? 240, H = 8, r = rng(seed);
  const a = wobble(r, 0.8, W, 0), b2 = wobble(r, 1, W, 0);
  let d1 = '', d2 = '';
  for (let x = 0; x <= W; x += 4) {
    d1 += `${d1 ? 'L' : 'M'}${x} ${f1(4 + a(x))}`;
    d2 += `${d2 ? 'L' : 'M'}${x} ${f1(5.2 + b2(x))}`;
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'><defs>${grain('g', 0.7, seed % 97)}</defs><g fill='none' stroke='${GRAPHITE}' stroke-linecap='round' filter='url(#g)'>`
    + `<path d='${d1}' stroke-width='${o.weight ?? 2.2}'/><path d='${d2}' stroke-width='1' stroke-opacity='.35'/></g></svg>`;
}

/** Draws the kit and publishes it as CSS custom properties. */
export function installSketch(root: HTMLElement = document.documentElement) {
  const set = (name: string, svg: string) => root.style.setProperty(name, svgUrl(svg));
  let seed = 11;
  for (const [name, [fill, shade]] of Object.entries(PASTELS)) {
    set(`--frame-${name}`, frame(seed++, fill));
    set(`--frame-thin-${name}`, frame(seed++, fill, { size: 120, slice: 16, inset: 5, weight: 6, amp: 1 }));
    set(`--hatch-${name}`, hatch(seed++, shade));
    set(`--blob-${name}`, blob(seed++, fill, shade));
  }
  // the paper itself gets a few faint strokes only
  set('--hatch-paper', hatch(97, PASTELS.paper[1], { strokes: 14, opacity: 0.55 }));
  // graphite shading over colours that are not one of the crayons (type tints, HP)
  set('--hatch-ink', hatch(98, GRAPHITE, { strokes: 22, opacity: 0.4 }));
  set('--pencil-frame', frame(5, PASTELS.paper[0]));
  set('--pencil-frame-2', frame(6, PASTELS.paper[0]));
  // gone over hard in dark lead: the selected move
  set('--pencil-frame-on', frame(8, PASTELS.paper[0], { ink: INK, weight: 11 }));
  // each type's own crayon, for move buttons
  for (const [id, t] of Object.entries(TYPES)) set(`--hatch-t-${id}`, hatch(seed++, t.color, { strokes: 24, opacity: 0.8 }));
  set('--rule', rule(3));
}

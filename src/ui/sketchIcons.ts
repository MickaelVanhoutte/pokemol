import { GRAPHITE, svgUrl } from './paper/sketch';

/**
 * Menu icons drawn like a quick pencil doodle in the margin: graphite lines gone over twice,
 * coloured in with pastel crayon. 48×48 SVGs, seeded so they never change. Item icons stay pixel
 * art (src/ui/icons.ts); these are for menu entries.
 */

type P = [number, number];

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

function doodle(seed: number) {
  const r = rng(seed);
  const j = (n: number) => (r() - 0.5) * n;
  let fills = '', lines = '';
  const path = (pts: P[], closed: boolean, wobble = 1) => {
    const q = pts.map(([x, y]) => [x + j(wobble), y + j(wobble)] as P);
    let d = `M${f1(q[0][0])} ${f1(q[0][1])}`;
    for (let i = 1; i < q.length; i++) {
      const [x0, y0] = q[i - 1], [x1, y1] = q[i];
      d += `Q${f1((x0 + x1) / 2 + j(wobble))} ${f1((y0 + y1) / 2 + j(wobble))} ${f1(x1)} ${f1(y1)}`;
    }
    return closed ? d + 'Z' : d;
  };
  /** A coloured shape: pastel fill, a few crayon strokes, a pencil outline gone over twice. */
  const shape = (pts: P[], fill: string, shade: string) => {
    const d = path(pts, true);
    fills += `<path d='${d}' fill='${fill}'/>`;
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    let strokes = '';
    for (let x = x0 - (y1 - y0); x < x1; x += 4 + r() * 2) strokes += `M${f1(x)} ${f1(y1)}l${f1(y1 - y0)} ${f1(y0 - y1)}`;
    const id = `c${seed}${Math.floor(r() * 1e6)}`;
    fills += `<clipPath id='${id}'><path d='${d}'/></clipPath><path d='${strokes}' clip-path='url(#${id})' stroke='${shade}' stroke-width='1.3' stroke-opacity='.55' fill='none'/>`;
    lines += `<path d='${d}' stroke-width='2.4'/><path d='${path(pts, true, 1.6)}' stroke-width='1' stroke-opacity='.45'/>`;
  };
  const line = (pts: P[], w = 2.2, col?: string) => {
    lines += `<path d='${path(pts, false)}' stroke-width='${w}'${col ? ` stroke='${col}'` : ''}/>`;
  };
  const circle = (cx: number, cy: number, rad: number, n = 10): P[] =>
    Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * rad, cy + Math.sin((i / n) * Math.PI * 2) * rad] as P);
  const svg = () => `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>${fills}`
    + `<g fill='none' stroke='${GRAPHITE}' stroke-linecap='round' stroke-linejoin='round'>${lines}</g></svg>`;
  return { shape, line, circle, svg, j };
}

const DRAW: Record<string, (seed: number) => string> = {
  // a red notebook with a white label
  dex: (s) => {
    const d = doodle(s);
    d.shape([[11, 7], [37, 6], [38, 41], [12, 42]], '#f6a3a3', '#e06a6a');
    d.shape([[17, 13], [32, 13], [32, 21], [17, 21]], '#fffaf0', '#d9c9a6');
    for (const y of [12, 20, 28, 36]) d.line([[8, y], [14, y]], 2);
    return d.svg();
  },
  // a Crayon-ball: yellow top, white bottom, a red button
  party: (s) => {
    const d = doodle(s);
    d.shape([[8, 24], [10, 14], [18, 8], [30, 8], [38, 14], [40, 24]], '#fdea8c', '#ecc85a');
    d.shape([[8, 24], [40, 24], [38, 34], [30, 40], [18, 40], [10, 34]], '#fffaf0', '#d9c9a6');
    d.shape(d.circle(24, 24, 5, 8), '#f4a093', '#e06a6a');
    return d.svg();
  },
  // a blue pencil case with its zip
  bag: (s) => {
    const d = doodle(s);
    d.shape([[6, 16], [42, 15], [41, 37], [7, 38]], '#a9cdf2', '#6fa8ea');
    d.line([[7, 23], [41, 22]], 2);
    d.shape([[30, 19], [36, 19], [36, 27], [30, 27]], '#fdea8c', '#ecc85a');
    return d.svg();
  },
  // a folded map with a dotted path and a cross
  carte: (s) => {
    const d = doodle(s);
    d.shape([[6, 11], [18, 7], [30, 11], [42, 7], [42, 38], [30, 42], [18, 38], [6, 42]], '#d3f0d3', '#8ccc94');
    d.line([[18, 8], [18, 38]], 1.4);
    d.line([[30, 12], [30, 41]], 1.4);
    for (const [x, y] of [[11, 33], [15, 28], [21, 26], [26, 22]]) d.line([[x, y], [x + 2, y - 1]], 2.2, '#e06a6a');
    d.line([[31, 15], [37, 21]], 2.6, '#e06a6a');
    d.line([[37, 15], [31, 21]], 2.6, '#e06a6a');
    return d.svg();
  },
  // a trainer card with a smiling face
  card: (s) => {
    const d = doodle(s);
    d.shape([[5, 12], [43, 11], [43, 37], [5, 38]], '#fdf0b8', '#ecc85a');
    d.shape(d.circle(16, 24, 6, 8), '#fde0c2', '#f1ad73');
    d.line([[13, 26], [16, 28], [19, 26]], 1.4);
    for (const y of [19, 25, 31]) d.line([[26, y], [38, y]], 1.8);
    return d.svg();
  },
  // an open notebook with a green tick
  save: (s) => {
    const d = doodle(s);
    d.shape([[5, 12], [23, 15], [23, 40], [5, 37]], '#fffaf0', '#d9c9a6');
    d.shape([[25, 15], [43, 12], [43, 37], [25, 40]], '#fffaf0', '#d9c9a6');
    for (const y of [21, 27, 33]) d.line([[9, y - 1], [19, y]], 1.2);
    d.line([[28, 26], [32, 32], [41, 18]], 3.2, '#3fae4e');
    return d.svg();
  },
  // a gear
  options: (s) => {
    const d = doodle(s);
    const pts: P[] = [];
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = i % 2 ? 13 : 18; pts.push([24 + Math.cos(a) * rr, 24 + Math.sin(a) * rr]); }
    d.shape(pts, '#e5daf6', '#ae97dd');
    d.shape(d.circle(24, 24, 5, 8), '#fffaf0', '#d9c9a6');
    return d.svg();
  },
  // a red cross
  close: (s) => {
    const d = doodle(s);
    d.line([[11, 11], [37, 37]], 5, '#e06a6a');
    d.line([[37, 11], [11, 37]], 5, '#e06a6a');
    d.line([[12, 12], [36, 36]], 1.6);
    d.line([[36, 12], [12, 36]], 1.6);
    return d.svg();
  },
  // a bicycle
  velo: (s) => {
    const d = doodle(s);
    d.shape(d.circle(12, 31, 8, 10), '#fffaf0', '#d9c9a6');
    d.shape(d.circle(36, 31, 8, 10), '#fffaf0', '#d9c9a6');
    d.line([[12, 31], [20, 19], [32, 19], [36, 31]], 2.4, '#e06a6a');
    d.line([[20, 19], [25, 31], [32, 19]], 2.4, '#e06a6a');
    d.line([[18, 15], [24, 15]], 2.4);
    d.line([[32, 19], [30, 13], [35, 12]], 2.4);
    return d.svg();
  },
  // a thumb up (a move that hits the foe's weak spot), its sleeve in mint
  thumb: (s) => {
    const d = doodle(s);
    d.shape([[4, 22], [13, 21], [14, 42], [4, 43]], '#bfe8c4', '#8ccc94');
    d.shape([[13, 23], [19, 21], [21, 13], [21, 6], [25, 4], [28, 8], [28, 16], [26, 21], [39, 21], [43, 25], [42, 31], [40, 39], [35, 42], [13, 41]], '#fde0c2', '#f1ad73');
    for (const y of [27, 32, 37]) d.line([[30, y], [41, y]], 1.6);
    return d.svg();
  },
};

const cache = new Map<string, string>();

/** The doodle for a menu entry, or null when there is none (then the pixel icon is used). */
export function sketchIconUrl(id: string): string | null {
  const draw = DRAW[id];
  if (!draw) return null;
  if (!cache.has(id)) cache.set(id, svgUrl(draw(id.length * 97 + id.charCodeAt(0))).slice(5, -2));
  return cache.get(id)!;
}

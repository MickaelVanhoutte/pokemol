/**
 * The air of a place, drawn over the map: petals and leaves drifting down, dust in the light of a cave,
 * fireflies at night, ink specks, eraser crumbs, glitter. Each speck's place comes from the time alone
 * (nothing is stored). They stay on the place: walking past them, they keep their spot on the map.
 */
export type AmbientKind = 'petals' | 'leaves' | 'motes' | 'fireflies' | 'ink' | 'crumbs' | 'glitter' | 'rain' | 'snow' | 'wind';

export const AMBIENT_KINDS: AmbientKind[] = ['petals', 'leaves', 'motes', 'fireflies', 'ink', 'crumbs', 'glitter', 'rain', 'snow', 'wind'];

/** How many specks of each kind are on screen (the weather's too: rain, snow, gusts of wind). */
export const AMBIENT_COUNT: Record<AmbientKind, number> = { petals: 28, leaves: 26, motes: 34, fireflies: 20, ink: 22, crumbs: 26, glitter: 22, rain: 64, snow: 40, wind: 14 };

const COLOURS: Record<AmbientKind, string[]> = {
  petals: ['#f7b6cf', '#fde3ec', '#f29ac8'],
  leaves: ['#7fb04a', '#c99a3a', '#a8c45a', '#d9783a'],
  motes: ['#fff6d8', '#f4e8c2'],
  fireflies: ['#fff3a0', '#e8ff9a'],
  ink: ['#2b2536', '#3a3a6a'],
  crumbs: ['#f4a3ba', '#d9cfc4', '#c9bfb2'],
  glitter: ['#fff6b8', '#ffd3ea', '#cfe8ff'],
  rain: ['#5a6f9c', '#7086b4'],
  snow: ['#ffffff', '#f1f6ff'],
  wind: ['#ffffff', '#f4f1ea'],
};

/** A fixed random number for speck `i` (the same every frame). */
const rnd = (i: number, k: number) => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const wrap = (v: number, span: number) => ((v % span) + span) % span;

export interface Speck { x: number; y: number; size: number; alpha: number; colour: string }

/**
 * Where speck `i` of a kind is at `t` seconds, on a view `w`×`h` whose corner is at (camX, camY) on the map.
 */
export function speckAt(kind: AmbientKind, i: number, t: number, w: number, h: number, camX: number, camY: number): Speck {
  const depth = 0.4 + rnd(i, 1) * 0.6;
  const spanX = w + 24, spanY = h + 24;
  // fixed on the map, not on the screen: the camera moving leaves them where they are
  const px = -camX, py = -camY;
  const colours = COLOURS[kind];
  const colour = colours[Math.floor(rnd(i, 2) * colours.length)];
  const x0 = rnd(i, 3) * spanX, y0 = rnd(i, 4) * spanY;
  switch (kind) {
    case 'petals': case 'leaves': case 'ink': case 'crumbs': {
      const fall = kind === 'leaves' ? 16 : kind === 'petals' ? 11 : kind === 'ink' ? 7 : 9;
      const drift = kind === 'ink' ? 1 : 5;
      const sway = Math.sin(t * (0.9 + rnd(i, 5)) + i) * (kind === 'leaves' ? 6 : 4);
      return {
        x: wrap(x0 + t * drift * depth + sway + px, spanX) - 12,
        y: wrap(y0 + t * fall * depth + py, spanY) - 12,
        size: kind === 'leaves' ? 2 : kind === 'ink' && rnd(i, 6) > 0.7 ? 2 : 1 + Math.round(rnd(i, 6)),
        alpha: kind === 'ink' ? 0.55 : 0.9,
        colour,
      };
    }
    case 'motes':
      return {
        x: wrap(x0 + Math.sin(t * 0.4 + i) * 6 + px, spanX) - 12,
        y: wrap(y0 - t * 3 * depth + py, spanY) - 12,
        size: 1,
        alpha: 0.35 + 0.35 * Math.sin(t * 1.3 + i * 2),
        colour,
      };
    case 'fireflies':
      return {
        x: wrap(x0 + Math.sin(t * 0.5 + i) * 14 + Math.sin(t * 1.7 + i * 3) * 4 + px, spanX) - 12,
        y: wrap(y0 + Math.cos(t * 0.4 + i * 2) * 10 + py, spanY) - 12,
        size: 2,
        // each one glows and fades on its own beat
        alpha: Math.max(0, Math.sin(t * (1.1 + rnd(i, 7)) + i * 5)),
        colour,
      };
    case 'glitter':
      return {
        x: wrap(x0 + px, spanX) - 12,
        y: wrap(y0 + py, spanY) - 12,
        size: 3,
        alpha: Math.max(0, Math.sin(t * (1.6 + rnd(i, 7)) + i * 4)) ** 3,
        colour,
      };
    // the weather: short slanted graphite strokes of rain, drifting paper flakes, gusts of wind
    case 'rain':
      return { x: wrap(x0 - t * 40 * depth + px, spanX) - 12, y: wrap(y0 + t * 170 * depth + py, spanY) - 12, size: 1, alpha: 0.85, colour };
    case 'snow':
      return { x: wrap(x0 + Math.sin(t * 0.8 + i) * 8 + t * 6 * depth + px, spanX) - 12, y: wrap(y0 + t * 22 * depth + py, spanY) - 12, size: 2, alpha: 0.95, colour };
    case 'wind':
      return { x: wrap(x0 + t * 110 * depth + px, spanX) - 12, y: wrap(y0 + Math.sin(t + i) * 4 + py, spanY) - 12, size: 1, alpha: 0.35 + 0.25 * Math.sin(t * 2 + i), colour };
  }
}

/** A darker shade of a #rrggbb colour, for a speck's edge (so it reads over the paper grain). */
function edge(c: string): string {
  if (!c.startsWith('#')) return c;
  const n = parseInt(c.slice(1), 16);
  const d = (v: number) => Math.round(v * 0.62);
  return `rgb(${d(n >> 16)}, ${d((n >> 8) & 255)}, ${d(n & 255)})`;
}

/** Draws a place's air over the map (screen pixels): little pixel shapes with a darker edge. */
export function drawAmbient(ctx: CanvasRenderingContext2D, kind: AmbientKind, w: number, h: number, camX: number, camY: number, t: number) {
  for (let i = 0; i < AMBIENT_COUNT[kind]; i++) {
    const s = speckAt(kind, i, t, w, h, camX, camY);
    if (s.alpha <= 0.02) continue;
    const x = Math.round(s.x), y = Math.round(s.y);
    const px = (dx: number, dy: number, c: string, a = s.alpha, ww = 1, hh = 1) => {
      ctx.globalAlpha = a;
      ctx.fillStyle = c;
      ctx.fillRect(x + dx, y + dy, ww, hh);
    };
    // which way it is turned now (petals and leaves flutter)
    const flip = Math.sin(t * 2.2 + i) > 0;
    switch (kind) {
      case 'petals':
        px(0, 0, s.colour, s.alpha, 3, 3);
        px(flip ? 3 : -1, 1, s.colour, s.alpha * 0.8);
        px(flip ? 2 : 0, 2, edge(s.colour));
        break;
      case 'leaves':
        px(0, 0, s.colour, s.alpha, flip ? 4 : 3, flip ? 3 : 4);
        px(flip ? 0 : 1, flip ? 2 : 3, edge(s.colour), s.alpha, flip ? 4 : 1, 1);
        px(flip ? -1 : 1, flip ? 1 : 4, edge(s.colour));
        break;
      case 'crumbs':
        px(0, 0, s.colour, s.alpha, 2, 2);
        px(0, 1, edge(s.colour), s.alpha, 2, 1);
        break;
      case 'ink':
        // a falling drop with its little tail
        px(0, 0, s.colour, s.alpha, 2, 2);
        px(0, -1, s.colour, s.alpha * 0.6);
        break;
      case 'motes':
        px(-1, -1, s.colour, s.alpha * 0.3, 4, 4);
        px(0, 0, s.colour, s.alpha, 2, 2);
        break;
      case 'fireflies':
        px(-2, -2, s.colour, s.alpha * 0.15, 6, 6);
        px(-1, -1, s.colour, s.alpha * 0.4, 4, 4);
        px(0, 0, '#fffbe0', s.alpha, 2, 2);
        break;
      case 'glitter':
        px(-2, 0, s.colour, s.alpha * 0.7, 5, 1);
        px(0, -2, s.colour, s.alpha * 0.7, 1, 5);
        px(0, 0, '#ffffff', s.alpha);
        break;
      case 'rain':
        // a slanted pencil stroke, darker on its lower side so it reads over the paper grain
        px(1, -1, '#dfe8f6', s.alpha * 0.7, 1, 3);
        px(0, 0, s.colour, s.alpha, 1, 4);
        px(-1, 4, edge(s.colour), s.alpha, 1, 3);
        break;
      case 'snow':
        px(0, 0, s.colour, s.alpha, 2, 2);
        px(0, 2, '#9fb1d1', s.alpha * 0.8, 2, 1);
        break;
      case 'wind':
        px(0, 0, s.colour, s.alpha, 9, 1);
        px(9, -1, s.colour, s.alpha * 0.6, 4, 1);
        px(-3, 1, '#c9c2b4', s.alpha * 0.5, 4, 1);
        break;
    }
  }
  ctx.globalAlpha = 1;
}

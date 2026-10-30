/**
 * The memories of the Lac des Couleurs' legend (src/story/lac.ts): a small coloured-pencil picture for each memory
 * pearl, shown when it is found. The lake under a sky, washed in the pearl's colour, with the painter of the legend
 * (drawn like the story's characters, `personUrl`) and Aquarelline (its card).
 */
import { artUrl, creature } from '../data/creatures';
import { fromLook } from '../data/appearance';
import { Pencil, seeded, type Pt } from './paper/pencilCanvas';
import { personUrl } from './personArt';

const W = 480, H = 300, SHORE = 196;

/** The painter of the legend: long red hair under a beret, a smock spattered with paint. */
const PAINTER = { hair: '#c0582a', shirt: '#f6e7c8', pants: '#5a8ad6', longHair: true, hat: '#e2483f' };

const load = (src: string) => new Promise<HTMLImageElement>((ok, ko) => {
  const i = new Image();
  i.onload = () => ok(i);
  i.onerror = ko;
  i.src = src;
});

/** A lopsided blob around (x, y). */
const blob = (r: () => number, x: number, y: number, rx: number, ry: number, n = 9): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, k = 0.8 + r() * 0.35;
    return [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k];
  });

/** Aquarelline (its card) at (x, y): `flip` turns it to the right; below `waterline` it is under the water, faint. */
interface Manta {
  x: number;
  y: number;
  s: number;
  alpha?: number;
  flip?: boolean;
  waterline?: number;
}

interface Scene {
  sky: string;
  water: string;
  /** Splashes of colour in the water. */
  stains: string[];
  /** The open sea, flat to the horizon, instead of the far hills. */
  sea?: boolean;
  /** Drawn after the sky, behind the hills (a rising sun). */
  back?: (p: Pencil, r: () => number) => void;
  /** Drawn on the lake, under the characters (a whirlpool, a wake…). */
  under?: (p: Pencil, r: () => number) => void;
  /** The painter standing on the shore at x, or rowing her boat at (x, y). */
  painter?: { x: number; s: number; boat?: number };
  manta?: Manta;
  /** Drawn last, over everything (the chapel, the grey cloud…). */
  extra?: (p: Pencil, r: () => number) => void;
}

/** A wobbly ellipse of pencil, open or closed. */
const ring = (r: () => number, x: number, y: number, rx: number, ry: number, from = 0, to = Math.PI * 2, n = 18): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n;
    return [x + Math.cos(a) * rx + (r() - 0.5) * 2, y + Math.sin(a) * ry + (r() - 0.5) * 1.5];
  });

const RAINBOW = ['#e2483f', '#f08a3a', '#f6cf5a', '#4fae5a', '#3e6fd0', '#5a4ab0', '#c48ae6'];

const chapel = (p: Pencil, x: number, y: number, s: number, sinking = 0) => {
  const pts: Pt[] = [[x - 26 * s, y], [x - 26 * s, y - 34 * s], [x, y - 58 * s], [x + 26 * s, y - 34 * s], [x + 26 * s, y]];
  p.hatch(pts, '#d9cdb8', { alpha: 0.8 - sinking * 0.3 });
  p.outline(pts);
  p.outline([[x - 8 * s, y], [x - 8 * s, y - 16 * s], [x + 8 * s, y - 16 * s], [x + 8 * s, y]], { close: false });
  p.outline([[x, y - 58 * s], [x, y - 74 * s]], { close: false });
  p.outline([[x - 6 * s, y - 68 * s], [x + 6 * s, y - 68 * s]], { close: false });
};

const SCENES: Record<string, Scene> = {
  // the painter rinsing her brushes in the evening, by her poppies
  rouge: {
    sky: '#f6c49a', water: '#9ab4c8', stains: ['#e2483f', '#e2483f', '#f07a6a'], painter: { x: 110, s: 1 },
    extra: (p, r) => {
      for (let i = 0; i < 14; i++) {
        const x = 200 + r() * 260, y = SHORE - 4 - r() * 26;
        p.outline([[x, y], [x + (r() - 0.5) * 3, y + 12]], { close: false, color: '#4f8a4a', alpha: 0.6, width: 1.1 });
        const b = blob(r, x, y, 5, 4, 6);
        p.hatch(b, '#e2483f', { alpha: 1, gap: 1.4 });
      }
      // her jar of water, and a brush dipped in the lake letting its red go
      const jar: Pt[] = [[150, SHORE + 14], [152, SHORE - 6], [170, SHORE - 6], [172, SHORE + 14]];
      p.hatch(jar, '#bcd4e2', { alpha: 0.7, gap: 2 });
      p.outline(jar);
      p.outline([[158, SHORE - 4], [154, SHORE - 30]], { close: false, color: '#8a5a3a', width: 2 });
      p.outline([[164, SHORE - 4], [170, SHORE - 28]], { close: false, color: '#8a5a3a', width: 2 });
      p.outline([[136, SHORE + 6], [180, SHORE + 34]], { close: false, color: '#8a5a3a', width: 2.2 });
      p.hatch(blob(r, 196, SHORE + 44, 26, 10), '#e2483f', { alpha: 0.7, gap: 2 });
    },
  },
  orange: {
    sky: '#f8d2a0', water: '#9ab4c8', stains: ['#f08a3a', '#e2483f', '#f6cf5a', '#4fae5a'], painter: { x: 380, s: 0.9 },
    // her stains, walking about on little legs
    extra: (p, r) => {
      for (const [x, y, col] of [[150, 236, '#f08a3a'], [215, 250, '#f6cf5a'], [270, 232, '#e2483f']] as const) {
        const b = blob(r, x, y, 16, 12);
        p.hatch(b, col, { alpha: 0.85, gap: 2.4 });
        p.outline(b);
        p.outline([[x - 6, y + 11], [x - 8, y + 20]], { close: false });
        p.outline([[x + 6, y + 11], [x + 8, y + 20]], { close: false });
      }
    },
  },
  // one morning, the colours whirl together and a great ray rises out of the lake
  jaune: {
    sky: '#f8e6a0', water: '#a8c4d8', stains: ['#f6cf5a', '#f49ac2'],
    back: (p, r) => {
      const sun = blob(r, 400, 92, 26, 26, 12);
      p.hatch(sun, '#f6b93a', { alpha: 0.9, gap: 1.8 });
      p.outline(sun, { alpha: 0.4 });
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        p.outline([[400 + Math.cos(a) * 34, 92 + Math.sin(a) * 34], [400 + Math.cos(a) * 48, 92 + Math.sin(a) * 48]], { close: false, color: '#e8a22a', alpha: 0.7 });
      }
    },
    under: (p, r) => {
      // every rinsed-out colour turning round and round towards the middle
      RAINBOW.forEach((col, i) => {
        const k = 1 - i * 0.12;
        p.outline(ring(r, 240, 250, 210 * k, 40 * k, i * 0.7, i * 0.7 + Math.PI * 1.6, 22), { close: false, color: col, width: 4, alpha: 0.75 });
      });
    },
    manta: { x: 240, y: 196, s: 0.42, waterline: 246 },
    extra: (p, r) => {
      p.outline(ring(r, 240, 248, 150, 12), { color: '#ffffff', width: 2.4, alpha: 0.9 });
      for (let i = 0; i < 16; i++) {
        const a = Math.PI + r() * Math.PI, d = 120 + r() * 60;
        const b = blob(r, 240 + Math.cos(a) * d, 246 + Math.sin(a) * d * 0.4, 3, 4, 6);
        p.hatch(b, RAINBOW[i % 7], { alpha: 1, gap: 1.2 });
      }
    },
  },
  // the painter rowing with Aquarelline beside her: behind them, the water takes on every colour
  verte: {
    sky: '#d8ecc0', water: '#a4b4b8', stains: [],
    under: (p, r) => {
      RAINBOW.forEach((col, i) => {
        const y = 236 + i * 7;
        const band: Pt[] = [[150, y], [260, y - 4 + r() * 3], [370, y + 2], [W, y - 2 - i * 2], [W, y + 9 - i * 2], [370, y + 10], [260, y + 6], [160, y + 7]];
        p.hatch(band, col, { alpha: 0.75, angle: 0, gap: 1.8 });
      });
    },
    painter: { x: 130, s: 0.8, boat: 256 },
    manta: { x: 290, y: 238, s: 0.2, waterline: 250 },
    extra: (p, r) => {
      p.outline(ring(r, 290, 250, 70, 6, 0, Math.PI), { close: false, color: '#ffffff', width: 2, alpha: 0.8 });
    },
  },
  // far away by the sea: the harbour, and Aquarelline leaping towards it with the blue
  bleue: {
    sky: '#cfe2f6', water: '#3e6fd0', stains: ['#7ab0f0', '#2a5ab8'], sea: true,
    under: (p, r) => {
      // where she came out of the waves, and the way she leapt
      p.outline(ring(r, 70, 252, 30, 7), { color: '#ffffff', width: 2, alpha: 0.9 });
      const arc: Pt[] = Array.from({ length: 12 }, (_, i) => {
        const t = i / 11;
        return [70 + t * 150, 248 - Math.sin(t * Math.PI * 0.85) * 110];
      });
      arc.forEach(([x, y], i) => { if (i % 2 === 0) p.hatch(blob(r, x, y, 3.5, 3.5, 6), '#7ab0f0', { alpha: 1, gap: 1.2 }); });
    },
    manta: { x: 250, y: 132, s: 0.16, flip: true },
    extra: (p, r) => {
      for (const [x, w, h, roof] of [[344, 30, 26, '#e2483f'], [378, 26, 34, '#3e6fd0'], [408, 34, 24, '#f6cf5a']] as const) {
        const box: Pt[] = [[x, SHORE - 2], [x, SHORE - h], [x + w, SHORE - h], [x + w, SHORE - 2]];
        p.hatch(box, '#f0e6d4', { alpha: 0.7 });
        p.outline(box);
        const top: Pt[] = [[x - 3, SHORE - h], [x + w / 2, SHORE - h - 14], [x + w + 3, SHORE - h]];
        p.hatch(top, roof, { alpha: 0.8 });
        p.outline(top);
      }
      // the lighthouse at the end of the jetty
      const tower: Pt[] = [[452, SHORE - 2], [456, SHORE - 62], [468, SHORE - 62], [472, SHORE - 2]];
      p.hatch(tower, '#f4efe4', { alpha: 0.8 });
      for (const y of [SHORE - 20, SHORE - 42]) p.hatch([[453, y], [471, y], [471, y - 8], [453, y - 8]], '#e2483f', { alpha: 0.9, gap: 1.6 });
      p.outline(tower);
      p.hatch(blob(r, 462, SHORE - 70, 8, 7, 7), '#f6cf5a', { alpha: 1, gap: 1.4 });
      // a little boat at the quay
      const hull: Pt[] = [[300, SHORE + 8], [336, SHORE + 8], [330, SHORE + 18], [306, SHORE + 18]];
      p.hatch(hull, '#b0835a', { alpha: 0.9 });
      p.outline(hull);
      p.outline([[318, SHORE + 8], [318, SHORE - 22]], { close: false });
      const sail: Pt[] = [[320, SHORE - 20], [338, SHORE + 4], [320, SHORE + 4]];
      p.hatch(sail, '#ffffff', { alpha: 0.9 });
      p.outline(sail);
    },
  },
  indigo: {
    sky: '#6a6aa8', water: '#7a86a8', stains: ['#5a4ab0'],
    // the chapel on the shore, and a grey cloud rubbing the colours out
    extra: (p, r) => {
      chapel(p, 140, SHORE, 1.1);
      const cloud = blob(r, 330, 70, 110, 40, 12);
      p.hatch(cloud, '#9a98a4', { alpha: 0.75, gap: 2.6 });
      p.outline(cloud);
      p.blank(blob(r, 330, 210, 90, 26, 10));
      p.strokes(40, [250, 110, 410, 190], '#8a889a', 18, { angle: Math.PI / 2, alpha: 0.4 });
    },
  },
  violette: {
    sky: '#4a3a7a', water: '#3a3a78', stains: ['#9a5ccc', '#5a4ab0'], manta: { x: 240, y: 250, s: 0.26, alpha: 0.7 },
    // deep under the water, the chapel sinking and seven pearls glowing
    extra: (p, r) => {
      chapel(p, 390, 286, 0.8, 1);
      ['#e2483f', '#f08a3a', '#f6cf5a', '#4fae5a', '#3e6fd0', '#5a4ab0', '#c48ae6'].forEach((col, i) => {
        const a = (i / 7) * Math.PI * 2;
        const b = blob(r, 240 + Math.cos(a) * 92, 250 + Math.sin(a) * 34, 7, 7, 7);
        p.hatch(b, col, { alpha: 1, gap: 1.6 });
        p.outline(b, { width: 1.2 });
      });
    },
  },
};

const cache = new Map<string, string>();

/** The picture of one memory (a pearl's id: rouge, orange… violette), as a data URL. */
export async function memoryUrl(pearl: string): Promise<string> {
  const hit = cache.get(pearl);
  if (hit) return hit;
  const sc = SCENES[pearl];
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  const r = seeded(pearl.length * 977 + pearl.charCodeAt(0) * 31);
  const p = new Pencil(ctx, r);
  p.paper(W, H);
  // the sky and the far hills
  p.hatch([[0, 0], [W, 0], [W, SHORE], [0, SHORE]], sc.sky, { alpha: 0.7, angle: -0.3 });
  sc.back?.(p, r);
  if (!sc.sea) {
    const hills: Pt[] = [[0, SHORE], [0, 150], [90, 128], [170, 150], [260, 120], [360, 146], [W, 126], [W, SHORE]];
    p.hatch(hills, '#8aa08a', { alpha: 0.45, angle: 0.4 });
    p.outline(hills.slice(1, -1), { close: false, alpha: 0.5 });
  }
  // the lake, and the colours drifting in it
  p.hatch([[0, SHORE], [W, SHORE], [W, H], [0, H]], sc.water, { alpha: 0.75, angle: -0.1, gap: 2.6 });
  p.outline([[0, SHORE], [W, SHORE]], { close: false, alpha: 0.5 });
  sc.stains.forEach((col, i) => {
    const b = blob(r, 60 + ((i * 131 + r() * 60) % (W - 120)), SHORE + 30 + r() * 60, 40 + r() * 30, 12 + r() * 8);
    p.hatch(b, col, { alpha: 0.55, angle: -0.1 });
  });
  p.strokes(30, [0, SHORE + 6, W, H], '#ffffff', 22, { angle: 0, alpha: 0.5 });
  sc.under?.(p, r);
  if (sc.manta) {
    const { x, y, s, alpha = 0.95, flip, waterline } = sc.manta;
    const img = await load(artUrl(creature('115'))).catch(() => null);
    if (img) {
      const w = img.width * s, h = img.height * s;
      const draw = (top: number, bottom: number, a: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, top, W, bottom - top);
        ctx.clip();
        ctx.globalAlpha = a;
        if (flip) {
          ctx.translate(x * 2, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
        ctx.restore();
      };
      draw(0, waterline ?? H, alpha);
      if (waterline) draw(waterline, H, alpha * 0.3);
    }
  }
  if (sc.painter) {
    const { x, s, boat } = sc.painter;
    const img = await load(personUrl(fromLook(PAINTER))).catch(() => null);
    if (img) {
      const h = 150 * s, w = (img.width / img.height) * h;
      // in her boat only her top half shows, over the side
      ctx.save();
      if (boat) {
        ctx.beginPath();
        ctx.rect(0, 0, W, boat);
        ctx.clip();
      }
      ctx.drawImage(img, x - w / 2, (boat ? boat + h * 0.22 : SHORE + 18) - h, w, h);
      ctx.restore();
    }
    if (boat) {
      const hull: Pt[] = [[x - 58, boat - 18], [x + 58, boat - 18], [x + 44, boat + 6], [x - 46, boat + 6]];
      p.blank(hull);
      p.hatch(hull, '#b0835a', { alpha: 0.95, gap: 2 });
      p.outline([[x - 54, boat - 10], [x + 54, boat - 10]], { close: false, alpha: 0.4 });
      p.outline(hull);
      p.outline([[x + 30, boat - 30], [x + 70, boat + 14]], { close: false, color: '#8a5a3a', width: 2.4 });
      p.outline(ring(r, x, boat + 6, 66, 5, 0, Math.PI), { close: false, color: '#ffffff', width: 2, alpha: 0.8 });
    }
  }
  sc.extra?.(p, r);
  // a soft edge, like an old picture
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, 'rgba(251,246,234,0)');
  g.addColorStop(1, 'rgba(251,246,234,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const url = cv.toDataURL('image/png');
  cache.set(pearl, url);
  return url;
}

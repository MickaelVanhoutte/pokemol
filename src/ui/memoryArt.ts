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

interface Scene {
  sky: string;
  water: string;
  /** Splashes of colour in the water. */
  stains: string[];
  painter?: [x: number, scale: number];
  manta?: [x: number, y: number, scale: number, alpha: number];
  /** Drawn last, over everything (the chapel, the grey cloud…). */
  extra?: (p: Pencil, r: () => number) => void;
}

const chapel = (p: Pencil, x: number, y: number, s: number, sinking = 0) => {
  const pts: Pt[] = [[x - 26 * s, y], [x - 26 * s, y - 34 * s], [x, y - 58 * s], [x + 26 * s, y - 34 * s], [x + 26 * s, y]];
  p.hatch(pts, '#d9cdb8', { alpha: 0.8 - sinking * 0.3 });
  p.outline(pts);
  p.outline([[x - 8 * s, y], [x - 8 * s, y - 16 * s], [x + 8 * s, y - 16 * s], [x + 8 * s, y]], { close: false });
  p.outline([[x, y - 58 * s], [x, y - 74 * s]], { close: false });
  p.outline([[x - 6 * s, y - 68 * s], [x + 6 * s, y - 68 * s]], { close: false });
};

const SCENES: Record<string, Scene> = {
  rouge: { sky: '#f6c49a', water: '#9ab4c8', stains: ['#e2483f', '#e2483f', '#f07a6a'], painter: [110, 1] },
  orange: {
    sky: '#f8d2a0', water: '#9ab4c8', stains: ['#f08a3a', '#e2483f', '#f6cf5a', '#4fae5a'], painter: [380, 0.9],
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
  jaune: { sky: '#f8e6a0', water: '#a8c4d8', stains: ['#f6cf5a', '#f49ac2', '#8fd38a', '#7ab0f0', '#9a7ae0'], manta: [240, 168, 0.36, 0.9] },
  verte: { sky: '#d8ecc0', water: '#8fc4b4', stains: ['#4fae5a', '#8fd38a'], painter: [92, 0.9], manta: [300, 190, 0.3, 0.95] },
  bleue: {
    sky: '#cfe2f6', water: '#5f8fd0', stains: ['#3e6fd0', '#7ab0f0', '#3e6fd0'], manta: [190, 200, 0.3, 0.95],
    // the harbour far away, where the blue went
    extra: (p) => {
      for (const [x, w, h, roof] of [[360, 30, 26, '#e2483f'], [394, 26, 34, '#3e6fd0'], [424, 34, 24, '#f6cf5a']] as const) {
        const box: Pt[] = [[x, SHORE - 2], [x, SHORE - h], [x + w, SHORE - h], [x + w, SHORE - 2]];
        p.hatch(box, '#f0e6d4', { alpha: 0.7 });
        p.outline(box);
        const top: Pt[] = [[x - 3, SHORE - h], [x + w / 2, SHORE - h - 14], [x + w + 3, SHORE - h]];
        p.hatch(top, roof, { alpha: 0.8 });
        p.outline(top);
      }
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
    sky: '#4a3a7a', water: '#3a3a78', stains: ['#9a5ccc', '#5a4ab0'], manta: [240, 250, 0.26, 0.7],
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
  const hills: Pt[] = [[0, SHORE], [0, 150], [90, 128], [170, 150], [260, 120], [360, 146], [W, 126], [W, SHORE]];
  p.hatch(hills, '#8aa08a', { alpha: 0.45, angle: 0.4 });
  p.outline(hills.slice(1, -1), { close: false, alpha: 0.5 });
  // the lake, and the colours drifting in it
  p.hatch([[0, SHORE], [W, SHORE], [W, H], [0, H]], sc.water, { alpha: 0.75, angle: -0.1, gap: 2.6 });
  p.outline([[0, SHORE], [W, SHORE]], { close: false, alpha: 0.5 });
  sc.stains.forEach((col, i) => {
    const b = blob(r, 60 + ((i * 131 + r() * 60) % (W - 120)), SHORE + 30 + r() * 60, 40 + r() * 30, 12 + r() * 8);
    p.hatch(b, col, { alpha: 0.55, angle: -0.1 });
  });
  p.strokes(30, [0, SHORE + 6, W, H], '#ffffff', 22, { angle: 0, alpha: 0.5 });
  if (sc.manta) {
    const [x, y, s, alpha] = sc.manta;
    const img = await load(artUrl(creature('115'))).catch(() => null);
    if (img) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x - (img.width * s) / 2, y - (img.height * s) / 2, img.width * s, img.height * s);
      ctx.globalAlpha = 1;
    }
  }
  if (sc.painter) {
    const [x, s] = sc.painter;
    const img = await load(personUrl(fromLook(PAINTER))).catch(() => null);
    if (img) {
      const h = 150 * s, w = (img.width / img.height) * h;
      ctx.drawImage(img, x - w / 2, SHORE + 18 - h, w, h);
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

/**
 * Battle backgrounds "drawn with colouring pencils": paper grain, hatched colour strokes and
 * wobbly graphite outlines, painted once per environment on a canvas and cached as an image.
 */
import type { Backdrop } from '../../data/schema';
import { Pencil, seeded, type Pt, type Rand } from '../paper/pencilCanvas';

const W = 480;
const H = 360;
const HORIZON = H * 0.46;

// ------------------------------------------------------------------ shapes

const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

function ellipse(cx: number, cy: number, rx: number, ry: number, r: Rand, n = 28, wob = 0.05): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * wob;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as Pt;
  });
}

/** Rolling skyline from x=0 to W around `base`, closed down to `bottom`. */
function hills(base: number, amp: number, bumps: number, bottom: number, r: Rand): Pt[] {
  const pts: Pt[] = [];
  const phase = r() * 6;
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * W;
    const y = base - Math.abs(Math.sin((i / 40) * Math.PI * bumps + phase)) * amp - r() * 3;
    pts.push([x, y]);
  }
  pts.push([W, bottom], [0, bottom]);
  return pts;
}

function cloud(p: Pencil, cx: number, cy: number, s: number) {
  const pts = ellipse(cx, cy, 34 * s, 13 * s, p.r, 24, 0.25);
  p.blank(pts);
  p.outline(pts, { alpha: 0.35, width: 1.2 });
}

function sun(p: Pencil, cx: number, cy: number) {
  const disc = ellipse(cx, cy, 22, 22, p.r);
  p.hatch(disc, '#f6c636', { alpha: 0.8, gap: 2.4 });
  p.hatch(disc, '#f08a3a', { alpha: 0.25, angle: 0.7, gap: 4 });
  p.outline(disc, { color: '#d9822a', alpha: 0.8 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    p.outline([[cx + Math.cos(a) * 28, cy + Math.sin(a) * 28], [cx + Math.cos(a) * 40, cy + Math.sin(a) * 40]], { color: '#e8a030', close: false, alpha: 0.7 });
  }
}

function tree(p: Pencil, x: number, base: number, h: number, dark = false) {
  const trunk = rect(x - 6, base - h * 0.45, x + 6, base);
  p.hatch(trunk, '#8a5a32', { angle: -1.4, alpha: 0.75, gap: 2.5 });
  p.outline(trunk, { alpha: 0.6 });
  const crown = ellipse(x, base - h * 0.62, h * 0.32, h * 0.36, p.r, 26, 0.18);
  p.hatch(crown, dark ? '#2f6a40' : '#4fa04a', { alpha: 0.7, gap: 2.6 });
  p.hatch(crown, dark ? '#1f4a2c' : '#2f7a3a', { alpha: 0.3, angle: 0.8, gap: 4 });
  p.outline(crown, { alpha: 0.6 });
}

// ------------------------------------------------------------------ scenes

const SCENES: Record<Backdrop, (p: Pencil) => void> = {
  grass(p) {
    p.hatch(rect(0, 0, W, HORIZON + 4), '#8fc4ef', { alpha: 0.5 });
    cloud(p, 120, 58, 1.1);
    cloud(p, 330, 92, 0.8);
    sun(p, 410, 46);
    const far = hills(HORIZON, 34, 2.2, HORIZON + 6, p.r);
    p.hatch(far, '#86c67a', { alpha: 0.55 });
    p.outline(far.slice(0, 41), { close: false, alpha: 0.45 });
    const ground = rect(0, HORIZON, W, H);
    p.hatch(ground, '#a9d886', { alpha: 0.6, angle: -0.35 });
    p.hatch(ground, '#5fae54', { alpha: 0.22, angle: 0.9, gap: 5 });
    p.strokes(160, [0, HORIZON + 8, W, H], '#3f8a3a', 9, { alpha: 0.55 });
    for (let i = 0; i < 14; i++) {
      const f = ellipse(p.r() * W, HORIZON + 20 + p.r() * (H - HORIZON - 30), 3, 3, p.r, 8);
      p.hatch(f, p.r() < 0.5 ? '#e05a5a' : '#f2c636', { alpha: 0.9, gap: 1.5 });
    }
  },
  forest(p) {
    p.hatch(rect(0, 0, W, HORIZON + 4), '#7fb8a0', { alpha: 0.55 });
    for (let i = 0; i < 7; i++) tree(p, 20 + i * 74 + (p.r() - 0.5) * 20, HORIZON + 10, 120 + p.r() * 50, true);
    const ground = rect(0, HORIZON, W, H);
    p.hatch(ground, '#79a85a', { alpha: 0.6, angle: -0.3 });
    p.hatch(ground, '#3f6a3a', { alpha: 0.25, angle: 0.9, gap: 5 });
    p.strokes(120, [0, HORIZON + 6, W, H], '#2f5a2a', 8);
    // mist
    for (let i = 0; i < 5; i++) {
      const y = 70 + i * 26 + p.r() * 10, x0 = p.r() * W * 0.6 - 40;
      const wisp: Pt[] = Array.from({ length: 9 }, (_, k) => [x0 + k * 22, y + Math.sin(k * 0.9 + i) * 4] as Pt);
      p.outline(wisp, { color: '#ffffff', alpha: 0.45, width: 5, close: false });
    }
  },
  cave(p) {
    p.hatch(rect(0, 0, W, H), '#9a8a78', { alpha: 0.55 });
    p.hatch(rect(0, 0, W, HORIZON), '#5a4c44', { alpha: 0.35, angle: 0.9, gap: 4 });
    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 55 + p.r() * 20, len = 40 + p.r() * 60;
      const st: Pt[] = [[x - 14, 0], [x + 14, 0], [x + 2, len]];
      p.hatch(st, '#6a5a50', { alpha: 0.7, angle: -1.3 });
      p.outline(st, { alpha: 0.6 });
    }
    const floor = hills(HORIZON + 10, 12, 3, H, p.r);
    p.hatch(floor, '#b49a7c', { alpha: 0.6, angle: -0.3 });
    p.outline(floor.slice(0, 41), { close: false, alpha: 0.5 });
    for (let i = 0; i < 5; i++) {
      const rock = ellipse(p.r() * W, HORIZON + 40 + p.r() * 120, 14 + p.r() * 16, 8 + p.r() * 8, p.r, 16, 0.2);
      p.hatch(rock, '#7a6a5c', { alpha: 0.7 });
      p.outline(rock, { alpha: 0.6 });
    }
    for (let i = 0; i < 3; i++) {
      const x = 60 + p.r() * 360, y = HORIZON - 10 + p.r() * 20;
      const gem: Pt[] = [[x, y - 18], [x + 7, y], [x, y + 6], [x - 7, y]];
      p.hatch(gem, '#b48ae0', { alpha: 0.85, gap: 1.8 });
      p.outline(gem, { color: '#6a4a9a' });
    }
  },
  tower(p) {
    p.hatch(rect(0, 0, W, HORIZON + 6), '#8a86b8', { alpha: 0.55 });
    for (let row = 0; row * 22 < HORIZON; row++) {
      for (let col = -1; col * 48 < W; col++) {
        const x = col * 48 + (row % 2) * 24, y = row * 22;
        p.outline(rect(x, y, x + 48, y + 22), { alpha: 0.22, width: 1.2 });
      }
    }
    const win: Pt[] = [[200, 150], [200, 70], ...ellipse(240, 70, 40, 40, p.r, 16, 0).slice(8, 17), [280, 150]];
    p.hatch(win, '#2e3360', { alpha: 0.85, gap: 2.2 });
    const moon = ellipse(252, 92, 13, 13, p.r);
    p.blank(moon);
    p.hatch(moon, '#f6e08a', { alpha: 0.8, gap: 2 });
    p.outline(win, { alpha: 0.7 });
    const floor = rect(0, HORIZON, W, H);
    p.hatch(floor, '#a49cc4', { alpha: 0.6, angle: -0.3 });
    for (let i = 0; i < 9; i++) p.outline([[i * 60 - 40, H], [i * 60 + 10, HORIZON]], { alpha: 0.25, close: false });
  },
  lab(p) {
    p.hatch(rect(0, 0, W, HORIZON), '#efe0c0', { alpha: 0.6 });
    const band = rect(0, HORIZON - 34, W, HORIZON);
    p.hatch(band, '#c9a070', { alpha: 0.6, angle: -1.2 });
    p.outline(band, { alpha: 0.4 });
    const win = rect(60, 40, 170, 120);
    p.hatch(win, '#9fd0f5', { alpha: 0.7 });
    p.outline(win);
    p.outline([[115, 40], [115, 120]], { close: false });
    p.outline([[60, 80], [170, 80]], { close: false });
    const poster = rect(300, 46, 380, 116);
    p.hatch(poster, '#f2b8c8', { alpha: 0.6 });
    p.outline(poster, { alpha: 0.6 });
    const floor = rect(0, HORIZON, W, H);
    p.hatch(floor, '#d6ad78', { alpha: 0.65, angle: -0.2 });
    for (let y = HORIZON + 26; y < H; y += 30) p.outline([[0, y], [W, y + 4]], { alpha: 0.3, close: false });
  },
  beach(p) {
    p.hatch(rect(0, 0, W, HORIZON - 30), '#a8d6f6', { alpha: 0.5 });
    cloud(p, 150, 50, 1);
    sun(p, 400, 50);
    const sea = rect(0, HORIZON - 34, W, HORIZON + 14);
    p.hatch(sea, '#4f9be0', { alpha: 0.65, angle: -0.15 });
    for (let i = 0; i < 18; i++) {
      const x = p.r() * W, y = HORIZON - 26 + p.r() * 34;
      p.outline([[x, y], [x + 6, y - 3], [x + 12, y]], { color: '#ffffff', alpha: 0.9, width: 1.6, close: false });
    }
    const sand = hills(HORIZON + 14, 6, 2, H, p.r);
    p.hatch(sand, '#f0d898', { alpha: 0.7, angle: -0.3 });
    p.strokes(90, [0, HORIZON + 20, W, H], '#c8a060', 2, { alpha: 0.6, width: 1.8 });
    p.outline(sand.slice(0, 41), { close: false, alpha: 0.45 });
  },
  city(p) {
    p.hatch(rect(0, 0, W, HORIZON), '#f6c8a8', { alpha: 0.5 });
    const colors = ['#c8b8e0', '#e8c088', '#a8c8e8', '#e8a8b8', '#b8d8a8'];
    for (let x = -10; x < W; ) {
      const w = 50 + p.r() * 40, h = 70 + p.r() * 100;
      const b = rect(x, HORIZON - h, x + w, HORIZON + 4);
      p.hatch(b, colors[Math.floor(p.r() * colors.length)], { alpha: 0.7, angle: -1.3 });
      p.outline(b, { alpha: 0.6 });
      for (let wy = HORIZON - h + 12; wy < HORIZON - 16; wy += 22) {
        for (let wx = x + 9; wx < x + w - 14; wx += 18) p.hatch(rect(wx, wy, wx + 9, wy + 11), '#f6e07a', { alpha: 0.8, gap: 1.6 });
      }
      x += w + 4;
    }
    const road = rect(0, HORIZON, W, H);
    p.hatch(road, '#b8b2c0', { alpha: 0.6, angle: -0.2 });
    for (let x = 10; x < W; x += 60) p.outline([[x, HORIZON + 60], [x + 30, HORIZON + 60]], { color: '#ffffff', alpha: 0.9, width: 3, close: false });
  },
  volcano(p) {
    p.hatch(rect(0, 0, W, HORIZON), '#f6a878', { alpha: 0.55 });
    const mount: Pt[] = [[40, HORIZON + 4], [200, 40], [260, 40], [440, HORIZON + 4]];
    p.hatch(mount, '#8a5a4a', { alpha: 0.7 });
    p.hatch(mount, '#5a3a32', { alpha: 0.3, angle: 0.9, gap: 4 });
    p.outline(mount, { alpha: 0.6 });
    for (let i = 0; i < 4; i++) {
      const x = 205 + i * 15;
      p.outline([[x, 44], [x - 30 + i * 18, 150 + i * 20]], { color: '#e0502a', alpha: 0.85, width: 3, close: false });
    }
    for (let i = 0; i < 5; i++) {
      const smoke = ellipse(230 + (p.r() - 0.5) * 40, 30 - i * 8, 18 + i * 4, 9, p.r, 16, 0.2);
      p.blank(smoke);
      p.hatch(smoke, '#9a8a8a', { alpha: 0.35 });
    }
    const ground = rect(0, HORIZON, W, H);
    p.hatch(ground, '#b48a72', { alpha: 0.6, angle: -0.3 });
    p.strokes(80, [0, HORIZON + 6, W, H], '#6a4a3a', 3, { alpha: 0.5, width: 2 });
  },
  underwater(p) {
    // the lake's depths: blue water, light falling from the surface, seaweed and coral on the sand
    p.hatch(rect(0, 0, W, H), '#5f9fd8', { alpha: 0.55, angle: 1.2 });
    p.hatch(rect(0, 0, W, HORIZON), '#3f7fc4', { alpha: 0.3, angle: 0.4, gap: 5 });
    for (const x of [80, 230, 380]) {
      const ray: Pt[] = [[x, 0], [x + 40, 0], [x + 90, HORIZON + 40], [x + 20, HORIZON + 40]];
      p.hatch(ray, '#ffffff', { alpha: 0.25, angle: 1.1, gap: 4 });
    }
    const sand = hills(HORIZON + 30, 10, 2, H, p.r);
    p.hatch(sand, '#d8cc9c', { alpha: 0.7, angle: -0.3 });
    p.outline(sand.slice(0, 41), { close: false, alpha: 0.4 });
    for (const [x, h] of [[30, 120], [60, 90], [420, 130], [450, 100]] as const) {
      const pts: Pt[] = Array.from({ length: 8 }, (_, i) => [x + Math.sin(i * 0.9) * 8, HORIZON + 40 - (i / 7) * h] as Pt);
      p.outline(pts, { color: '#3f8f6a', alpha: 0.85, width: 4, close: false });
    }
    for (const x of [130, 330]) {
      const coral = ellipse(x, HORIZON + 44, 26, 14, p.r, 16, 0.3);
      p.hatch(coral, x < 200 ? '#f28aa0' : '#f2a65a', { alpha: 0.8 });
      p.outline(coral, { alpha: 0.5 });
    }
    for (let i = 0; i < 16; i++) {
      const bub = ellipse(p.r() * W, p.r() * HORIZON, 3 + p.r() * 4, 3 + p.r() * 4, p.r, 10, 0.1);
      p.outline(bub, { color: '#ffffff', alpha: 0.8, width: 1.2 });
    }
  },
  sketch(p) {
    // the edge of the page: almost nothing is coloured in
    const far = hills(HORIZON, 30, 2, HORIZON + 6, p.r);
    p.outline(far.slice(0, 41), { close: false, alpha: 0.5 });
    p.outline([[0, HORIZON], [W, HORIZON + 3]], { close: false, alpha: 0.5 });
    cloud(p, 140, 70, 1);
    p.hatch(rect(0, HORIZON, W, H), '#8a8494', { alpha: 0.18, angle: -0.4, gap: 6 });
    for (let i = 0; i < 3; i++) {
      const x = 60 + i * 160;
      p.outline(ellipse(x, HORIZON - 40, 30, 34, p.r, 18, 0.2), { alpha: 0.4 });
      p.outline([[x, HORIZON - 8], [x, HORIZON + 4]], { close: false, alpha: 0.4 });
    }
  },
};

/** Ground colour of each place, used for the hatched platforms under the creatures. */
const GROUND: Record<Backdrop, [string, string]> = {
  grass: ['#7cc06a', '#3f8a3a'], forest: ['#5f8a4a', '#2f5a2a'], cave: ['#8a7664', '#4a3c34'],
  tower: ['#7c74a4', '#3e3866'], lab: ['#b8915e', '#7a5a34'], beach: ['#e6c47c', '#b08a4a'],
  city: ['#9a94a8', '#5e5870'], volcano: ['#8e624e', '#5a3a2e'], sketch: ['#c8c4d0', '#8a8494'], underwater: ['#d8cc9c', '#8a9ab0'],
};

const cache = new Map<string, string>();

export function backdropUrl(kind: Backdrop): string {
  const key = `bd:${kind}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const p = new Pencil(c.getContext('2d')!, seeded(kind.length * 977 + kind.charCodeAt(0)));
  p.paper(W, H);
  (SCENES[kind] ?? SCENES.grass)(p);
  const url = c.toDataURL('image/jpeg', 0.86);
  cache.set(key, url);
  return url;
}

export function platformUrl(kind: Backdrop): string {
  const key = `pl:${kind}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 260;
  c.height = 70;
  const p = new Pencil(c.getContext('2d')!, seeded(kind.charCodeAt(1) * 31));
  const [light, dark] = GROUND[kind] ?? GROUND.grass;
  const e = ellipse(130, 35, 122, 29, p.r, 36, 0.04);
  if (kind !== 'sketch') {
    p.hatch(e, light, { alpha: 0.75, gap: 2.4 });
    p.hatch(e, dark, { alpha: 0.35, angle: 0.8, gap: 3.6 });
  }
  p.outline(e, { alpha: 0.65 });
  const url = c.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

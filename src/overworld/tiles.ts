import { hash, type Painter } from './pixel';

/** Neighbor lookup: tile id at offset (dx, dy) from the tile being painted. */
export type Near = (dx: number, dy: number) => string | undefined;

export interface TileDef {
  solid?: boolean;
  /** Wild encounters can trigger here. */
  encounter?: boolean;
  /** Bottom part is redrawn over the player (tall grass). */
  over?: boolean;
  /** One-way ledge: can only be crossed going down. */
  ledge?: boolean;
  animated?: boolean;
  paint: (p: Painter, frame: number, near: Near, x: number, y: number) => void;
}

export const C = {
  g1: '#7cc65a', g2: '#9ad978', g3: '#5ead47', g4: '#3f8a35',
  tg1: '#4c9c3c', tg2: '#2c6f2a', tg3: '#86cf62',
  p1: '#e6d49c', p2: '#d2bc82', p3: '#f2e6bc',
  w1: '#5ba2ef', w2: '#8ec6fa', w3: '#3a78cc', w4: '#d8eeff',
  t1: '#3f8f3a', t2: '#2c6e2e', t3: '#6cc05a', t4: '#1d4423', bark: '#7a5230', bark2: '#5a3a20',
  wood: '#d9a868', wood2: '#7a5230',
  outline: '#2a2238',
};

const GRASSY = new Set(['grass', 'grass2', 'flowers', 'tallgrass', 'tree', 'bush', 'fence', 'sign', 'rock', 'ledge', 'mailbox']);
const isGrassy = (id?: string) => !id || GRASSY.has(id);

function grass(p: Painter, x: number, y: number, seed = 0) {
  p.fill(C.g1);
  for (let i = 0; i < 4; i++) {
    const tx = Math.floor(hash(x, y, 10 + i + seed) * 13) + 1;
    const ty = Math.floor(hash(x, y, 20 + i + seed) * 13) + 2;
    if (hash(x, y, 30 + i) < 0.55) {
      p.px(tx, ty, C.g3);
      p.px(tx + 1, ty - 1, C.g3);
      p.px(tx + 2, ty, C.g3);
      p.px(tx + 1, ty - 2, C.g2);
    }
  }
  p.noise(0.05, C.g2, x * 31 + y * 17 + seed);
}

function tallGrass(p: Painter, frame: number) {
  p.fill(C.tg1);
  const clump = (ox: number, oy: number) => {
    const sway = frame ? 1 : 0;
    // three blades per clump
    for (const [bx, h] of [[0, 6], [3, 7], [6, 5]] as const) {
      for (let i = 0; i < h; i++) {
        const xx = ox + bx + (i < 2 ? sway : 0) + (i > 3 ? 1 : 0);
        p.px(xx, oy + i, i < 2 ? C.tg3 : C.tg2);
      }
    }
    p.rect(ox, oy + 6, 8, 2, C.tg2);
  };
  clump(0, 0);
  clump(8, 0);
  clump(4, 8);
  clump(-4, 8);
  clump(12, 8);
}

function path(p: Painter, near: Near, x: number, y: number) {
  p.fill(C.p1);
  p.noise(0.08, C.p2, x * 13 + y * 7);
  p.noise(0.05, C.p3, x * 5 + y * 11 + 3);
  // grass nibbling the edges
  const edge = (dir: 'u' | 'd' | 'l' | 'r') => {
    for (let i = 0; i < 16; i++) {
      const depth = 1 + Math.floor(hash(x * 16 + i, y, dir.charCodeAt(0)) * 2.2);
      for (let d = 0; d < depth; d++) {
        const [px, py] = dir === 'u' ? [i, d] : dir === 'd' ? [i, 15 - d] : dir === 'l' ? [d, i] : [15 - d, i];
        p.px(px, py, d === depth - 1 ? C.g3 : C.g1);
      }
    }
  };
  if (isGrassy(near(0, -1))) edge('u');
  if (isGrassy(near(0, 1))) edge('d');
  if (isGrassy(near(-1, 0))) edge('l');
  if (isGrassy(near(1, 0))) edge('r');
}

function water(p: Painter, frame: number, near: Near, x: number, y: number) {
  p.fill(C.w1);
  const off = frame * 3;
  for (let row = 3; row < 16; row += 6) {
    for (let i = 0; i < 5; i++) {
      const xx = (Math.floor(hash(x, y + row, 7) * 16) + off + i) % 16;
      p.px(xx, row + (i === 2 ? -1 : 0), C.w2);
    }
  }
  const land = (dx: number, dy: number) => near(dx, dy) !== 'water';
  if (land(0, -1)) { p.rect(0, 0, 16, 2, C.w4); p.rect(0, 2, 16, 1, C.w3); }
  if (land(0, 1)) { p.rect(0, 14, 16, 2, C.w4); p.rect(0, 13, 16, 1, C.w3); }
  if (land(-1, 0)) { p.rect(0, 0, 2, 16, C.w4); p.rect(2, 0, 1, 16, C.w3); }
  if (land(1, 0)) { p.rect(14, 0, 2, 16, C.w4); p.rect(13, 0, 1, 16, C.w3); }
}

function tree(p: Painter, x: number, y: number) {
  grass(p, x, y);
  p.rect(6, 11, 4, 5, C.bark);
  p.rect(6, 11, 1, 5, C.bark2);
  p.disc(8, 7, 7.6, C.t4);
  p.disc(8, 7, 6.8, C.t2);
  p.disc(7.5, 6.5, 5.8, C.t1);
  p.disc(6, 4.5, 2.6, C.t3);
  for (let i = 0; i < 9; i++) {
    const a = hash(x, y, i) * Math.PI * 2;
    const r = 2 + hash(x, y, i + 9) * 4;
    p.px(Math.round(8 + Math.cos(a) * r), Math.round(7 + Math.sin(a) * r), C.t2);
  }
  p.px(4, 4, C.t3); p.px(9, 3, C.t3);
}

export const TILES: Record<string, TileDef> = {
  void: { solid: true, paint: (p) => p.fill('#000') },
  grass: { paint: (p, _f, _n, x, y) => grass(p, x, y) },
  grass2: { paint: (p, _f, _n, x, y) => { grass(p, x, y, 5); p.noise(0.08, C.g3, x + y * 3); } },
  tallgrass: { encounter: true, over: true, animated: true, paint: (p, f) => tallGrass(p, f) },
  path: { paint: (p, _f, n, x, y) => path(p, n, x, y) },
  sand: { paint: (p, _f, _n, x, y) => { p.fill('#f0dfa4'); p.noise(0.07, '#dcc68a', x * 3 + y); p.noise(0.04, '#fff3cc', x + y * 9); } },
  flowers: {
    animated: true,
    paint: (p, f, _n, x, y) => {
      grass(p, x, y);
      const red = hash(x, y, 99) < 0.5;
      const petal = red ? '#f15a5a' : '#ffffff';
      for (const [cx, cy] of [[4, 4], [11, 10]]) {
        const s = f ? 1 : 0;
        p.px(cx + s, cy - 1, petal); p.px(cx - 1 + s, cy, petal); p.px(cx + 1 + s, cy, petal); p.px(cx + s, cy + 1, petal);
        p.px(cx + s, cy, '#f8d030');
        p.px(cx, cy + 2, C.g3);
      }
    },
  },
  water: { solid: true, animated: true, paint: (p, f, n, x, y) => water(p, f, n, x, y) },
  tree: { solid: true, paint: (p, _f, _n, x, y) => tree(p, x, y) },
  bush: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      grass(p, x, y);
      p.disc(8, 9, 6.5, C.t4);
      p.disc(8, 9, 5.7, C.t1);
      p.disc(6.5, 7.5, 2.2, C.t3);
      p.noise(0.06, C.t2, x * 7 + y);
    },
  },
  fence: {
    solid: true,
    paint: (p, _f, n, x, y) => {
      grass(p, x, y);
      const linkL = n(-1, 0) === 'fence', linkR = n(1, 0) === 'fence';
      p.rect(linkL ? 0 : 3, 5, linkR ? (linkL ? 16 : 13) : linkL ? 13 : 10, 2, C.wood);
      p.rect(linkL ? 0 : 3, 9, linkR ? (linkL ? 16 : 13) : linkL ? 13 : 10, 2, C.wood);
      p.rect(linkL ? 0 : 3, 7, linkR ? (linkL ? 16 : 13) : linkL ? 13 : 10, 1, C.wood2);
      p.rect(linkL ? 0 : 3, 11, linkR ? (linkL ? 16 : 13) : linkL ? 13 : 10, 1, C.wood2);
      for (const px of [3, 11]) {
        p.rect(px, 2, 3, 12, C.wood);
        p.rect(px + 2, 2, 1, 12, C.wood2);
        p.rect(px, 13, 3, 1, C.wood2);
      }
    },
  },
  sign: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      grass(p, x, y);
      p.rect(7, 9, 2, 6, C.wood2);
      p.rect(2, 3, 12, 7, C.wood2);
      p.rect(3, 4, 10, 5, C.wood);
      p.rect(4, 5, 8, 1, '#b98a52');
      p.rect(4, 7, 6, 1, '#b98a52');
    },
  },
  mailbox: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      grass(p, x, y);
      p.rect(7, 8, 2, 7, C.wood2);
      p.rect(3, 3, 10, 6, '#7a2a2a');
      p.rect(4, 4, 8, 4, '#d9534f');
      p.rect(11, 2, 1, 4, '#f8d030');
    },
  },
  rock: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      grass(p, x, y);
      p.disc(8, 9, 6.2, '#5b5b66');
      p.disc(8, 9, 5.4, '#9a9aa8');
      p.disc(6.5, 7.5, 2.4, '#c4c4d0');
      p.noise(0.05, '#7a7a88', x + y);
    },
  },
  ledge: {
    ledge: true,
    solid: true,
    paint: (p, _f, _n, x, y) => {
      grass(p, x, y);
      p.rect(0, 9, 16, 2, '#a8e080');
      p.rect(0, 11, 16, 3, '#5a9a40');
      p.rect(0, 14, 16, 2, '#3f7a30');
      for (let i = 0; i < 16; i += 4) p.px(i + 1, 12, '#4a8a36');
    },
  },
  // ---------- interiors
  floor: {
    paint: (p, _f, _n, x, y) => {
      p.fill('#dcae74');
      for (let r = 0; r < 16; r += 4) {
        p.rect(0, r + 3, 16, 1, '#b98a52');
        const seam = (Math.floor(hash(x, y + r, 3) * 12) + (r % 8 ? 4 : 10)) % 16;
        p.rect(seam, r, 1, 3, '#c49460');
      }
      p.noise(0.03, '#e8c08a', x + y * 5);
    },
  },
  wall: {
    solid: true,
    paint: (p) => {
      p.fill('#f6ecd6');
      for (let i = 1; i < 16; i += 4) p.rect(i, 0, 1, 12, '#ead9b8');
      p.rect(0, 12, 16, 1, '#c9a676');
      p.rect(0, 13, 16, 3, '#a5804f');
    },
  },
  window: {
    solid: true,
    paint: (p) => {
      p.fill('#f6ecd6');
      p.rect(0, 13, 16, 3, '#a5804f');
      p.rect(2, 2, 12, 9, '#8a6a44');
      p.rect(3, 3, 10, 7, '#a8dcff');
      p.rect(8, 3, 1, 7, '#8a6a44');
      p.rect(3, 6, 10, 1, '#8a6a44');
      p.rect(4, 4, 2, 1, '#ffffff');
    },
  },
  counter: {
    solid: true,
    paint: (p) => {
      p.fill('#dcae74');
      p.rect(0, 2, 16, 6, '#f4f4fb');
      p.rect(0, 7, 16, 1, '#c9cbe0');
      p.rect(0, 8, 16, 8, '#8f95b8');
      p.rect(0, 8, 16, 1, '#6c7294');
    },
  },
  carpet: {
    paint: (p, _f, n) => {
      p.fill('#d65a5a');
      p.noise(0.06, '#e07272', 4);
      if (n(0, -1) !== 'carpet') p.rect(0, 0, 16, 1, '#a83a3a');
      if (n(0, 1) !== 'carpet') p.rect(0, 15, 16, 1, '#a83a3a');
      if (n(-1, 0) !== 'carpet') p.rect(0, 0, 1, 16, '#a83a3a');
      if (n(1, 0) !== 'carpet') p.rect(15, 0, 1, 16, '#a83a3a');
    },
  },
  mat: {
    paint: (p) => {
      p.fill('#dcae74');
      p.rect(1, 3, 14, 10, '#7b3b3b');
      for (let i = 2; i < 14; i += 3) p.rect(i, 4, 1, 8, '#a85a5a');
    },
  },
  bookshelf: {
    solid: true,
    paint: (p) => {
      p.fill('#6e4526');
      const colors = ['#d65a5a', '#5a8ad6', '#f8d030', '#6cc05a', '#b05ad6', '#f08a3a'];
      for (const row of [1, 8]) {
        p.rect(1, row, 14, 6, '#4a2c16');
        for (let i = 0; i < 6; i++) p.rect(2 + i * 2, row + 1 + (i % 2), 2, 5 - (i % 2), colors[(i + row) % colors.length]);
      }
    },
  },
  table: {
    solid: true,
    paint: (p) => {
      p.fill('#dcae74');
      p.rect(1, 3, 14, 8, '#7a4a24');
      p.rect(1, 3, 14, 6, '#c48a4c');
      p.rect(2, 4, 4, 1, '#e0aa6c');
      p.rect(2, 11, 2, 4, '#7a4a24');
      p.rect(12, 11, 2, 4, '#7a4a24');
    },
  },
  plant: {
    solid: true,
    paint: (p) => {
      p.fill('#dcae74');
      p.rect(4, 10, 8, 5, '#a8502a');
      p.rect(4, 10, 8, 1, '#c86a3a');
      p.disc(8, 6, 5, '#2c6e2e');
      p.disc(7, 5, 3.5, '#4fa046');
      p.px(6, 3, '#86d06a');
    },
  },
  pc: {
    solid: true,
    paint: (p) => {
      p.fill('#dcae74');
      p.rect(1, 8, 14, 7, '#8a8fa8');
      p.rect(3, 1, 10, 8, '#4a4f68');
      p.rect(4, 2, 8, 5, '#7ad0f0');
      p.rect(5, 3, 3, 1, '#d8f4ff');
      p.rect(3, 10, 10, 2, '#c8ccdc');
    },
  },
  bed: {
    solid: true,
    paint: (p) => {
      p.fill('#dcae74');
      p.rect(1, 0, 14, 16, '#7a4a24');
      p.rect(2, 1, 12, 4, '#ffffff');
      p.rect(2, 5, 12, 10, '#5a8ad6');
      p.rect(2, 5, 12, 1, '#87aef0');
    },
  },
  tv: {
    solid: true,
    paint: (p) => {
      p.fill('#dcae74');
      p.rect(2, 3, 12, 10, '#2a2a3a');
      p.rect(3, 4, 10, 7, '#58b0e0');
      p.rect(5, 13, 6, 2, '#2a2a3a');
    },
  },
  machine: {
    solid: true,
    animated: true,
    paint: (p, f) => {
      p.fill('#dcae74');
      p.rect(1, 1, 14, 14, '#5d6680');
      p.rect(2, 2, 12, 6, '#2a3046');
      p.rect(3, 3, 10, 4, f ? '#7af0b0' : '#4ad08a');
      for (let i = 0; i < 3; i++) p.rect(3 + i * 4, 10, 2, 2, ['#f15a5a', '#f8d030', '#5aa2f0'][(i + f) % 3]);
    },
  },
  healer: {
    solid: true,
    animated: true,
    paint: (p, f) => {
      p.fill('#f4f4fb');
      p.rect(1, 2, 14, 12, '#e06a9a');
      p.rect(2, 3, 12, 10, '#f6a6c6');
      for (let i = 0; i < 3; i++) p.rect(3 + i * 4, 6, 3, 4, f && i === 1 ? '#ffffff' : '#fff2b0');
    },
  },
  stairs: {
    paint: (p) => {
      p.fill('#8a6a44');
      for (let i = 0; i < 16; i += 4) { p.rect(0, i, 16, 3, '#c49460'); p.rect(0, i + 3, 16, 1, '#5a3a20'); }
    },
  },
  // ---------- dungeon gates
  cavefloor: { paint: (p, _f, _n, x, y) => { p.fill('#a08a72'); p.noise(0.08, '#8a745c', x * 3 + y); p.noise(0.05, '#b8a28a', x + y * 7); } },
  cavewall: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      p.fill('#5e4838');
      p.noise(0.12, '#4a3628', x * 5 + y);
      p.noise(0.08, '#7a604a', x + y * 3);
      p.rect(0, 14, 16, 2, '#3a2a1e');
    },
  },
  caverock: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      p.fill('#a08a72');
      p.noise(0.08, '#8a745c', x * 3 + y);
      p.disc(8, 9, 6.4, '#3e2e24');
      p.disc(8, 9, 5.6, '#7a604a');
      p.disc(6.5, 7.5, 2.4, '#9a806a');
      p.noise(0.05, '#5e4838', x + y * 5);
    },
  },
  caveexit: {
    paint: (p, _f, _n, x, y) => {
      p.fill('#a08a72');
      p.noise(0.08, '#8a745c', x * 3 + y);
      for (let i = 0; i < 6; i++) p.rect(0, 15 - i * 2, 16, 2, `rgba(255, 244, 200, ${0.12 + i * 0.06})`);
    },
  },
  towerwall: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      p.fill('#3d3a5c');
      for (let r = 0; r < 16; r += 5) for (let c = (r / 5) % 2 ? 0 : 4; c < 16; c += 8) p.rect(c, r, 7, 4, '#4a4770');
      p.noise(0.04, '#2a2840', x + y * 7);
      p.rect(0, 14, 16, 2, '#24223a');
    },
  },
  stairsdown: {
    paint: (p) => {
      p.fill('#4a3a5a');
      for (let i = 0; i < 16; i += 4) { p.rect(0, i, 16, 3, '#2a2238'); p.rect(0, i + 3, 16, 1, '#6a5a7a'); }
    },
  },
  // Team Gomme rubbed this part of the drawing out: blank paper with the pencil traces left
  erased: {
    solid: true,
    animated: true,
    paint: (p, f, n, x, y) => {
      p.fill('#fbf6ea');
      p.noise(0.05, '#e9e0cc', x * 7 + y * 3);
      // faint dashed outline where the drawing met the blank
      const dash = (i: number) => (i + f) % 4 < 2;
      for (let i = 0; i < 16; i++) {
        if (n(0, -1) !== 'erased' && dash(i)) p.px(i, 0, '#b8b0c4');
        if (n(0, 1) !== 'erased' && dash(i)) p.px(i, 15, '#b8b0c4');
        if (n(-1, 0) !== 'erased' && dash(i)) p.px(0, i, '#b8b0c4');
        if (n(1, 0) !== 'erased' && dash(i)) p.px(15, i, '#b8b0c4');
      }
      // eraser crumbs
      if (hash(x, y, 4) < 0.5) { p.rect(4 + Math.floor(hash(x, y, 5) * 6), 6, 2, 1, '#e8a0b0'); p.px(10, 10, '#e8a0b0'); }
    },
  },
  // the edge of the page: the world is only sketched there, not coloured in yet
  paper: {
    paint: (p, _f, _n, x, y) => {
      p.fill('#fbf6ea');
      p.noise(0.04, '#e9e0cc', x * 5 + y * 11);
      if (hash(x, y, 9) < 0.35) { p.px(3 + Math.floor(hash(x, y, 2) * 9), 6, '#b8b0c4'); p.px(4 + Math.floor(hash(x, y, 2) * 9), 5, '#b8b0c4'); }
    },
  },
  sketchtree: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      p.fill('#fbf6ea');
      const g = '#8a8494';
      for (let a = 0; a < 40; a++) {
        const t = (a / 40) * Math.PI * 2;
        const r = 6 + (hash(x, y, a) - 0.5) * 1.2;
        p.px(Math.round(8 + Math.cos(t) * r), Math.round(7 + Math.sin(t) * r * 0.9), g);
      }
      p.rect(7, 13, 1, 3, g);
      p.rect(9, 13, 1, 3, g);
    },
  },
  margin: {
    solid: true,
    paint: (p, _f, _n, x, y) => {
      p.fill('#fbf6ea');
      p.noise(0.03, '#e9e0cc', x + y * 7);
      p.rect(7, 0, 2, 16, '#e57e7e');
    },
  },
  bridge: {
    paint: (p, _f, n, x, y) => {
      water(p, 0, n, x, y);
      p.rect(0, 1, 16, 14, C.wood);
      for (let i = 1; i < 16; i += 4) p.rect(i, 1, 1, 14, C.wood2);
      p.rect(0, 1, 16, 1, C.wood2);
      p.rect(0, 14, 16, 1, C.wood2);
    },
  },
  towerfloor: { paint: (p, _f, _n, x, y) => { p.fill('#6b6a8c'); for (let i = 0; i < 16; i += 8) { p.rect(0, i, 16, 1, '#55547a'); p.rect(i + ((y % 2) * 4), 0, 1, 16, '#55547a'); } p.noise(0.03, '#8584a8', x + y); } },
};

// ---------- puzzles: drawn over whatever floor surrounds them

const FLOORS = ['towerfloor', 'floor', 'cavefloor', 'paper', 'path', 'grass', 'sand'];
const WALLS = ['cavewall', 'towerwall', 'wall'];
/** Paints the floor (or wall) the neighbours are made of, so puzzle tiles fit any dungeon. */
function under(p: Painter, n: Near, x: number, y: number, kinds = FLOORS) {
  const around = [n(-1, 0), n(1, 0), n(0, -1), n(0, 1), n(-1, -1), n(1, 1)];
  const id = kinds.find((k) => around.includes(k)) ?? (kinds === FLOORS ? 'cavefloor' : kinds[0]);
  TILES[id].paint(p, 0, n, x, y);
  return id;
}
/** A coloured-pencil stub standing up (raised barrier). */
function pencil(p: Painter, x: number, col: string, dark: string) {
  p.rect(x, 4, 5, 11, col);
  p.rect(x, 4, 1, 11, dark);
  p.rect(x + 3, 4, 1, 11, '#ffffff55');
  p.rect(x + 1, 2, 3, 2, '#e8c89a');
  p.px(x + 2, 1, dark);
  p.rect(x, 14, 5, 1, C.outline);
}
const BARRIER = { red: ['#e04848', '#9a2a2a'], blue: ['#4a7ee0', '#2a4a9a'] } as const;
function barrierUp(p: Painter, n: Near, x: number, y: number, c: keyof typeof BARRIER) {
  under(p, n, x, y);
  p.rect(1, 12, 14, 3, '#00000033');
  pencil(p, 1, BARRIER[c][0], BARRIER[c][1]);
  pencil(p, 6, BARRIER[c][0], BARRIER[c][1]);
  pencil(p, 11, BARRIER[c][0], BARRIER[c][1]);
}
function barrierDown(p: Painter, n: Near, x: number, y: number, c: keyof typeof BARRIER) {
  under(p, n, x, y);
  // only a dashed outline on the floor where the pencils will pop up
  for (let i = 1; i < 15; i += 3) {
    p.rect(i, 1, 2, 1, BARRIER[c][1]);
    p.rect(i, 14, 2, 1, BARRIER[c][1]);
    p.rect(1, i, 1, 2, BARRIER[c][1]);
    p.rect(14, i, 1, 2, BARRIER[c][1]);
  }
  p.disc(8, 8, 1.5, BARRIER[c][0]);
}
function lever(p: Painter, n: Near, x: number, y: number, c: keyof typeof BARRIER) {
  under(p, n, x, y);
  p.rect(2, 9, 12, 6, C.outline);
  p.rect(3, 10, 10, 4, '#8a8494');
  p.rect(3, 10, 10, 1, '#b8b0c4');
  // the stick leans towards the colour that stands up
  const lean = c === 'red' ? -1 : 1;
  for (let i = 0; i < 6; i++) p.rect(7 + Math.round(lean * i * 0.6), 9 - i, 2, 1, '#5a5470');
  p.disc(8 + lean * 4, 3, 2.6, C.outline);
  p.disc(8 + lean * 4, 3, 2, BARRIER[c][0]);
  p.px(7 + lean * 4, 2, '#ffffff');
}

Object.assign(TILES, {
  hole: {
    solid: true,
    paint: (p: Painter, _f: number, n: Near, x: number, y: number) => {
      under(p, n, x, y);
      p.disc(8, 8.5, 7, '#3a2a1e');
      p.disc(8, 9, 6, '#120c18');
      p.disc(8, 10, 3.5, '#000000');
      for (let a = 0; a < 8; a++) p.px(Math.round(8 + Math.cos(a) * 6.5), Math.round(8.5 + Math.sin(a) * 6.5), '#5e4838');
    },
  },
  holefilled: {
    paint: (p: Painter, _f: number, n: Near, x: number, y: number) => {
      under(p, n, x, y);
      p.disc(8, 8.5, 7, '#5e4838');
      p.disc(8, 8.5, 6, '#9a9488');
      p.disc(6.5, 7, 2.5, '#b8b2a6');
      p.noise(0.1, '#7a746a', x * 7 + y);
    },
  },
  plate: {
    paint: (p: Painter, _f: number, n: Near, x: number, y: number) => {
      under(p, n, x, y);
      p.rect(1, 1, 14, 14, C.outline);
      p.rect(2, 2, 12, 12, '#b8b0a4');
      p.rect(2, 2, 12, 1, '#d8d0c4');
      p.rect(2, 13, 12, 1, '#8a8478');
      // a crayon-drawn weight sign
      p.rect(5, 6, 6, 5, '#6a6478');
      p.rect(7, 4, 2, 2, '#6a6478');
      p.rect(6, 7, 4, 3, '#f2c14e');
    },
  },
  gate: {
    solid: true,
    paint: (p: Painter, _f: number, n: Near, x: number, y: number) => {
      const floor = under(p, n, x, y);
      const metal = floor !== 'cavefloor';
      const [bar, band] = metal ? ['#8a8ea8', '#5a5e78'] : ['#9a6a3a', '#5a3a20'];
      p.rect(0, 1, 16, 14, C.outline);
      for (let i = 1; i < 16; i += 3) p.rect(i, 2, 2, 12, bar);
      p.rect(0, 4, 16, 2, band);
      p.rect(0, 10, 16, 2, band);
      if (metal) p.rect(5, 6, 6, 4, '#f2c14e');
      else p.disc(8, 8, 2, '#f2c14e');
    },
  },
  redup: { solid: true, paint: (p: Painter, _f: number, n: Near, x: number, y: number) => barrierUp(p, n, x, y, 'red') },
  reddown: { paint: (p: Painter, _f: number, n: Near, x: number, y: number) => barrierDown(p, n, x, y, 'red') },
  blueup: { solid: true, paint: (p: Painter, _f: number, n: Near, x: number, y: number) => barrierUp(p, n, x, y, 'blue') },
  bluedown: { paint: (p: Painter, _f: number, n: Near, x: number, y: number) => barrierDown(p, n, x, y, 'blue') },
  leverred: { solid: true, paint: (p: Painter, _f: number, n: Near, x: number, y: number) => lever(p, n, x, y, 'red') },
  leverblue: { solid: true, paint: (p: Painter, _f: number, n: Near, x: number, y: number) => lever(p, n, x, y, 'blue') },
  // « papier glacé »: glossy paper you slide on
  glossy: {
    animated: true,
    paint: (p: Painter, f: number, _n: Near, x: number, y: number) => {
      p.fill('#e6f0fb');
      p.noise(0.03, '#ffffff', x * 3 + y * 5);
      for (let i = 0; i < 16; i++) {
        const k = (i + x * 5 + y * 3 + f * 4) % 16;
        if (k < 3) p.px(i, (i + 6) % 16, '#ffffff');
      }
      p.rect(0, 15, 16, 1, '#c4d4ea');
      p.rect(15, 0, 1, 16, '#c4d4ea');
    },
  },
  // a wall painting cut into pieces: the sliding picture puzzle
  fresque: {
    solid: true,
    paint: (p: Painter, _f: number, n: Near, x: number, y: number) => {
      // on a cave or tower wall, or on an easel outdoors
      const on = under(p, n, x, y, [...WALLS, ...FLOORS]);
      if (!WALLS.includes(on)) { p.rect(3, 12, 2, 4, '#7a5230'); p.rect(11, 12, 2, 4, '#7a5230'); }
      p.rect(1, 1, 14, 13, '#7a5230');
      p.rect(2, 2, 12, 11, '#fff3c4');
      const cols = ['#e07aa6', '#5b9be0', '#9ad978', '#f2c14e', '#b48ad6', '#f08a3a'];
      for (let i = 0; i < 9; i++) {
        const cx = 2 + (i % 3) * 4, cy = 2 + Math.floor(i / 3) * 4;
        p.rect(cx + 1, cy + 1, 2, 2, cols[(i * 5 + x + y) % cols.length]);
      }
      p.rect(2, 6, 12, 1, '#c8b48a');
      p.rect(2, 9, 12, 1, '#c8b48a');
      p.rect(6, 2, 1, 11, '#c8b48a');
      p.rect(10, 2, 1, 11, '#c8b48a');
    },
  },
});

export function tile(id: string): TileDef {
  return TILES[id] ?? TILES.void;
}

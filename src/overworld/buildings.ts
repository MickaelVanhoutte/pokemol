import { hash, makeCanvas, Painter } from './pixel';

export type BuildingKind = 'house' | 'lab' | 'center' | 'shop' | 'summon' | 'cave' | 'tower';

export interface BuildingDef {
  kind: BuildingKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Door column relative to the building's left edge (door sits on the bottom row). */
  door: number;
  roof?: string;
}

const OUT = '#2a2238';

function darker(hex: string, f = 0.75): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.round(v * f)).toString(16).padStart(2, '0');
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
}
function lighter(hex: string, f = 0.35): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.min(255, Math.round(v + (255 - v) * f)).toString(16).padStart(2, '0');
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

function roof(p: Painter, W: number, top: number, bottom: number, color: string) {
  const dark = darker(color), light = lighter(color);
  p.rect(1, top, W - 2, bottom - top, color);
  for (let y = top + 3; y < bottom; y += 4) {
    p.rect(1, y, W - 2, 1, dark);
    for (let x = (y / 4) % 2 ? 4 : 8; x < W - 2; x += 8) p.rect(x, y - 3, 1, 3, dark);
  }
  p.rect(1, top, W - 2, 2, light);
  p.rect(0, top, 1, bottom - top + 1, OUT);
  p.rect(W - 1, top, 1, bottom - top + 1, OUT);
  p.rect(0, top - 1, W, 1, OUT);
  p.rect(0, bottom, W, 2, darker(color, 0.5));
}

function wall(p: Painter, W: number, top: number, H: number, color = '#f2ead8') {
  p.rect(1, top, W - 2, H - top, color);
  p.rect(1, top, W - 2, 2, darker(color, 0.85));
  p.rect(0, top, 1, H - top, OUT);
  p.rect(W - 1, top, 1, H - top, OUT);
  p.rect(0, H - 1, W, 1, OUT);
}

function windowAt(p: Painter, x: number, y: number, w = 12, h = 9) {
  p.rect(x - 1, y - 1, w + 2, h + 2, OUT);
  p.rect(x, y, w, h, '#a8dcff');
  p.rect(x + Math.floor(w / 2), y, 1, h, '#6a8aa8');
  p.rect(x + 1, y + 1, 3, 1, '#ffffff');
}

function door(p: Painter, x: number, H: number, color = '#a06a3a') {
  p.rect(x + 2, H - 15, 12, 15, OUT);
  p.rect(x + 3, H - 14, 10, 14, color);
  p.rect(x + 3, H - 14, 10, 2, darker(color));
  p.px(x + 11, H - 7, '#f8d030');
}

export function paintBuilding(b: BuildingDef): HTMLCanvasElement {
  const W = b.w * 16, H = b.h * 16;
  const c = makeCanvas(W, H);
  const p = new Painter(c.getContext('2d')!);
  const doorX = b.door * 16;
  switch (b.kind) {
    case 'house':
    case 'center':
    case 'shop':
    case 'summon': {
      const roofColor = b.roof ?? { house: '#d9534f', center: '#e06a9a', shop: '#4a7ad6', summon: '#7b60c3' }[b.kind];
      const roofBottom = H - 22;
      roof(p, W, 3, roofBottom, roofColor);
      wall(p, W, roofBottom + 2, H);
      for (let tx = 0; tx < b.w; tx++) if (tx !== b.door && (tx + 1) % 2 === (b.door % 2) ) windowAt(p, tx * 16 + 2, roofBottom + 6);
      door(p, doorX, H, b.kind === 'center' ? '#f6a6c6' : b.kind === 'shop' ? '#7aa6f0' : b.kind === 'summon' ? '#b49ae6' : '#a06a3a');
      if (b.kind !== 'house') {
        // emblem on the roof
        const ex = Math.floor(W / 2) - 7, ey = Math.floor((3 + roofBottom) / 2) - 6;
        p.rect(ex - 1, ey - 1, 16, 14, OUT);
        p.rect(ex, ey, 14, 12, '#ffffff');
        if (b.kind === 'center') { p.rect(ex + 5, ey + 2, 4, 8, '#e06a9a'); p.rect(ex + 3, ey + 4, 8, 4, '#e06a9a'); }
        if (b.kind === 'shop') { p.rect(ex + 3, ey + 3, 8, 6, '#4a7ad6'); p.rect(ex + 5, ey + 2, 4, 2, '#4a7ad6'); }
        if (b.kind === 'summon') { for (const [dx, dy] of [[6, 1], [5, 3], [7, 3], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [5, 6], [6, 6], [7, 6], [8, 6], [4, 7], [5, 7], [8, 7], [9, 7], [3, 8], [4, 8], [9, 8], [10, 8]]) p.px(ex + dx, ey + dy + 1, '#7b60c3'); }
      }
      break;
    }
    case 'lab': {
      const roofBottom = H - 26;
      roof(p, W, 3, roofBottom, b.roof ?? '#8a96a8');
      wall(p, W, roofBottom + 2, H, '#e8eaf2');
      for (let tx = 0; tx < b.w; tx++) if (Math.abs(tx - b.door) > 0) windowAt(p, tx * 16 + 2, roofBottom + 6, 12, 11);
      door(p, doorX, H, '#6a7a9a');
      p.rect(W - 12, 0, 2, 8, OUT);
      p.disc(W - 11, 1, 2.5, '#f15a5a');
      break;
    }
    case 'cave': {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const nx = (x - W / 2) / (W / 2), ny = (H - y) / H;
          if (nx * nx + (ny * 1.05) ** 2 <= 1 + hash(x, y, 1) * 0.08) {
            p.px(x, y, hash(x, y, 2) < 0.15 ? '#4a3628' : hash(x, y, 3) < 0.1 ? '#8a6e56' : '#6e5442');
          }
        }
      }
      p.disc(doorX + 8, H - 2, 9, '#1a1216');
      p.rect(doorX + 1, H - 6, 14, 6, '#1a1216');
      break;
    }
    case 'tower': {
      p.rect(2, 10, W - 4, H - 10, '#5a5878');
      for (let y = 12; y < H; y += 6) for (let x = 3 + ((y / 6) % 2) * 3; x < W - 4; x += 7) p.rect(x, y, 6, 1, '#47465f');
      p.rect(2, 10, 1, H - 10, OUT); p.rect(W - 3, 10, 1, H - 10, OUT);
      for (let i = 0; i < 10; i++) p.rect(W / 2 - i * (W / 20), 10 - i, i * (W / 10), 1, i < 2 ? '#3a2a5a' : '#7b60c3');
      for (let ty = 1; ty < b.h - 1; ty++) {
        windowAt(p, W / 2 - 4, ty * 16 + 4, 8, 8);
        p.rect(W / 2 - 3, ty * 16 + 5, 6, 6, '#f8e27a');
      }
      door(p, doorX, H, '#3a2a5a');
      break;
    }
  }
  return c;
}

/** Tiles covered by a building, with the door tile left walkable. */
export function footprint(b: BuildingDef): { x: number; y: number; door: boolean }[] {
  const out: { x: number; y: number; door: boolean }[] = [];
  for (let dy = 0; dy < b.h; dy++) {
    for (let dx = 0; dx < b.w; dx++) out.push({ x: b.x + dx, y: b.y + dy, door: dy === b.h - 1 && dx === b.door });
  }
  return out;
}

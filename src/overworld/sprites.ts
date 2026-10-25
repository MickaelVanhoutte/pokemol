import { makeCanvas, Painter } from './pixel';
import type { Dir } from '../save/schema';

/** 16×16 Game Boy–style chibi characters, recolored per NPC. */
export interface Look {
  hair: string;
  hairShade?: string;
  skin?: string;
  shirt: string;
  pants: string;
  longHair?: boolean;
  /** Lab coat: shirt drawn white with a colored collar. */
  coat?: boolean;
  hat?: string;
}

const DOWN = [
  '................',
  '.....KKKKKK.....',
  '....KHHHHHHK....',
  '...KHHHHHHHHK...',
  '...KHHHHHHHHK...',
  '...KHHSSSSHHK...',
  '...KHSKSSKSHK...',
  '...KSSKSSKSSK...',
  '....KSSSSSSK....',
  '.....KKKKKK.....',
  '....KCCCCCCK....',
  '...KSKCCCCKSK...',
  '...KSKCCCCKSK...',
  '....KKPPPPKK....',
  '....KPPKKPPK....',
  '.....KK..KK.....',
];
const DOWN_WALK = [
  ...DOWN.slice(0, 10),
  '....KCCCCCCK....',
  '...KSKCCCCKSK...',
  '....KKCCCCKSK...',
  '....KPPPPPKK....',
  '....KPPKKKK.....',
  '.....KK.........',
];
const UP = [
  '................',
  '.....KKKKKK.....',
  '....KHHHHHHK....',
  '...KHHHHHHHHK...',
  '...KHHHHHHHHK...',
  '...KHHHHHHHHK...',
  '...KHHHHHHHHK...',
  '...KhHHHHHHhK...',
  '....KhhhhhhK....',
  '.....KKKKKK.....',
  '....KCCCCCCK....',
  '...KSKCCCCKSK...',
  '...KSKCCCCKSK...',
  '....KKPPPPKK....',
  '....KPPKKPPK....',
  '.....KK..KK.....',
];
const UP_WALK = [
  ...UP.slice(0, 10),
  '....KCCCCCCK....',
  '...KSKCCCCKSK...',
  '...KSKCCCCKK....',
  '....KKPPPPPK....',
  '.....KKKKPPK....',
  '.........KK.....',
];
const SIDE = [
  '................',
  '.....KKKKKK.....',
  '....KHHHHHHK....',
  '...KHHHHHHHHK...',
  '...KHHHHHHHHK...',
  '...KHHHHSSSSK...',
  '...KHHHSSSKSK...',
  '...KhHHSSSKSK...',
  '....KhSSSSSK....',
  '.....KKKKKK.....',
  '.....KCCCCK.....',
  '.....KCSSCK.....',
  '.....KCSSCK.....',
  '.....KPPPPK.....',
  '.....KPKKPK.....',
  '......KK.KK.....',
];
const SIDE_WALK = [
  ...SIDE.slice(0, 10),
  '.....KCCCCK.....',
  '....KCCSSCK.....',
  '.....KCSSCK.....',
  '.....KPPPPK.....',
  '....KPPKKPPK....',
  '....KK....KK....',
];

function longHair(rows: string[], dir: 'down' | 'up' | 'side'): string[] {
  return rows.map((r, y) => {
    if (y < 5 || y > 10) return r;
    const a = r.split('');
    if (dir === 'down') {
      a[2] = 'K'; a[3] = 'H'; a[12] = 'H'; a[13] = 'K';
    } else if (dir === 'up') {
      if (y <= 10) { for (let x = 4; x <= 11; x++) if (a[x] === 'C' || a[x] === 'K') a[x] = y === 10 ? 'h' : a[x]; }
      a[3] = 'H'; a[12] = 'H'; a[2] = 'K'; a[13] = 'K';
    } else {
      a[3] = 'H'; a[4] = 'H'; a[2] = 'K';
    }
    return a.join('');
  });
}

function hat(rows: string[]): string[] {
  return rows.map((r, y) => (y >= 1 && y <= 3 ? r.replace(/H/g, 'T').replace(/h/g, 'T') : r));
}

const FRAMES: Record<'down' | 'up' | 'side', [string[], string[]]> = {
  down: [DOWN, DOWN_WALK],
  up: [UP, UP_WALK],
  side: [SIDE, SIDE_WALK],
};

export class SpriteSheet {
  /** 6 frames in a row: down, down-walk, up, up-walk, side, side-walk. */
  canvas: HTMLCanvasElement;
  constructor(look: Look) {
    this.canvas = makeCanvas(16 * 6, 16);
    const p = new Painter(this.canvas.getContext('2d')!);
    const pal: Record<string, string> = {
      K: '#2a2238',
      H: look.hair,
      h: look.hairShade ?? shade(look.hair),
      S: look.skin ?? '#f6c9a0',
      s: shade(look.skin ?? '#f6c9a0'),
      C: look.coat ? '#f4f4f8' : look.shirt,
      P: look.pants,
      T: look.hat ?? look.hair,
    };
    let i = 0;
    for (const dir of ['down', 'up', 'side'] as const) {
      for (const base of FRAMES[dir]) {
        let rows = base;
        if (look.longHair) rows = longHair(rows, dir);
        if (look.hat) rows = hat(rows);
        p.at(i * 16, 0).sprite(rows, pal);
        if (look.coat) {
          // colored collar/tie on the coat
          if (dir !== 'up') p.at(i * 16, 0).rect(dir === 'side' ? 7 : 7, 10, 2, 2, look.shirt);
        }
        i++;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, dir: Dir, walking: boolean, step: number, x: number, y: number) {
    const set = dir === 'left' || dir === 'right' ? 'side' : dir;
    const base = set === 'down' ? 0 : set === 'up' ? 2 : 4;
    const frame = walking ? 1 : 0;
    // alternate the walking leg by mirroring every other step (down/up only)
    const mirror = (set !== 'side' && walking && step % 2 === 1) || dir === 'left';
    ctx.save();
    if (mirror) {
      ctx.translate(x + 16, y);
      ctx.scale(-1, 1);
      ctx.drawImage(this.canvas, (base + frame) * 16, 0, 16, 16, 0, 0, 16, 16);
    } else {
      ctx.drawImage(this.canvas, (base + frame) * 16, 0, 16, 16, x, y, 16, 16);
    }
    ctx.restore();
  }
}

function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * 0.72));
  return `#${[f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Player avatars to choose from at the start. */
export const AVATARS: Look[] = [
  { hair: '#e0703a', shirt: '#d64545', pants: '#3a4a8a', longHair: true },
  { hair: '#4a3020', shirt: '#3a7ad6', pants: '#2a2a3a', hat: '#d64545' },
  { hair: '#f2d05a', shirt: '#6cc05a', pants: '#5a3a8a', longHair: true },
  { hair: '#2a2238', shirt: '#f08a3a', pants: '#2a5a4a' },
];

export const LOOKS = {
  mom: { hair: '#8a4a2a', shirt: '#e07aa6', pants: '#6a4a8a', longHair: true },
  prof: { hair: '#c8c8d0', shirt: '#5a8ad6', pants: '#4a4a5a', coat: true },
  rival: { hair: '#6a3ab0', shirt: '#2a2238', pants: '#4a4a5a' },
  nurse: { hair: '#f08ab0', shirt: '#ffffff', pants: '#f08ab0', longHair: true },
  clerk: { hair: '#3a2a1a', shirt: '#4a9a5a', pants: '#2a3a5a' },
  kid: { hair: '#f2d05a', shirt: '#f15a5a', pants: '#3a5aa8' },
  girl: { hair: '#c0582a', shirt: '#b05ad6', pants: '#f2a0c0', longHair: true },
  hiker: { hair: '#6a4a2a', shirt: '#a87a3a', pants: '#5a4a3a', hat: '#5a8a3a' },
  granny: { hair: '#e8e8f0', shirt: '#7a8ad0', pants: '#5a5a8a', longHair: true },
  ghostgirl: { hair: '#4a3a6a', shirt: '#7b60c3', pants: '#2a2238', longHair: true },
  sailor: { hair: '#2a2238', shirt: '#ffffff', pants: '#3a5aa8', hat: '#ffffff' },
} satisfies Record<string, Look>;

const lookCache = new Map<string, string>();

/** One standing frame of a character, scaled up with crisp pixels (battle intros, trainer card). */
export function lookImage(look: Look, dir: 'down' | 'up', scale = 6): string {
  const key = `${JSON.stringify(look)}|${dir}|${scale}`;
  const hit = lookCache.get(key);
  if (hit) return hit;
  const sheet = new SpriteSheet(look);
  const c = makeCanvas(16 * scale, 16 * scale);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet.canvas, dir === 'down' ? 0 : 32, 0, 16, 16, 0, 0, 16 * scale, 16 * scale);
  const url = c.toDataURL();
  lookCache.set(key, url);
  return url;
}

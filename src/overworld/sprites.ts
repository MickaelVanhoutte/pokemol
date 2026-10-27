import { makeCanvas, Painter } from './pixel';
import type { Dir } from '../save/schema';
import type { Appearance, HairStyle } from '../data/appearance';

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
  /** Hairstyle beyond short / long (the player's look); `longHair` stays for the story's characters. */
  style?: HairStyle;
  skirt?: boolean;
  /** A bow or a flower in the hair. */
  bow?: string;
  /** Team Gomme: grunts wear a mask; everyone wears the eraser on the chest and an eraser cap. */
  gang?: 'grunt' | 'admin' | 'boss';
  /** Admins' and the boss's cape (drawn characters only). */
  cape?: string;
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

const put = (rows: string[], y: number, x: number, c: string) => {
  const a = rows[y].split('');
  a[x] = c;
  rows[y] = a.join('');
};

/** The player's other hairstyles, drawn over the short-haired chibi. */
function hairStyle(base: string[], dir: 'down' | 'up' | 'side', style: HairStyle): string[] {
  const rows = [...base];
  const back = dir === 'side' ? 3 : 12;
  switch (style) {
    case 'carre':
      return rows.map((r, y) => {
        if (y < 5 || y > 8) return r;
        const a = r.split('');
        if (dir !== 'side') { a[2] = 'K'; a[3] = 'H'; a[12] = 'H'; a[13] = 'K'; } else { a[2] = 'K'; a[3] = 'H'; }
        return a.join('');
      });
    case 'couettes':
      // a tail on each side (one from the side), two pixels wide, tied to the head
      for (const y of [4, 5, 6, 7]) {
        put(rows, y, 0, 'K'); put(rows, y, 1, 'H'); put(rows, y, 2, 'H');
        if (dir !== 'side') { put(rows, y, 13, 'H'); put(rows, y, 14, 'H'); put(rows, y, 15, 'K'); }
      }
      put(rows, 8, 1, 'K'); put(rows, 8, 2, 'K');
      if (dir !== 'side') { put(rows, 8, 13, 'K'); put(rows, 8, 14, 'K'); }
      return rows;
    case 'queue':
      if (dir === 'up') for (const y of [8, 9, 10, 11]) { put(rows, y, 7, 'H'); put(rows, y, 8, 'h'); }
      else {
        // the tail sticks out behind the head (on the right from the front)
        const x = back, step = dir === 'side' ? -1 : 1;
        for (const y of [3, 4, 5, 6]) { put(rows, y, x, 'H'); put(rows, y, x + step, 'H'); put(rows, y, x + 2 * step, 'K'); }
        put(rows, 7, x + step, 'K');
      }
      return rows;
    case 'chignon':
      rows[0] = '......KKKK......';
      put(rows, 1, 6, 'H'); put(rows, 1, 7, 'H'); put(rows, 1, 8, 'H'); put(rows, 1, 9, 'H');
      return rows;
    case 'pique':
      rows[0] = '.....K.K.K.K....';
      put(rows, 1, 6, 'H'); put(rows, 1, 8, 'H'); put(rows, 1, 10, 'H');
      return rows;
    case 'boucles':
      return rows.map((r, y) => {
        if (y < 2 || y > 7) return r;
        const a = r.split('');
        const l = a.indexOf('K'), rr = a.lastIndexOf('K');
        if (l > 1) { a[l - 1] = 'K'; a[l] = 'H'; }
        if (rr < 14 && dir !== 'side') { a[rr + 1] = 'K'; a[rr] = 'H'; }
        return a.join('');
      });
    default:
      return rows;
  }
}

/** A skirt over the legs. */
function skirt(rows: string[], dir: 'down' | 'up' | 'side'): string[] {
  const out = [...rows];
  if (dir === 'side') {
    out[13] = '....KPPPPPK.....';
    return out;
  }
  out[13] = '....KPPPPPPK....';
  out[14] = '...KPPPPPPPPK...';
  return out;
}

/** Team Gomme: the blue band of the eraser cap, a mask on grunts, the eraser sign on the chest. */
function gang(rows: string[], dir: 'down' | 'up' | 'side', grunt: boolean): string[] {
  const out = [...rows];
  out[3] = out[3].replace(/T/g, 'U');
  if (dir === 'up') return out;
  if (grunt) {
    const xs = dir === 'side' ? [8, 9, 10, 11] : [5, 6, 7, 8, 9, 10];
    const eyes = dir === 'side' ? [10] : [6, 9];
    for (const x of xs) { put(out, 6, x, eyes.includes(x) ? 'W' : 'M'); put(out, 7, x, eyes.includes(x) ? 'K' : 'M'); }
  }
  if (dir === 'down') { put(out, 11, 7, 'E'); put(out, 11, 8, 'U'); }
  else { put(out, 11, 7, 'E'); }
  return out;
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
      B: look.bow ?? '#e8506a',
      M: '#2e2440',
      W: '#ffffff',
      E: '#f27fa0',
      U: '#4a7ee0',
    };
    let i = 0;
    for (const dir of ['down', 'up', 'side'] as const) {
      for (const base of FRAMES[dir]) {
        let rows = base;
        if (look.longHair) rows = longHair(rows, dir);
        if (look.style) rows = hairStyle(rows, dir, look.style);
        if (look.skirt) rows = skirt(rows, dir);
        if (look.hat) rows = hat(rows);
        if (look.gang) rows = gang(rows, dir, look.gang === 'grunt');
        if (look.bow && dir !== 'up') { rows = [...rows]; put(rows, 2, dir === 'side' ? 5 : 11, 'B'); put(rows, 2, dir === 'side' ? 6 : 12, 'B'); }
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

/** The player's chibi in the world, from the look picked in the prologue. */
export function lookOf(a: Appearance): Look {
  return {
    hair: a.hairColor,
    skin: a.skin,
    shirt: a.topColor,
    pants: a.bottomColor,
    longHair: a.hair === 'long',
    style: a.hair === 'long' || a.hair === 'court' ? undefined : a.hair,
    skirt: a.bottom === 'jupe',
    hat: a.extra === 'casquette' || a.extra === 'bonnet' ? a.extraColor ?? a.topColor : undefined,
    bow: a.extra === 'noeud' ? a.extraColor ?? a.topColor : a.extra === 'fleur' ? '#f29ac8' : undefined,
  };
}

export const LOOKS = {
  mom: { hair: '#8a4a2a', shirt: '#e07aa6', pants: '#6a4a8a', longHair: true },
  prof: { hair: '#c8c8d0', shirt: '#5a8ad6', pants: '#4a4a5a', coat: true },
  rival: { hair: '#6a3ab0', shirt: '#2a2238', pants: '#4a4a5a' },
  nurse: { hair: '#f08ab0', shirt: '#ffffff', pants: '#f08ab0', longHair: true },
  innkeeper: { hair: '#8a4a2a', shirt: '#f4e2bc', pants: '#6a8a4a', longHair: true },
  clerk: { hair: '#3a2a1a', shirt: '#4a9a5a', pants: '#2a3a5a' },
  kid: { hair: '#f2d05a', shirt: '#f15a5a', pants: '#3a5aa8' },
  girl: { hair: '#c0582a', shirt: '#b05ad6', pants: '#f2a0c0', longHair: true },
  hiker: { hair: '#6a4a2a', shirt: '#a87a3a', pants: '#5a4a3a', hat: '#5a8a3a' },
  granny: { hair: '#e8e8f0', shirt: '#7a8ad0', pants: '#5a5a8a', longHair: true },
  ghostgirl: { hair: '#4a3a6a', shirt: '#7b60c3', pants: '#2a2238', longHair: true },
  sailor: { hair: '#2a2238', shirt: '#ffffff', pants: '#3a5aa8', hat: '#ffffff' },
  /** Team Gomme: grey uniform and a pink eraser cap. */
  gomme: { hair: '#5a5470', shirt: '#6e6880', pants: '#3e3a4c', hat: '#f27fa0', gang: 'grunt' },
  gommeF: { hair: '#5a5470', shirt: '#6e6880', pants: '#3e3a4c', hat: '#f27fa0', longHair: true, gang: 'grunt' },
  leaderPastel: { hair: '#f29ac8', shirt: '#9ed36a', pants: '#f2d23e', longHair: true },
  leaderPlume: { hair: '#c8b48a', shirt: '#8a5a32', pants: '#5a4a3a', hat: '#e0a030' },
  grandma: { hair: '#e8e8f0', shirt: '#d9a0c8', pants: '#6a5a8a', longHair: true },
  leaderAqua: { hair: '#3a78cc', shirt: '#8ec6fa', pants: '#f29ac8', longHair: true },
  leaderFluo: { hair: '#f2d23e', shirt: '#2a2238', pants: '#7ad6a0', longHair: true },
  leaderBraise: { hair: '#d64545', shirt: '#f08a3a', pants: '#5a3a2a', hat: '#8a5a32' },
  leaderPaillette: { hair: '#f2c8e8', shirt: '#f29ac8', pants: '#ffffff', longHair: true },
  leaderGouache: { hair: '#5a3a20', shirt: '#4fae5a', pants: '#8a5a32', hat: '#e0a030' },
  leaderEncre: { hair: '#1a1424', shirt: '#3a2a5a', pants: '#1a1424', longHair: true },
  /** Admin Blanche: all white, like correction fluid. */
  blanche: { hair: '#f4f2f8', shirt: '#e8e6f0', pants: '#9a96a8', longHair: true, hat: '#f27fa0', gang: 'admin', cape: '#c9c4dc' },
  /** The Great Eraser: tall, grey, featureless. */
  effaceur: { hair: '#d8d4e0', hairShade: '#b8b4c4', skin: '#e8e4ec', shirt: '#5a5670', pants: '#2e2a3c', hat: '#f27fa0', gang: 'boss', cape: '#3a3448' },
  /** Papa in the real world: the professor's colours, in pyjamas. */
  papa: { hair: '#c8c8d0', shirt: '#7ab0e0', pants: '#5a8ad6' },
  /** Admin Rature: Team Gomme officer, darker grey with a red eraser cap. */
  rature: { hair: '#3a3448', shirt: '#4a4458', pants: '#2e2a3c', hat: '#d64545', gang: 'admin', cape: '#8a2a3a' },
  /** Captain Buvard (Blotter): Team Gomme's sea captain, ink-blue coat and a pink eraser cap. */
  buvard: { hair: '#2a2238', shirt: '#3a4a7a', pants: '#2a2a4a', hat: '#f27fa0', gang: 'admin', cape: '#1f2a5a' },
  /** Ferryman of Port-Aquarelle. */
  passeur: { hair: '#8a6a4a', shirt: '#3a6ab0', pants: '#4a3a2a', hat: '#2a3a5a' },
  /** Cyclists on the Piste Cyclable: bright jerseys. */
  cyclist: { hair: '#2a2238', shirt: '#f2c14e', pants: '#2a2238', hat: '#e04848' },
  cyclistF: { hair: '#c0582a', shirt: '#5bd6a0', pants: '#2a2238', hat: '#4a7ee0', longHair: true },
} satisfies Record<string, Look>;

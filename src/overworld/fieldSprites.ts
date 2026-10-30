import { makeCanvas, Painter } from './pixel';

/** Pixel sprites drawn over the map for field obstacles (bush, boulder, rock, Gomme block) and the player's boat and bike (16 px wide). */
const PAL: Record<string, string> = {
  K: '#2a2238', g: '#7cc65a', G: '#4f9a3c', b: '#7a5230', w: '#e6e2d8', s: '#b8b0a4', S: '#8a8478',
  c: '#a89878', C: '#7a6a50', W: '#ffffff', P: '#f4ecd8', B: '#5b8ad6', R: '#d64545', Y: '#f2c14e',
  e: '#f4a6bc', E: '#d97a98', u: '#3a6ac0', U: '#7aa6ee',
};

const ROWS: Record<string, string[]> = {
  bush: [
    '................',
    '.....KKKKKK.....',
    '...KKggGggGKK...',
    '..KggGGggGGggK..',
    '..KgGGggGGggGK..',
    '.KggGGgggGGgggK.',
    '.KgGGggGGggGGgK.',
    '.KggggGGggGGggK.',
    '..KgGGggGGgggK..',
    '..KKggGGggGgKK..',
    '....KKKbbKKK....',
    '.......bb.......',
    '......KbbK......',
    '......KbbK......',
    '.......KK.......',
    '................',
  ],
  boulder: [
    '................',
    '.....KKKKKK.....',
    '...KKwwwwwsKK...',
    '..KwwwwwwssssK..',
    '..KwwwwwsssssK..',
    '.KwwwwsssssssSK.',
    '.KwwssssssssSSK.',
    '.KwsssssssssSSK.',
    '.KssssssssSSSSK.',
    '.KsssssssSSSSSK.',
    '..KssssSSSSSSK..',
    '..KKSSSSSSSSKK..',
    '....KKKKKKKK....',
    '................',
    '................',
    '................',
  ],
  rock: [
    '................',
    '....KKKKKKKK....',
    '..KKccccccccKK..',
    '.KccccKcccccccK.',
    '.KcccccKccccccK.',
    'KccccccKKccccCCK',
    'KcccccKccKcccCCK',
    'KccccKccccKccCCK',
    'KcccKccccccKCCCK',
    'KccccccccccKCCCK',
    '.KccccccccKCCCK.',
    '.KKCCCCCCCCCCKK.',
    '...KKKKKKKKKK...',
    '................',
    '................',
    '................',
  ],
  // a big Team Gomme eraser block: pink rubber in a blue paper sleeve
  block: [
    '................',
    '..KKKKKKKKKKKK..',
    '.KeeeeeeeeeeeeK.',
    '.KeWWeeeeeeeeEK.',
    '.KeeeeeeeeeeeEK.',
    '.KKKKKKKKKKKKKK.',
    '.KUUUUUUUUUUUuK.',
    '.KUWWUUUUUUUUuK.',
    '.KUUUUWWWWUUUuK.',
    '.KUUUUUUUUUUUuK.',
    '.KKKKKKKKKKKKKK.',
    '.KeeeeeeeeeeeEK.',
    '.KEEEEEEEEEEEEK.',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
  ],
  boat: [
    'K..............K',
    'KPK..........KPK',
    '.KPPPPPPPPPPPPK.',
    '..KPPPPBPPPPPK..',
    '...KKKKKKKKKK...',
  ],
  bike: [
    '..KKK......KKK..',
    '.K...K....K...K.',
    'K..R..KRRK..R..K',
    '.K...K....K...K.',
    '..KKK......KKK..',
  ],
};

const cache = new Map<string, { canvas: HTMLCanvasElement; img: HTMLImageElement }>();

/**
 * The sprite for an obstacle kind, 'boat' or 'bike': a decoded image once ready (Android Chrome can drop a
 * canvas's pixels when memory runs low; an image keeps them), the canvas until then.
 */
export function fieldSprite(name: keyof typeof ROWS): CanvasImageSource {
  let c = cache.get(name);
  if (!c) {
    const rows = ROWS[name];
    const canvas = makeCanvas(16, rows.length);
    new Painter(canvas.getContext('2d')!).sprite(rows, PAL);
    const img = new Image();
    img.src = canvas.toDataURL();
    c = { canvas, img };
    cache.set(name, c);
  }
  return c.img.complete && c.img.naturalWidth ? c.img : c.canvas;
}

/** The Pencil Balloon moored by an Inn (32×48): an envelope in crayon-coloured gores, its ropes, a wicker basket. */
export function balloonSprite(): CanvasImageSource {
  let c = cache.get('balloon');
  if (!c) {
    const canvas = makeCanvas(32, 48);
    const p = new Painter(canvas.getContext('2d')!);
    const OUT = PAL.K, GORES = ['#e0453a', '#f2c14e', '#5b8ad6', '#7cc65a'];
    const cx = 16, cy = 13, r = 13;
    // round on top, narrowing down to its mouth
    const inside = (x: number, y: number) => {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (y < 0 || y > 29) return false;
      if (dy <= 5) return dx * dx + dy * dy <= r * r;
      return Math.abs(dx) <= Math.max(4, 12 - (dy - 5) * 0.75);
    };
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 32; x++) {
        if (!inside(x, y)) continue;
        const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
        const g = GORES[Math.max(0, Math.min(3, Math.floor((x - 3) / 6.5)))];
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        let col = g;
        if (dx > 6) col = shade(g, 0.78);
        if (dx < -4 && dy < -4 && dx > -10) col = shade(g, 1.25);
        p.px(x, y, edge ? OUT : col);
      }
    }
    // the gores' seams, and a white shine
    for (const sx of [9, 16, 22]) for (let y = 2; y < 29; y++) if (inside(sx, y) && inside(sx, y - 1) && inside(sx, y + 1)) p.px(sx, y, shade(GORES[Math.min(3, Math.floor((sx - 3) / 6.5))], 0.6));
    p.rect(7, 6, 2, 3, '#ffffff');
    // the mouth, the ropes, the wicker basket
    p.rect(11, 29, 10, 2, '#7a5230');
    for (const [x0, x1] of [[11, 9], [14, 13], [17, 18], [20, 22]]) {
      for (let y = 31; y < 38; y++) p.px(Math.round(x0 + ((x1 - x0) * (y - 31)) / 6), y, OUT);
    }
    p.rect(8, 38, 16, 10, OUT);
    p.rect(9, 39, 14, 8, '#b07a45');
    p.rect(9, 39, 14, 2, '#d29a5a');
    for (let y = 41; y < 47; y++) for (let x = 9; x < 23; x++) if ((x + y * 2) % 4 === 0) p.px(x, y, '#7d5230');
    // a little sandbag hanging off the basket
    p.rect(23, 40, 3, 4, OUT);
    p.rect(24, 41, 1, 2, '#c9b48a');
    const img = new Image();
    img.src = canvas.toDataURL();
    c = { canvas, img };
    cache.set('balloon', c);
  }
  return c.img.complete && c.img.naturalWidth ? c.img : c.canvas;
}

/** A colour made lighter (f > 1) or darker (f < 1). */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))).toString(16).padStart(2, '0');
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

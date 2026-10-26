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

const cache = new Map<string, HTMLCanvasElement>();

/** The sprite canvas for an obstacle kind, 'boat' or 'bike'. */
export function fieldSprite(name: keyof typeof ROWS): HTMLCanvasElement {
  let c = cache.get(name);
  if (!c) {
    const rows = ROWS[name];
    c = makeCanvas(16, rows.length);
    new Painter(c.getContext('2d')!).sprite(rows, PAL);
    cache.set(name, c);
  }
  return c;
}

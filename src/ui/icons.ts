/**
 * 16×16 pixel icons (items, menu entries), painted in code like the tiles and
 * turned into data-URLs once. They replace emoji, which look different on every phone.
 */
import { makeCanvas, Painter } from '../overworld/pixel';
import { ITEM_BY_ID } from '../data/items';
import { MOVE_BY_ID } from '../data/moves';
import { TYPES } from '../data/types';

const PAL: Record<string, string> = {
  K: '#2b2536', W: '#ffffff', C: '#fff3d6', Y: '#f2c14e', y: '#c98f1e', R: '#d64545', r: '#9c2d2d',
  B: '#5b8ad6', b: '#34589c', G: '#b8b0c4', g: '#e2dce9', P: '#9a6ad6', p: '#c7a6f0', N: '#8a5a32',
  n: '#c08a52', S: '#f4c7a0', E: '#5cae5a', e: '#3a7a3a', O: '#f08a3a', T: '#3fb6b0', M: '#e07aa6',
};

/** Draws a round "Crayon-ball": colored top, ink band, white button. */
function ball(p: Painter, top: string, shade: string, stripe?: string) {
  const cx = 7.5, cy = 7.5;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > 7.2) continue;
      if (d > 6.2) { p.px(x, y, PAL.K); continue; }
      let c: string;
      if (y >= 7 && y <= 8) c = PAL.K;
      else if (y < 7) c = stripe && (x === 5 || x === 10) ? stripe : x + y > 16 ? shade : top;
      else c = x + y > 19 ? PAL.G : PAL.W;
      p.px(x, y, c);
    }
  }
  p.disc(7.5, 7.5, 2.4, PAL.K);
  p.disc(7.5, 7.5, 1.4, PAL.W);
  // highlight
  p.px(4, 3, PAL.W);
  p.px(5, 2, PAL.W);
}

/** A round berry with a leaf: light and dark tone of its colour. */
function berry(p: Painter, light: string, dark: string) {
  for (let y = 4; y < 16; y++) {
    for (let x = 1; x < 15; x++) {
      const d = Math.hypot(x - 7.5, y - 9.5);
      if (d > 6) continue;
      p.px(x, y, d > 5 ? PAL.K : x + y > 19 ? dark : light);
    }
  }
  p.px(5, 7, PAL.W);
  p.px(4, 8, PAL.W);
  // stem and leaf
  p.rect(7, 2, 1, 3, PAL.K);
  p.rect(8, 1, 3, 1, PAL.K);
  p.rect(8, 2, 4, 1, PAL.E);
  p.rect(9, 3, 2, 1, PAL.e);
}

/** A small flask for battle items (syrups…), with a coloured label. */
function flask(p: Painter, liquid: string, label: string) {
  const rows = [
    '.....KKKK.......',
    '.....KggK.......',
    '.....KggK.......',
    '....KKggKK......',
    '...KLLLLLLK.....',
    '..KLLLLLLLLK....',
    '..KLWLLLLLLK....',
    '..KCCCCCCCCK....',
    '..KCCCCCCCCK....',
    '..KLLLLLLLLK....',
    '...KLLLLLLK.....',
    '....KKKKKK......',
  ];
  p.at(3, 2).sprite(rows, { ...PAL, L: liquid, C: label });
}

/** A stencil: a card in the colour of the move's type with a star cut out of it. */
function stencilCard(p: Painter, color: string) {
  p.rect(1, 2, 14, 12, PAL.K);
  p.rect(2, 3, 12, 10, color);
  p.rect(2, 3, 12, 1, PAL.W);
  p.at(0, 4).sprite([
    '.......K........',
    '......KCK.......',
    '.KKKKKCCCKKKKK..',
    '..KCCCCCCCCCK...',
    '...KCCCCCCCK....',
    '...KCCCKCCCK....',
    '..KCCK...KCCK...',
    '..KK.......KK...',
  ], PAL);
}

/** A coloured pencil (type boosters), its wood and lead in the colour of its type. */
function pencil(p: Painter, color: string) {
  p.at(0, 0).sprite([
    '............KK..',
    '...........KLLK.',
    '..........KCCLK.',
    '.........KLLCK..',
    '........KLLLK...',
    '.......KLLLK....',
    '......KLLLK.....',
    '.....KLLLK......',
    '....KLLLK.......',
    '...KnnnK........',
    '..KnnnK.........',
    '..KnLK..........',
    '..KKK...........',
  ], { ...PAL, L: color });
}

/** Painter for an id: the table below, a stencil tinted by its move type, or a coloured pencil. */
function painterFor(id: string): ((p: Painter) => void) | undefined {
  if (PAINTED[id]) return PAINTED[id];
  const def = ITEM_BY_ID[id];
  const mv = def?.kind === 'stencil' ? MOVE_BY_ID[def.move ?? ''] : undefined;
  if (mv) return (p) => stencilCard(p, TYPES[mv.type].color);
  return def?.hold === 'typeBoost' && def.type ? (p) => pencil(p, TYPES[def.type!].color) : undefined;
}

/** Items painted in code (berries, tinted items). */
const PAINTED: Record<string, (p: Painter) => void> = {
  'baie-bleue': (p) => berry(p, PAL.B, PAL.b),
  'baie-doree': (p) => berry(p, PAL.Y, PAL.y),
  'baie-cerise': (p) => berry(p, PAL.R, PAL.r),
  'baie-reveil': (p) => berry(p, PAL.p, PAL.P),
  'baie-peche': (p) => berry(p, PAL.S, PAL.O),
  'baie-givree': (p) => berry(p, '#bfeaf2', PAL.T),
  'baie-menthe': (p) => berry(p, '#9fe09a', PAL.e),
  'baie-prisme': (p) => berry(p, PAL.M, PAL.P),
  'sirop-attaque': (p) => flask(p, PAL.R, PAL.Y),
  'sirop-defense': (p) => flask(p, PAL.B, PAL.Y),
  'sirop-vitesse': (p) => flask(p, PAL.T, PAL.Y),
  'sirop-special': (p) => flask(p, PAL.P, PAL.Y),
  'sirop-precision': (p) => flask(p, PAL.E, PAL.Y),
  'taille-crayon': (p) => flask(p, PAL.O, PAL.W),
  'vernis': (p) => flask(p, PAL.g, PAL.M),
};

const ROWS: Record<string, string[]> = {
  'bandeau-tetu': [
    '................',
    '................',
    '..KKKKKKKKKKK...',
    '.KRRRRRRRRRRRK..',
    '.KRWWRRRRRRRRRK.',
    '.KRRRRRRRRRRRRK.',
    '..KKKKKKKKKKKRK.',
    '............KRK.',
    '...........KRrK.',
    '...........KrK..',
    '............K...',
  ],
  'lunettes-tetues': [
    '................',
    '................',
    '.KKKKK....KKKKK.',
    'KBBBBBK..KBBBBBK',
    'KBWBBBKKKKBWBBBK',
    'KBBWBBK..KBBWBBK',
    'KBBBBBK..KBBBBBK',
    '.KKKKK....KKKKK.',
  ],
  'echarpe-tetue': [
    '..KKKKKKKKKKK...',
    '.KTTTTTTTTTTTK..',
    'KTTWTTTTTTTTTTK.',
    '.KKKKKKKKKTTTTK.',
    '........KTTTTK..',
    '........KTTTK...',
    '........KTMTK...',
    '........KTTTK...',
    '........KMTTK...',
    '........KTTTK...',
    '........KKKKK...',
  ],
  'bille-ardente': [
    '.....KKKKKK.....',
    '...KKPPPPPPKK...',
    '..KPPpPPPPPPPK..',
    '.KPPWpPPPPPPPPK.',
    '.KPPppPPPPPPPPK.',
    '.KPPPPPPPPPPPPK.',
    '.KPPPPPPPPPrPPK.',
    '.KPPPPPPPPrrPPK.',
    '..KPPPPPPPPPPK..',
    '...KKPPPPPPKK...',
    '.....KKKKKK.....',
  ],
  'tablier-peintre': [
    '...KKK....KKK...',
    '..KeEEK..KEEeK..',
    '.KeEEEEKKEEEEeK.',
    '.KEEEEEKKEEEEEK.',
    '.KEEYEEKKEEYEEK.',
    '.KEEEEEKKEEEEEK.',
    '..KEEEEKKEEEEK..',
    '..KEEEEKKEEEEK..',
    '..KeEEEKKEEEeK..',
    '..KKKKKKKKKKKK..',
  ],
  'casque-pointes': [
    '...K...K...K....',
    '..KGK.KGK.KGK...',
    '..KKKKKKKKKKKK..',
    '.KGGgGGGGGGGGGK.',
    'KGGgGGGGGGGGGGGK',
    'KGGGGGGGGGGGGGGK',
    'KGGGGGKKKKKKKKKK',
    'KGGGGK..........',
    '.KKKK...........',
  ],
  'ruban-tenace': [
    '................',
    '.KKKKKKKKKKKKKK.',
    'KOOOOOOOOOOOOOOK',
    'KOWWOOOKKOOOOOOK',
    'KOOOOOKYYKOOOOOK',
    'KOOOOOKYYKOOOOOK',
    'KOOOOOOKKOOOOOOK',
    '.KKKKKKKKKKKKKK.',
  ],
  'plume-vive': [
    '............KK..',
    '..........KKWWK.',
    '........KKWWWWK.',
    '.......KWWWgWWK.',
    '......KWWWgWWK..',
    '.....KWWWgWWK...',
    '.....KWWgWWK....',
    '....KWWgWWK.....',
    '....KWgKKK......',
    '...KgK..........',
    '..KNK...........',
    '.KNK............',
    '.KK.............',
  ],
  loupe: [
    '...KKKKK........',
    '..KBBBBBK.......',
    '.KBWBBBBBK......',
    '.KBBWBBBBK......',
    '.KBBBBBBBK......',
    '.KBBBBBBBK......',
    '..KBBBBBK.......',
    '...KKKKKNK......',
    '........KNK.....',
    '.........KNK....',
    '..........KNK...',
    '...........KK...',
  ],
  'couronne-carton': [
    '..K..K..K..K....',
    '.KYKKYKKYKKYK...',
    '.KYYYYYYYYYYK...',
    '.KYRYYBYYRYYK...',
    '.KKKKKKKKKKKK...',
    '.KGGGGGGGGGGK...',
    'KGgGGGGGGGGGGK..',
    'KGGGGGGGGGGGGK..',
    '.KKKKKKKKKKKK...',
  ],
  'clochette': [
    '.......KK.......',
    '......KyyK......',
    '.....KKKKKK.....',
    '....KYYYYYYK....',
    '...KYWYYYYYYK...',
    '...KYYYYYYYYK...',
    '..KYYYYYYYYYYK..',
    '..KYYYYYYYYYYK..',
    '.KKKKKKKKKKKKKK.',
    '......KyyK......',
    '.......KK.......',
  ],
  baskets: [
    '................',
    '................',
    '................',
    '......KKKK......',
    '.....KRRRRK.....',
    '....KRWRRRK.....',
    '....KRRWRRRK....',
    '...KRRRRWRRRKK..',
    '...KRRYRRRRRRRK.',
    '..KRRRYYRRRRRRRK',
    '..KRRRRYYRRRRRRK',
    '.KWWWWWWWWWWWWWK',
    '.KGGGGGGGGGGGGGK',
    '..KKKKKKKKKKKKK.',
    '................',
    '................',
  ],
  carte: [
    'KKKKKKKKKKKKKKKK',
    'KEEEEKCCCCKBBBBK',
    'KEEEEKCCECKBBBBK',
    'KEnnEKCEEEKBBEBK',
    'KEnEEKCCECKBEEBK',
    'KEnEEKCCnnnnEBBK',
    'KEnnnnnnnCKBBBBK',
    'KEEEEKCCCCKBBRBK',
    'KEEEEKCCECKBRRRK',
    'KEEEEKCEEEKBBRBK',
    'KEEEEKCCCCKBBBBK',
    'KKKKKKKKKKKKKKKK',
  ],
  gouter: [
    '................',
    '.....KKKKKK.....',
    '...KKnnnnnnKK...',
    '..KnnNnnnnnnnK..',
    '..KnnnnnnNnnnK..',
    '.KnnnnnnnnnnnnK.',
    '.KnNnnnnnnnnNnK.',
    '.KnnnnnNnnnnnnK.',
    '.KnnnnnnnnnnnnK.',
    '..KnnNnnnnnNnK..',
    '..KnnnnnNnnnnK..',
    '...KKnnnnnnKK...',
    '.....KKKKKK.....',
  ],
  'papier-calque': [
    '..KKKKKKKKKK....',
    '..KggggggggKK...',
    '..KgggggggggKK..',
    '..KgBBBggggggK..',
    '..KgBgBggggggK..',
    '..KgBBBggggggK..',
    '..KggggBBBBggK..',
    '..KggggggggBgK..',
    '..KgggggggggBK..',
    '..KggBBBBBBBBK..',
    '..KggggggggggK..',
    '..KKKKKKKKKKKK..',
  ],
  potion: [
    '......KKKK......',
    '......KggK......',
    '.....KKKKKK.....',
    '......KWWK......',
    '.....KWPPWK.....',
    '....KPPPPPPK....',
    '...KPpPPPPPPK...',
    '...KPpPPPPPPK...',
    '...KPPPPPPPPK...',
    '...KPPPPPPPPK...',
    '....KPPPPPPK....',
    '.....KKKKKK.....',
  ],
  'super-potion': [
    '......KKKK......',
    '......KggK......',
    '.....KKKKKK.....',
    '......KWWK......',
    '.....KWMMWK.....',
    '....KMMMMMMK....',
    '...KMWMMMMMMK...',
    '...KMWMMRMMMK...',
    '...KMMMRRRMMK...',
    '...KMMMMRMMMK...',
    '....KMMMMMMK....',
    '.....KKKKKK.....',
  ],
  retouche: [
    '.............KK.',
    '............KnnK',
    '...........KnnK.',
    '..........KnNK..',
    '.........KnNK...',
    '........KggK....',
    '.......KggK.....',
    '.....KKBBK......',
    '....KBBBBK......',
    '...KBBBBK.......',
    '..KBBBK.........',
    '..KBBK..........',
    '...KK...........',
  ],
  rappel: [
    '.......KK.......',
    '......KYYK......',
    '......KYYK......',
    '.KKKKKYYYYKKKKK.',
    '.KYYYYYWYYYYYYK.',
    '..KYYYYYYYYYYK..',
    '...KYYYYYYYYK...',
    '....KYYYYYYK....',
    '...KYYYYYYYYK...',
    '...KYYYKKYYYK...',
    '..KYYKK..KKYYK..',
    '..KKK......KKK..',
  ],
  page: [
    '..KKKKKKKKKK....',
    '..KWWWWWWWWKK...',
    '..KWBBBBBBWWKK..',
    '..KWWWWWWWWWWK..',
    '..KWBBBBBBBWWK..',
    '..KWWWWWWWWWWK..',
    '..KWBBBBBWWWWK..',
    '..KWWWWWWWWWWK..',
    '..KWBBBBBBBWWK..',
    '..KWWWWWWWWWWK..',
    '..KWWKWWKWWKWK..',
    '..KKK.KK.KK.KK..',
  ],
  ticket: [
    '.KKKKKKKKKKKKKK.',
    '.KYYYYYYYYYYYYK.',
    'KYYYYYYKYYYYYYYK',
    'KyYYYYKYKYYYYYyK',
    '.KYYYKYYYKYYYYK.',
    '.KYYYYKYKYYYYYK.',
    'KyYYYYYKYYYYYYyK',
    'KYYYYYYYYYYYYYYK',
    '.KYYYYYYYYYYYYK.',
    '.KKKKKKKKKKKKKK.',
  ],
  dex: [
    '...KKKKKKKKKK...',
    '..KRRRRRRRRRRK..',
    '..KRrRRRRRRRRK..',
    '..KRrRWWWWRRRK..',
    '..KRrRWKKWRRRK..',
    '..KRrRWWWWRRRK..',
    '..KRrRRRRRRRRK..',
    '..KRrRRRRRRRRK..',
    '..KRrRRRRRRRRK..',
    '..KRrRRRRRRRRK..',
    '..KCCCCCCCCCCK..',
    '..KKKKKKKKKKKK..',
  ],
  bag: [
    '.....KKKKKK.....',
    '....KGGGGGGK....',
    '.KKKKKKKKKKKKKK.',
    '.KBBBBBBBBBBBBK.',
    '.KBbBBBBBBBBBBK.',
    '.KBbBBBYYBBBBBK.',
    '.KBbBBBYYBBBBBK.',
    '.KBbBBBBBBBBBBK.',
    '.KBBBBBBBBBBBBK.',
    '.KKKKKKKKKKKKKK.',
  ],
  card: [
    '.KKKKKKKKKKKKKK.',
    '.KCCCCCCCCCCCCK.',
    '.KCKKKKCCCCCCCK.',
    '.KCKSSKCGGGGGCK.',
    '.KCKSSKCCCCCCCK.',
    '.KCKBBKCGGGGCCK.',
    '.KCKKKKCCCCCCCK.',
    '.KCCCCCCCCCCCCK.',
    '.KKKKKKKKKKKKKK.',
  ],
  save: [
    '..KKKKKKKKKKK...',
    '..KEEEEEEEEEEK..',
    '..KEeEEEEEEEEK..',
    '..KEeEWWWWWEEK..',
    '..KEeEWBBBWEEK..',
    '..KEeEWWWWWEEK..',
    '..KEeEEEEEEEEK..',
    '..KEeEEEEEEEEK..',
    '..KEeEEEEEEEEK..',
    '..KKKKKKKKKKKK..',
  ],
  options: [
    '.......KK.......',
    '...KK.KGGK.KK...',
    '...KGKGGGGKGK...',
    '....KGGGGGGK....',
    '..KKGGGKKGGGKK..',
    '..KGGGK..KGGGK..',
    '..KGGGK..KGGGK..',
    '..KKGGGKKGGGKK..',
    '....KGGGGGGK....',
    '...KGKGGGGKGK...',
    '...KK.KGGK.KK...',
    '.......KK.......',
  ],
  close: [
    '..KK......KK....',
    '.KRRK....KRRK...',
    '..KRRK..KRRK....',
    '...KRRKKRRK.....',
    '....KRRRRK......',
    '....KRRRRK......',
    '...KRRKKRRK.....',
    '..KRRK..KRRK....',
    '.KRRK....KRRK...',
    '..KK......KK....',
  ],
};

const cache = new Map<string, string>();

/** Icon of an item or a menu entry (unknown ids get the torn page). */
export function iconUrl(id: string): string {
  const key = ROWS[id] || painterFor(id) || ['crayon-ball', 'super-crayon-ball', 'party'].includes(id) ? id : 'page';
  const hit = cache.get(key);
  if (hit) return hit;
  const c = makeCanvas(16, 16);
  const p = new Painter(c.getContext('2d')!);
  if (key === 'crayon-ball' || key === 'party') ball(p, PAL.Y, PAL.y);
  else if (key === 'super-crayon-ball') ball(p, PAL.B, PAL.b, PAL.R);
  else if (painterFor(key)) painterFor(key)!(p);
  else {
    const rows = ROWS[key];
    p.at(0, Math.floor((16 - rows.length) / 2)).sprite(rows, PAL);
  }
  const url = c.toDataURL();
  cache.set(key, url);
  return url;
}

import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/**
 * Where the two legendary Bestioles hide (src/story/legends.ts):
 * - the Lost Woods, through a gap in the Misty Woods brambles (6th badge): a maze where only the
 *   fireflies (`y`) show the way; every wrong turn brings you back to the start. Libellune comes to
 *   the clearing at night;
 * - the Scribble-Out Cave, off Route 8: crayon barriers on the first floor, glossy paper on the
 *   second (its holes drop you back up), two boulders to push into two pits on the third, where
 *   Noctaile waits.
 * Both come back after a night if knocked out.
 */

/** Wrong turns in the Lost Woods: stepping there sends you back to the start. */
const LOST = [[3, 14], [17, 14], [10, 10], [16, 11], [5, 6], [2, 8]] as const;

const RATURES_ENCOUNTERS = {
  rate: 0.08,
  anyTile: true,
  table: [
    { id: '010', w: 30, min: 36, max: 39 },
    { id: '057', w: 20, min: 36, max: 38 },
    { id: '052', w: 10, min: 35, max: 37 },
    { id: '066', w: 16, min: 36, max: 38 },
    { id: '055', w: 14, min: 36, max: 38, time: 'night' as const },
    { id: '009', w: 20, min: 35, max: 37 },
  ],
};

export const LEGEND_MAPS: Record<string, MapDef> = {
  boisPerdu: {
    id: 'boisPerdu',
    name: L('Bois Perdu', 'Lost Woods'),
    indoor: true,
    border: 'tree',
    backdrop: 'forest',
    tint: 'rgba(20, 30, 80, 0.28)',
    onEnter: 'boisPerduEnter',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTT*.~~~.*TTTTTTT',
      'TTTTTT..~~~~~..TTTTTT',
      'TTTTTTS...*....*TTTTT',
      'TTTTTTTTTTTyTTTTTTTTT',
      'TTTTTTTTTTT....TTTTTT',
      'TTTTT.TTTTTTTTyTTTTTT',
      'TTTTT.TTTTTTTT.TTTTTT',
      'TT...."y.......TTTTTT',
      'TTTTT.TTTTTTTTTTTTTTT',
      'TTTTT.TTTT.TTTTTTTTTT',
      'TTTTT""""y.""""""TTTT',
      'TTTTTTTTTT.TTTTTTTTTT',
      'TTTTTTTTTTyTTTTTTTTTT',
      'TTT"""""".......""TTT',
      'TTTTTTTTTT.TTTTTTTTTT',
      'TTTTTTTTTT:TTTTTTTTTT',
    ],
    warps: [{ x: 10, y: 16, to: { map: 'bois', x: 3, y: 14, facing: 'up' } }],
    triggers: LOST.map(([x, y]) => ({ x, y, script: 'boisPerduLost' })),
    signs: [{ x: 6, y: 3, text: L('CLAIRIÈRE DES RÊVES\nLa nuit, une lumière de vitrail vient boire au petit étang.', 'CLEARING OF DREAMS\nAt night, a stained-glass light comes to drink at the little pond.') }],
    npcs: [
      { id: 'libellune', x: 10, y: 3, look: LOOKS.kid, mon: '071', facing: 'down', script: 'libellune', hideIf: 'away:libellune' },
    ],
    items: [{ x: 14, y: 3, item: 'baie-doree' }],
    encounters: {
      rate: 0.12,
      table: [
        { id: '007', w: 25, min: 32, max: 35 },
        { id: '063', w: 20, min: 32, max: 35 },
        { id: '006', w: 25, min: 33, max: 35, time: 'night' },
        { id: '055', w: 10, min: 33, max: 35, time: 'night' },
        { id: '047', w: 12, min: 32, max: 34 },
        { id: '026', w: 15, min: 32, max: 35, time: 'day' },
      ],
    },
  },

  ratures1: {
    id: 'ratures1',
    dungeon: true,
    name: L('Grotte des Ratures', 'Scribble-Out Cave'),
    indoor: true,
    border: 'cavewall',
    backdrop: 'cave',
    tint: 'rgba(30, 10, 50, 0.3)',
    // one lever flips every crayon barrier at once: two are needed to reach the stairs down
    rows: [
      'KKKKKKKKKKKKKKKK',
      'KDkkkkkKKkkkkkkK',
      'KkKKKKkkkkKKKKkK',
      'KkkkkKKKKkkkkKkK',
      'KKKKjKKKKKKKKKKK',
      'KkkkkkkkkkkkkKKK',
      'KkKKKKKKkKKKkkLK',
      'KkkkkkkkkkkKkKKK',
      'KKKKKKKKKKKKZKKK',
      'KkkkkkLkkkkkkkkK',
      'KkkkkkkkkkkkkrkK',
      'KKKKKKKEEKKKKKKK',
    ],
    warps: [
      { x: 7, y: 11, to: { map: 'route8', x: 5, y: 17, facing: 'down' } },
      { x: 8, y: 11, to: { map: 'route8', x: 5, y: 17, facing: 'down' } },
      { x: 1, y: 1, to: { map: 'ratures2', x: 14, y: 2, facing: 'down' } },
    ],
    signs: [{ x: 13, y: 10, text: L('Gribouillé sur la roche : « Un levier lève et baisse toutes les barrières à la fois. Il en faudra deux. »', 'Scribbled on the rock: “A lever raises and lowers every barrier at once. You’ll need two.”') }],
    items: [{ x: 9, y: 3, item: 'super-potion', count: 2 }, { x: 14, y: 3, item: 'super-crayon-ball', count: 2 }],
    encounters: RATURES_ENCOUNTERS,
  },

  ratures2: {
    id: 'ratures2',
    dungeon: true,
    name: L('Grotte des Ratures — en dessous', 'Scribble-Out Cave — below'),
    indoor: true,
    border: 'cavewall',
    backdrop: 'cave',
    tint: 'rgba(30, 10, 50, 0.36)',
    // glossy paper from the stairs (top right) to the stairs down (bottom left); the holes drop you
    // back to the floor above
    rows: [
      'KKKKKKKKKKKKKKKK',
      'KkkKKKKKKKKKKkUK',
      'KkkIIIIIIIIIIkkK',
      'KKIIIrIIIIIOIIkK',
      'KKIIIIIIIrIIIIkK',
      'KkIrIIIOIIIIIrKK',
      'KkIIIIIIIIIIIIKK',
      'KKIIIIrIIIIIrIKK',
      'KKIIIIIIIIIIIIkK',
      'KKKIIrIIIIIIIIkK',
      'KDkIIIIIIIIrIIkK',
      'KKKKKKKKKKKKKKKK',
    ],
    holes: [
      { x: 11, y: 3, to: { map: 'ratures1', x: 2, y: 1, facing: 'down' }, fall: true },
      { x: 7, y: 5, to: { map: 'ratures1', x: 2, y: 1, facing: 'down' }, fall: true },
    ],
    warps: [
      { x: 14, y: 1, to: { map: 'ratures1', x: 1, y: 2, facing: 'down' } },
      { x: 1, y: 10, to: { map: 'ratures3', x: 6, y: 10, facing: 'up' } },
    ],
    items: [{ x: 1, y: 1, item: 'retouche', count: 2 }],
    encounters: RATURES_ENCOUNTERS,
  },

  ratures3: {
    id: 'ratures3',
    dungeon: true,
    name: L('Grotte des Ratures — tout au fond', 'Scribble-Out Cave — the very bottom'),
    indoor: true,
    border: 'cavewall',
    backdrop: 'cave',
    tint: 'rgba(20, 5, 40, 0.42)',
    onEnter: 'ratures3Enter',
    rows: [
      'KKKKKKKKKKKKKKKK',
      'KKKKKKKKkkkkkKKK',
      'KKKKKKKkkkkkkkKK',
      'KKKKkkkkkkkkkKKK',
      'KKKKOKKKKKKKKKKK',
      'KKKKOKKKKKKKKKKK',
      'KKkkkkkkkrkkkKKK',
      'KkkkkkkkkkkkkkKK',
      'KkkkrkkkkkkkkkKK',
      'KKkkkkkkkkkkkKKK',
      'KKKKkkkkkkkKKKKK',
      'KKKKKKUKKKKKKKKK',
    ],
    obstacles: [{ id: 'ratA', x: 5, y: 9, kind: 'boulder' }, { id: 'ratB', x: 8, y: 7, kind: 'boulder' }],
    holes: [{ x: 4, y: 5 }, { x: 4, y: 4 }],
    warps: [{ x: 6, y: 11, to: { map: 'ratures2', x: 2, y: 10, facing: 'down' } }],
    signs: [{ x: 9, y: 6, text: L('Raturé, presque illisible : « …deux trous… deux rochers… mais le chemin tourne. Coincé ? Remonte et redescends. »', 'Scribbled out, nearly unreadable: “…two pits… two boulders… but the way turns. Stuck? Go up and come back down.”') }],
    npcs: [
      { id: 'noctaile', x: 10, y: 2, look: LOOKS.kid, mon: '072', facing: 'down', script: 'noctaile', hideIf: 'away:noctaile' },
    ],
  },
};

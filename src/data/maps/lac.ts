import { L } from '../../i18n';
import { guideNpc } from '../guides';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';
import { AQUARELLE_MAPS } from './aquarelle';
import { ENCRE_MAPS } from './encre';
import { PHARE_MAPS } from './phare';

/**
 * The Lac des Couleurs, north of Village-Plume (sailed up its river), between the third and fourth badges: Team
 * Gomme stopped up its three springs, red, yellow and blue (src/story/lac.ts). Under its dark patches lie its
 * depths (diving with the Bocal-Scaphandre): a sunken chapel and its fresco, the Abysses under it, a tunnel to a
 * hidden valley. The memory pearls of its legend are hidden there and in the depths of other waters.
 */

/**
 * The bottom of a stretch of water, drawn from the map above it at the same coordinates: its water (and under its bridges) is sand, its
 * dark patches circles of light (the way back up), everything else rock. `edits` then draw blocks on it (x, y,
 * rows; `?` keeps the tile).
 */
export function depthsOf(rows: string[], edits: [number, number, string[]][] = []): string[] {
  const g: string[][] = rows.map((r) => [...r].map((c) => (c === '~' || c === '=' ? '1' : c === 'd' ? '5' : '4')));
  for (const [x, y, block] of edits) {
    block.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== '?') g[y + dy][x + dx] = c; }));
  }
  return g.map((r) => r.join(''));
}

const LAC_ROWS = [
  'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
  'TTTTT.TTTT.TTTT.TTTT.TTTT.TTTT.TTTT.TTTT.TTT',
  'TssssssssssssssssssssssssssssssssssssssssssT',
  'T~~~~~~~~~~~~~~~~sRRRR$RRRRs~~~~~~~~~~~~~~~T',
  'T~~~~~~~~~~~~~~~s.R.....R.R.s~~~~~~~~~~~~~~T',
  'T~~~~~~~~~~~~~~~s"R....R..R.s~~~~~~~~~~~~~~T',
  'T~~~sssssss~~~~~s"R.......R"s~~~~~~~~~~~~~~T',
  'T~~ss..!..ss~~~~s.R.......R"s~~~~~~~~~~~~~~T',
  'T~ss.......ss~~~s.RRRR.RRRR.s~~~~~~~~~~~~~~T',
  'T~s."".....Ts~~~~s*......""s~~~~~~~~~~~~~~~T',
  'T~sT""......s~~~~sssssssssss~~~~~~~~~~~~~~~T',
  'T~s..""...".s~~~~~~~~~~~~~~~~~~~~~~sssss~~~T',
  'T~ss*....""ss~~~~~~~~~~~~~~~~~~~~~ss...ss~~T',
  'T~~ss...*.ss~~~~~~~~~~~~~~~~~~~~~s......Rs~T',
  'T~~~sssssss~~~~~~~~~~~~~~~~~~~~~~R.......s~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ss.......ssT',
  'T~~~~~~~~~~~~dd~~~~~~~~~~~~~~~~~s.........sT',
  'T~~~~~~~~~~~~dd~~~~~~~~~~~~~~~~~ss.".....ssT',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~s.."."..R~T',
  'Tdd~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~sR.."...s~T',
  'Tdd~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ss...Rs~~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~sssss~~~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~ddd~~~~~~dd~~~~~~~~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~ddd~~~~~~dd~~~~~~~~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
  'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~T',
  'Tsssssssssssssssssss~~~ssssssssssssssssssssT',
  'T..........S.*......~~~..""...""...."".....T',
  'TTT"TT"TT"T.R.....*.~~~..TTT.TTT.TTT.TTT.TTT',
  'TTTTTTTTTTTTTTTTTTTT~~~TTTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTTT~~~TTTTTTTTTTTTTTTTTTTTT',
];

/** Water Bestioles of the depths: the lake's seaweed (and its own little octopus). */
const DEPTHS = (min: number, max: number) => ({
  rate: 21,
  table: [
    { id: '113', w: 30, min, max },
    { id: '101', w: 20, min, max },
    { id: '099', w: 20, min, max },
    { id: '069', w: 15, min, max },
    { id: '095', w: 10, min, max },
    { id: '060', w: 5, min, max },
  ],
});

const UNDERWATER = { backdrop: 'underwater' as const, dungeon: true, tint: 'rgba(30, 120, 225, 0.32)' };

export const LAC_MAPS: Record<string, MapDef> = {
  lac: {
    id: 'lac',
    name: L('Lac des Couleurs', 'Lake of Colours'),
    border: 'tree',
    backdrop: 'beach',
    onEnter: 'lacEnter',
    dive: 'lacFonds',
    // grey until its three springs flow again (the colours come back in a cinematic)
    drained: true,
    tint: 'rgba(150, 150, 170, 0.15)',
    tintUnless: 'lac.sources',
    // each spring freed gives back its colour, mixing with the others like paints
    primaries: [{ flag: 'lac.source:rouge', colour: 'red' }, { flag: 'lac.source:jaune', colour: 'yellow' }, { flag: 'lac.source:bleue', colour: 'blue' }],
    rows: LAC_ROWS,
    patches: [
      // each spring stopped up with a big eraser until it is freed
      { id: 'sourceRouge', x: 7, y: 7, rows: ['8'], unless: 'lac.source:rouge' },
      { id: 'sourceJaune', x: 22, y: 3, rows: ['8'], unless: 'lac.source:jaune' },
    ],
    interact: [{ x: 7, y: 7, script: 'source' }, { x: 22, y: 3, script: 'source' }],
    // the yellow spring's room: two eraser blocks to push out of the way
    obstacles: [[20, 7], [21, 7], [22, 7], [22, 5], [21, 4]].map(([x, y]) => ({ x, y, kind: 'block' as const })),
    buildings: [{ kind: 'cave', x: 36, y: 12, w: 3, h: 2, door: 1, to: { map: 'sourceBleue', x: 5, y: 8, facing: 'up' } }],
    // the river down to Village-Plume, sailed in the paper boat
    warps: [20, 21, 22].map((x, i) => ({ x, y: 31, to: { map: 'plume', x: 17 + i, y: 1, facing: 'down' as const } })),
    signs: [{ x: 11, y: 28, text: L('Camp d’expédition du Prof. Fusain. « Défense de gommer ! »', 'Prof. Charcoal’s expedition camp. “No rubbing out!”') }],
    npcs: [
      { id: 'profLac', x: 14, y: 28, look: LOOKS.prof, facing: 'down', script: 'profLac', showIf: 'badge:aquarelle' },
      guideNpc('indigo'),
      { id: 'rivalLacNpc', x: 16, y: 28, look: LOOKS.rival, facing: 'left', script: 'rivalLac', showIf: 'badge:aquarelle', hideIf: 'tr:rivalLac' },
      { id: 'lacG1', x: 7, y: 8, look: LOOKS.gomme, facing: 'down', trainer: 'lacG1', sight: 3 },
      { id: 'lacR1', x: 9, y: 11, look: { hair: '#2a2238', shirt: '#3ec4c4', pants: '#3a5aa8', longHair: true }, facing: 'left', trainer: 'lacR1', sight: 3 },
      { id: 'lacR2', x: 5, y: 8, look: { hair: '#c0582a', shirt: '#f2c14e', pants: '#5a4a6a', hat: '#e04848' }, facing: 'right', trainer: 'lacR2', sight: 3 },
      { id: 'lacJ1', x: 20, y: 9, look: { hair: '#8a4a2a', shirt: '#f29ac8', pants: '#3a5aa8', longHair: true }, facing: 'right', trainer: 'lacJ1', sight: 3 },
    ],
    items: [{ x: 3, y: 13, item: 'super-potion' }, { x: 40, y: 15, item: 'crayon-ball', count: 3 }, { x: 27, y: 4, item: 'rappel', hidden: true }],
    encounters: {
      rate: 21,
      table: [
        { id: '013', w: 25, min: 16, max: 18 },
        { id: '091', w: 20, min: 16, max: 18 },
        { id: '062', w: 20, min: 16, max: 18 },
        { id: '093', w: 15, min: 16, max: 18 },
        { id: '005', w: 10, min: 16, max: 18 },
        { id: '095', w: 10, min: 17, max: 18 },
      ],
    },
    surf: { rate: 2, table: [{ id: '003', w: 40, min: 16, max: 18 }, { id: '099', w: 40, min: 16, max: 18 }, { id: '101', w: 30, min: 16, max: 18 }, { id: '069', w: 15, min: 16, max: 18 }, { id: '095', w: 8, min: 17, max: 18 }] },
    fishing: { low: [{ id: '099', w: 150, min: 6, max: 10 }], mid: [{ id: '099', w: 100, min: 14, max: 18 }, { id: '101', w: 60, min: 14, max: 18 }], high: [{ id: '069', w: 60, min: 18, max: 22 }, { id: '095', w: 30, min: 18, max: 22 }, { id: '060', w: 6, min: 20, max: 22 }] },
  },

  // the blue spring, in a cave on the east island, guarded by Team Gomme's colour-soaker
  sourceBleue: {
    id: 'sourceBleue',
    name: L('Grotte de la Source Bleue', 'Blue Spring Cave'),
    indoor: true,
    dungeon: true,
    border: 'cavewall',
    backdrop: 'cave',
    tint: 'rgba(40, 60, 130, 0.25)',
    // grey like the lake, in the shades of the springs already freed, until its own spring flows
    drained: true,
    tintUnless: 'lac.source:bleue',
    primaries: [{ flag: 'lac.source:rouge', colour: 'red' }, { flag: 'lac.source:jaune', colour: 'yellow' }],
    rows: [
      'KKKKKKKKKKKK',
      'KKKKK+KKKKKK',
      'KkkkkkkkkkkK',
      'KkkKkkkkKkkK',
      'KkkkkkkkkkkK',
      'KkrkkkkkkrkK',
      'KkkkkkkkkkkK',
      'KkkkkkkkkkkK',
      'KkkkkkkkkkkK',
      'KKKKKEEKKKKK',
    ],
    patches: [{ id: 'sourceBleue', x: 5, y: 1, rows: ['8'], unless: 'lac.source:bleue' }],
    interact: [{ x: 5, y: 1, script: 'source' }],
    warps: [{ x: 5, y: 9, to: { map: 'lac', x: 37, y: 14, facing: 'down' } }, { x: 6, y: 9, to: { map: 'lac', x: 37, y: 14, facing: 'down' } }],
    npcs: [
      { id: 'lacChef', x: 5, y: 3, look: { ...LOOKS.gomme, shirt: '#8a86a0' }, facing: 'down', trainer: 'lacChef', sight: 4 },
      { id: 'lacG2', x: 8, y: 6, look: LOOKS.gommeF, facing: 'left', trainer: 'lacG2', sight: 3 },
    ],
  },

  // ---------------------------------------------------------------- the depths

  lacFonds: {
    id: 'lacFonds',
    name: L('Fonds du Lac', 'Lake Depths'),
    underwater: 'lac',
    ...UNDERWATER,
    border: 'reef',
    rows: depthsOf(LAC_ROWS, [
      // the tunnel to the hidden valley, under the west shore
      [0, 19, ['1', '1']],
      // Team Gomme's sunken barge, its hold open
      [28, 24, ['61116', '61916', '66666']],
      // seaweed where the Bestioles of the depths hide
      [5, 22, ['2222222', '2222222']],
      [16, 11, ['22222', '22222', '22222']],
      [28, 12, ['2222', '2222']],
      [36, 25, ['222222']],
      [18, 22, ['2222', '2222']],
      // coral
      [10, 18, ['3']], [19, 19, ['3']], [27, 17, ['3']], [40, 23, ['3']], [6, 16, ['3']], [30, 8, ['3']],
    ]),
    buildings: [{ kind: 'tower', x: 12, y: 19, w: 4, h: 3, door: 2, roof: '#6a8ab0', to: { map: 'chapelle', x: 6, y: 6, facing: 'up' } }],
    warps: [0, 1].map((i) => ({ x: 0, y: 19 + i, to: { map: 'vallon', x: 5, y: 13, facing: 'right' as const } })),
    interact: [{ x: 30, y: 25, script: 'perle' }],
    patches: [{ id: 'perleRouge', x: 30, y: 25, rows: ['1'], if: 'perle:rouge' }],
    items: [{ x: 29, y: 25, item: 'rappel', count: 2 }, { x: 31, y: 25, item: 'super-crayon-ball', count: 5 }],
    encounters: DEPTHS(18, 20),
  },

  // a chapel that sank long ago; its fresco keeps the lake's legend, and the way down to the Abysses
  chapelle: {
    id: 'chapelle',
    name: L('Chapelle Engloutie', 'Sunken Chapel'),
    underwater: 'lac',
    ...UNDERWATER,
    indoor: true,
    border: 'void',
    rows: [
      'QQQQQQFQQQQQQQ',
      'Q9oooooooooDoQ',
      'QooooooooooooQ',
      'QooQooooooQooQ',
      'QooooooooooooQ',
      'QooQooooooQooQ',
      'QooooooooooooQ',
      'QQQQQQooQQQQQQ',
    ],
    fresques: [{ x: 6, y: 0, id: 'chapelle', species: '115', size: 3, script: 'chapelleFresque' }],
    // the crypt's stairs are walled up until the fresco is whole
    patches: [{ id: 'crypte', x: 11, y: 1, rows: ['Q'], unless: 'fresque:chapelle' }, { id: 'perleOrange', x: 1, y: 1, rows: ['o'], if: 'perle:orange' }],
    interact: [{ x: 1, y: 1, script: 'perle' }],
    warps: [
      { x: 6, y: 7, to: { map: 'lacFonds', x: 14, y: 22, facing: 'down' } },
      { x: 7, y: 7, to: { map: 'lacFonds', x: 14, y: 22, facing: 'down' } },
      { x: 11, y: 1, to: { map: 'abysses', x: 11, y: 15, facing: 'up' } },
    ],
  },

  // the deepest water of the lake, under the chapel: the legend sleeps there
  abysses: {
    id: 'abysses',
    name: L('Abysses de la Palette', 'Palette Abyss'),
    underwater: 'lac',
    ...UNDERWATER,
    tint: 'rgba(20, 70, 190, 0.45)',
    indoor: true,
    border: 'reef',
    rows: [
      '444444444444444444444444',
      '444441111111[11111144444',
      '444411111111111111114444',
      '444112222111111222211444',
      '441122222114411222221144',
      '441122221144441122221144',
      '441111111144441111111144',
      '444441111111111111144444',
      '444411122221122221114444',
      '444111222221122222111444',
      '441113111111111111311144',
      '441111111444444111119144',
      '444111111444444111111444',
      '444411222221122222114444',
      '444441122221122221144444',
      '444444111111111111444444',
      '44444444444U144444444444',
      '444444444444444444444444',
    ],
    warps: [{ x: 11, y: 16, to: { map: 'chapelle', x: 11, y: 2, facing: 'down' } }],
    interact: [{ x: 12, y: 1, script: 'autel' }, { x: 20, y: 11, script: 'perle' }],
    patches: [{ id: 'perleJaune', x: 20, y: 11, rows: ['1'], if: 'perle:jaune' }],
    onEnter: 'abyssesEnter',
    npcs: [{ id: 'aquarelline', x: 12, y: 3, look: LOOKS.kid, mon: '115', facing: 'down', script: 'aquarelline', showIf: 'legende', hideIf: 'away:aquarelline' }],
    encounters: {
      rate: 21,
      table: [
        { id: '113', w: 35, min: 22, max: 25 },
        { id: '114', w: 8, min: 26, max: 28 },
        { id: '102', w: 20, min: 24, max: 26 },
        { id: '100', w: 15, min: 24, max: 26 },
        { id: '060', w: 10, min: 24, max: 26 },
        { id: '070', w: 12, min: 24, max: 26 },
      ],
    },
  },

  // ---------------------------------------------------------------- the hidden valley

  vallon: {
    id: 'vallon',
    name: L('Vallon Caché', 'Hidden Vale'),
    border: 'tree',
    backdrop: 'forest',
    onEnter: 'vallonEnter',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTT',
      'T.*.....*.....*.T....*.T',
      'T.."""..........T"""...T',
      'T..""............."""..T',
      'T......................T',
      'T......*......*.......TT',
      'T.........:..S.........T',
      'T..*......:.........*..T',
      'T.........:............T',
      'T.........:....""".....T',
      'TT........:....."""....T',
      'T~~~~s....:........"...T',
      'T~~~~s:::::..........T.T',
      'T~~~ds.................T',
      'T~~~~ss................T',
      'T~~~~s.......TT........T',
      'T......................T',
      'TTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    buildings: [{ kind: 'house', x: 9, y: 2, w: 4, h: 3, door: 1, roof: '#7ac6e8', to: { map: 'maisonGardienne', x: 4, y: 6, facing: 'up' } }],
    signs: [{ x: 13, y: 6, text: L('« Ici, on laisse les couleurs couler. »', '“Here, we let the colours run.”') }],
    // back through the tunnel under the pond
    interact: [{ x: 4, y: 13, script: 'vallonTunnel' }],
    items: [{ x: 21, y: 16, item: 'sucette-magique', hidden: true }, { x: 2, y: 2, item: 'baie-prisme' }],
    encounters: {
      rate: 21,
      table: [
        { id: '093', w: 25, min: 20, max: 23 },
        { id: '005', w: 20, min: 20, max: 23 },
        { id: '091', w: 15, min: 20, max: 23 },
        { id: '095', w: 15, min: 21, max: 23 },
        { id: '006', w: 20, min: 20, max: 23, time: 'night' },
        { id: '014', w: 5, min: 22, max: 24 },
      ],
    },
  },

  maisonGardienne: {
    id: 'maisonGardienne',
    name: L('Atelier de la Gardienne', 'The Keeper’s Studio'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWwWW',
      'bbfftfpf',
      'ffffffff',
      'fcccffff',
      'fcccfftf',
      'pfffffff',
      'ffffffff',
      'WWWWXWWW',
    ],
    warps: [{ x: 4, y: 7, to: { map: 'vallon', x: 10, y: 5, facing: 'down' } }],
    npcs: [
      { id: 'gardienne', x: 5, y: 3, look: { hair: '#e8e8f0', shirt: '#7ac6e8', pants: '#5a8ad6', longHair: true, hat: '#f29ac8' }, facing: 'down', script: 'gardienne' },
      { id: 'gardienneMon', x: 2, y: 5, mon: '095', look: LOOKS.kid, facing: 'right', text: [L('La Nénurette flotte dans une bassine d’eau colorée. Elle a l’air de se plaire ici.', 'The Lilypip floats in a basin of coloured water. It seems happy here.')] },
    ],
  },

  // ---------------------------------------------------------------- the depths of other waters

  portFonds: {
    id: 'portFonds',
    name: L('Fonds du Port', 'Harbour Depths'),
    underwater: 'port',
    ...UNDERWATER,
    border: 'reef',
    rows: depthsOf(AQUARELLE_MAPS.port.rows, [[14, 20, ['22222', '22222']], [2, 23, ['222', '222']], [9, 22, ['9']], [16, 24, ['3']], [26, 21, ['3']]]),
    interact: [{ x: 9, y: 22, script: 'perle' }],
    patches: [{ id: 'perleBleue', x: 9, y: 22, rows: ['1'], if: 'perle:bleue' }],
    encounters: DEPTHS(19, 21),
  },
  phareFonds: {
    id: 'phareFonds',
    name: L('Fonds de l’Encrier', 'Inkwell Depths'),
    underwater: 'phareIle',
    ...UNDERWATER,
    border: 'reef',
    rows: depthsOf(PHARE_MAPS.phareIle.rows, [[1, 12, ['2222', '2222']], [12, 13, ['9']], [10, 0, ['333']]]),
    interact: [{ x: 12, y: 13, script: 'perle' }],
    patches: [{ id: 'perleIndigo', x: 12, y: 13, rows: ['1'], if: 'perle:indigo' }],
    encounters: DEPTHS(27, 29),
  },
  encreFonds: {
    id: 'encreFonds',
    name: L('Fonds du Canal', 'Canal Depths'),
    underwater: 'encre',
    ...UNDERWATER,
    tint: 'rgba(20, 30, 90, 0.4)',
    border: 'reef',
    rows: depthsOf(ENCRE_MAPS.encre.rows, [[12, 12, ['22', '22']], [19, 13, ['9']]]),
    interact: [{ x: 19, y: 13, script: 'perle' }],
    patches: [{ id: 'perleViolette', x: 19, y: 13, rows: ['1'], if: 'perle:violette' }],
    encounters: DEPTHS(29, 31),
  },
};

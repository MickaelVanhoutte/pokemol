import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/**
 * L’Île de l’Encrier, south of Port-Aquarelle (the ferryman takes you there), and its lighthouse,
 * where Captain Buvard keeps the Midnight Ink he stole from Nocturne.
 */
export const PHARE_MAPS: Record<string, MapDef> = {
  phareIle: {
    id: 'phareIle',
    name: L('Île de l’Encrier', 'Inkwell Isle'),
    border: 'water',
    backdrop: 'beach',
    rows: [
      '~~~~~~~~~~~~~~~~',
      '~~~~~ssssss~~~~~',
      '~~~~ss....ss~~~~',
      '~~~ss......ss~~~',
      '~~ss........ss~~',
      '~~s..........s~~',
      '~~s..""""....s~~',
      '~~s..""""..R.s~~',
      '~~ss.......*ss~~',
      '~~~ss.....ss~~~~',
      '~~~~sss.sss~~~~~',
      '~~~~~~s=s~~~~~~~',
      '~~~~~~~=~~~~~~~~',
      '~~~~~~~~~~~~~~~~',
    ],
    buildings: [{ kind: 'tower', x: 6, y: 1, w: 4, h: 5, door: 1, roof: '#e04848', to: { map: 'phare1', x: 4, y: 8, facing: 'up' } }],
    npcs: [{ id: 'passeurIle', x: 7, y: 11, look: LOOKS.passeur, facing: 'up', script: 'passeur' }],
    items: [{ x: 12, y: 6, item: 'pierre-immuable', hidden: true }],
    encounters: {
      rate: 0.12,
      table: [
        { id: '013', w: 30, min: 32, max: 35 },
        { id: '006', w: 25, min: 32, max: 35 },
        { id: '007', w: 25, min: 33, max: 35 },
        { id: '005', w: 20, min: 32, max: 34 },
      ],
    },
    surf: { rate: 0.1, table: [{ id: '003', w: 70, min: 32, max: 36 }, { id: '013', w: 30, min: 32, max: 35 }, { id: '032', w: 20, min: 32, max: 35 }, { id: '042', w: 8, min: 34, max: 36 }] },
    fishing: { old: [{ id: '003', w: 100, min: 10, max: 14 }], good: [{ id: '003', w: 100, min: 22, max: 26 }], super: [{ id: '003', w: 100, min: 34, max: 38 }, { id: '034', w: 12, min: 34, max: 37 }, { id: '044', w: 4, min: 36, max: 37 }] },
  },

  phare1: {
    id: 'phare1',
    dungeon: true,
    name: L('Phare de l’Encrier', 'Inkwell Lighthouse'),
    indoor: true,
    border: 'void',
    backdrop: 'tower',
    tint: 'rgba(30, 40, 90, 0.18)',
    // a closet in the corner: a block dropped from 2F lands on its plate and opens it
    rows: [
      'QQQQQQQQQQ',
      'Q@oQoooUoQ',
      'QooooooooQ',
      'QQQQooQQoQ',
      'QooooooooQ',
      'QoooQQoooQ',
      'QooooooooQ',
      'QoQooooQoQ',
      'QooooooooQ',
      'QQQQXQQQQQ',
    ],
    obstacles: [{ x: 1, y: 1, kind: 'block', showIf: 'hole:phare2:8,1' }],
    puzzles: [{ flag: 'puzzle:phareCloset', plates: [[1, 1]] }],
    patches: [{ id: 'phareCloset', x: 3, y: 2, rows: ['G'], unless: 'puzzle:phareCloset' }],
    warps: [
      { x: 4, y: 9, to: { map: 'phareIle', x: 7, y: 6, facing: 'down' } },
      { x: 7, y: 1, to: { map: 'phare2', x: 7, y: 2, facing: 'down' } },
    ],
    npcs: [
      { id: 'ph1a', x: 1, y: 6, look: LOOKS.gomme, facing: 'right', trainer: 'ph1a', sight: 4 },
      { id: 'ph1b', x: 8, y: 4, look: LOOKS.gommeF, facing: 'left', trainer: 'ph1b', sight: 3 },
    ],
    items: [{ x: 2, y: 1, item: 'baie-prisme', count: 2 }, { x: 2, y: 2, item: 'rappel' }, { x: 8, y: 8, item: 'super-potion' }],
  },

  phare2: {
    id: 'phare2',
    dungeon: true,
    name: L('Phare de l’Encrier — 2e étage', 'Inkwell Lighthouse — 2F'),
    indoor: true,
    border: 'void',
    backdrop: 'tower',
    tint: 'rgba(30, 40, 90, 0.24)',
    // two eraser blocks on the two plates open the gate to the top; the spare one fits the hole
    // in the corner and falls into the closet downstairs
    rows: [
      'QQQQQQQQQQ',
      'QUoQoooDOQ',
      'QooooooooQ',
      'QQQQo@oooQ',
      'QooooooooQ',
      'QoQQoooQoQ',
      'Qo@ooooooQ',
      'QooooooooQ',
      'QQQQQQQQQQ',
    ],
    obstacles: [{ id: 'phA', x: 6, y: 5, kind: 'block' }, { id: 'phB', x: 4, y: 5, kind: 'block' }, { id: 'phC', x: 7, y: 3, kind: 'block' }],
    puzzles: [{ flag: 'puzzle:phareGate', plates: [[5, 3], [2, 6]] }],
    patches: [{ id: 'phareGate', x: 3, y: 2, rows: ['G'], unless: 'puzzle:phareGate' }],
    holes: [{ x: 8, y: 1, to: { map: 'phare1', x: 1, y: 1 } }],
    signs: [{ x: 9, y: 4, text: L('Mot griffonné : « Les blocs sur les dalles, et la grille s’ouvre. Coincé ? Redescends et remonte ! »', 'A scribbled note: “Blocks on the plates, and the gate opens. Stuck? Go down and back up!”') }],
    warps: [
      { x: 7, y: 1, to: { map: 'phare1', x: 7, y: 2, facing: 'down' } },
      { x: 1, y: 1, to: { map: 'phare3', x: 1, y: 5, facing: 'up' } },
    ],
    npcs: [{ id: 'ph2a', x: 1, y: 7, look: LOOKS.gomme, facing: 'up', trainer: 'ph2a', sight: 3 }],
  },

  phare3: {
    id: 'phare3',
    dungeon: true,
    name: L('Phare de l’Encrier — lanterne', 'Inkwell Lighthouse — lantern'),
    indoor: true,
    border: 'void',
    backdrop: 'tower',
    tint: 'rgba(30, 40, 90, 0.3)',
    rows: [
      'QQQwQQwQQQ',
      'QoooommooQ',
      'QooooooooQ',
      'QooooooooQ',
      'QooooooooQ',
      'QooooooooQ',
      'QDoooooooQ',
      'QQQQQQQQQQ',
    ],
    warps: [{ x: 1, y: 6, to: { map: 'phare2', x: 1, y: 2, facing: 'down' } }],
    triggers: [{ x: 1, y: 3, w: 8, h: 1, script: 'buvardStop', unless: 'tr:buvard' }],
    npcs: [
      { id: 'buvard', x: 4, y: 2, look: LOOKS.buvard, facing: 'down', script: 'buvardStop', hideIf: 'a3.phare' },
      { id: 'nocturnePhare', x: 7, y: 2, look: LOOKS.leaderEncre, facing: 'left', hideIf: 'a3.phare',
        text: [L('Ce capitaine m’a volé l’Encre de Minuit… Sans elle, mon Atelier reste dans le noir.', 'That captain stole my Midnight Ink… Without it, my Atelier stays in the dark.')] },
    ],
  },
};

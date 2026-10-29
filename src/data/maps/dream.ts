import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** The end of the dream: a world not coloured in yet, the edge of the page, and waking up. */
export const DREAM_MAPS: Record<string, MapDef> = {
  routeBlanche: {
    id: 'routeBlanche',
    items: [{ x: 1, y: 8, item: 'sucette-magique', hidden: true }],
    name: L('Route Blanche', 'Blank Road'),
    border: 'sketchtree',
    backdrop: 'sketch',
    rows: [
      'YYYYYYYYYnnYYYYYYYYY',
      'YnnnnnnnnnnnnnnnnnnY',
      'YggYggggggggggggYggY',
      'YggggggggggggggggggY',
      'YggggggggggggggggggY',
      'YnYnnnnnnnnnnnnnnYnY',
      'YnnnnnnnnnnnnnnnnnnY',
      'TnnnnYnnn::nnnYnnnnT',
      'T..nnnnnn::nnnnnn..T',
      'T...nnn..::..nnn...T',
      'T.."""...::..."""..T',
      'T........::........T',
      'T.*......::......*.T',
      'T........::........T',
      'T........::........T',
      'TTTTTTTTT::TTTTTTTTT',
    ],
    warps: [
      { x: 9, y: 15, to: { map: 'encre', x: 9, y: 1, facing: 'down' } },
      { x: 10, y: 15, to: { map: 'encre', x: 10, y: 1, facing: 'down' } },
      { x: 9, y: 0, to: { map: 'bordPage', x: 7, y: 12, facing: 'up' } },
      { x: 10, y: 0, to: { map: 'bordPage', x: 8, y: 12, facing: 'up' } },
    ],
    triggers: [{ x: 9, y: 9, w: 2, h: 1, script: 'rivalFinal', if: 'a3.usine', unless: 'tr:rivalFinal' }],
    npcs: [
      { id: 'rivalEnd', x: 9, y: 6, look: LOOKS.rival, facing: 'down', script: 'rivalFinal', showIf: 'a3.usine', hideIf: 'tr:rivalFinal' },
      { id: 'rbGaston', x: 6, y: 12, look: { hair: '#8a8494', shirt: '#c9d8f0', pants: '#c9d8f0', hat: '#f4f0e6' }, facing: 'right', trainer: 'rbGaston', sight: 3 },
      { id: 'rbMila', x: 13, y: 13, look: { hair: '#c0582a', shirt: '#f6c8d8', pants: '#f6c8d8', longHair: true }, facing: 'left', trainer: 'rbMila', sight: 3 },
    ],
    // the last stretch before the Edge of the Page: only sketched grass
    encounters: {
      rate: 21,
      table: [
        { id: '011', w: 4, min: 40, max: 41, time: 'night' },
        { id: '049', w: 20, min: 40, max: 41 },
        { id: '053', w: 12, min: 40, max: 41 },
        { id: '064', w: 16, min: 40, max: 41 },
        { id: '066', w: 16, min: 40, max: 41 },
        { id: '036', w: 16, min: 40, max: 41, time: 'day' },
        { id: '057', w: 16, min: 40, max: 41 },
        { id: '079', w: 10, min: 40, max: 41 },
      ],
    },
  },

  bordPage: {
    id: 'bordPage',
    name: L('Le Bord de la Page', 'The Edge of the Page'),
    border: 'erased',
    backdrop: 'sketch',
    onEnter: 'bordPage',
    rows: [
      'eeeeeeenneeeeeee',
      '|nnnnnnnnnnnnnne',
      '|nnnnnnnnnnnnnne',
      '|nnnnnnnnnnnnnne',
      '|nnnnnnnnnnnnnne',
      '|nYnnnnnnnnnnYne',
      '|nnnnnnnnnnnnnne',
      '|nnnnnnnnnnnnnne',
      '|nYnnnnnnnnnnYne',
      '|nnnnnnnnnnnnnne',
      '|nnnnnnnnnnnnnne',
      '|nnnnnnnnnnnnnne',
      '|nnnnnnnnnnnnnne',
      'eeeeeeennneeeeee',
    ],
    warps: [
      { x: 7, y: 13, to: { map: 'routeBlanche', x: 9, y: 1, facing: 'down' } },
      { x: 8, y: 13, to: { map: 'routeBlanche', x: 10, y: 1, facing: 'down' } },
      { x: 7, y: 0, to: { map: 'galerie', x: 10, y: 16, facing: 'up' } },
      { x: 8, y: 0, to: { map: 'galerie', x: 11, y: 16, facing: 'up' } },
    ],
    // after the ending, the next page opens at the top of the sheet
    patches: [{ id: 'galerieWay', x: 7, y: 0, rows: ['ee'], unless: 'ending' }],
    triggers: [{ x: 1, y: 6, w: 13, h: 1, script: 'finalBoss', unless: 'tr:effaceur' }],
    npcs: [
      { id: 'effaceur', x: 7, y: 3, look: LOOKS.effaceur, facing: 'down', script: 'finalBoss', hideIf: 'tr:effaceur' },
      // saves that finished the story before Coconfus existed replay the new ending here (src/story/finale.ts)
      { id: 'coconBord', x: 8, y: 4, look: LOOKS.kid, mon: '073', facing: 'down', script: 'coconBord', showIf: 'ending', hideIf: 'fin' },
    ],
    items: [{ x: 13, y: 11, item: 'page-12', hidden: true }],
  },

  chambre: {
    id: 'chambre',
    name: L('Ta chambre', 'Your bedroom'),
    indoor: true,
    awake: true,
    border: 'void',
    backdrop: 'lab',
    tint: 'rgba(255, 190, 120, 0.16)',
    onEnter: 'ending',
    rows: [
      'WWwWWWWwWW',
      'bbfffffttU',
      'ffffffffff',
      'fhffffffff',
      'ffffffffff',
      'pfffffffff',
      'ffffffffff',
      'WWWWWWWWWW',
    ],
    // after the credits, the real house to look around until you go back to bed (src/story/finale.ts)
    warps: [{ x: 9, y: 1, to: { map: 'salon', x: 11, y: 2, facing: 'down' } }],
    npcs: [{ id: 'papa', x: 3, y: 3, look: LOOKS.papa, facing: 'left', script: 'papa', hideIf: 'ending' }],
    interact: [
      { x: 7, y: 1, script: 'desk' }, { x: 8, y: 1, script: 'desk' }, { x: 1, y: 3, script: 'litReel' },
      { x: 0, y: 1, script: 'livresReel' }, { x: 1, y: 1, script: 'livresReel' },
    ],
  },

  salon: {
    id: 'salon',
    name: L('Le salon', 'The living room'),
    indoor: true,
    awake: true,
    border: 'void',
    backdrop: 'lab',
    tint: 'rgba(255, 190, 120, 0.16)',
    rows: [
      'WWWWwWWwWWWW',
      '&CCffbbffvfU',
      'ffffffffffff',
      'ffttffcccfff',
      'ffttffcccfff',
      'ffffffcccffp',
      'ffffffffffff',
      'WWWWWXWWWWWW',
    ],
    warps: [{ x: 11, y: 1, to: { map: 'chambre', x: 9, y: 2, facing: 'down' } }],
    triggers: [{ x: 5, y: 7, script: 'porteReelle' }],
    npcs: [
      { id: 'maman', x: 4, y: 3, look: LOOKS.mom, facing: 'left', script: 'mamanReelle' },
      { id: 'papa', x: 9, y: 3, look: LOOKS.papa, facing: 'left', script: 'papa' },
    ],
    interact: [
      { x: 0, y: 1, script: 'frigo' }, { x: 1, y: 1, script: 'cuisine' }, { x: 2, y: 1, script: 'cuisine' },
      { x: 5, y: 1, script: 'albums' }, { x: 6, y: 1, script: 'albums' }, { x: 9, y: 1, script: 'teleReelle' },
      { x: 4, y: 0, script: 'fenetre' }, { x: 7, y: 0, script: 'fenetre' }, { x: 2, y: 3, script: 'trousse' },
      { x: 3, y: 3, script: 'trousse' }, { x: 2, y: 4, script: 'trousse' }, { x: 3, y: 4, script: 'trousse' },
    ],
  },
};

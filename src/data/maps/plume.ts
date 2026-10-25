import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Village-Plume (birds and naps) and its Atelier. Its bridge has been erased. */
export const PLUME_MAPS: Record<string, MapDef> = {
  plume: {
    id: 'plume',
    name: L('Village-Plume', 'Featherby'),
    border: 'tree',
    rows: [
      'TTTTTTTTTTTTTTTTT~~~TT',
      'T*.........,.....~~~.T',
      'T................~~~.T',
      'T................~~~.T',
      'T................~~~.T',
      'T................~~~.T',
      'T..::::::::::::..~~~.T',
      'T..:..........:..~~~.T',
      'T..:..........:..~~~.T',
      'T..:..........:::===::',
      'T..:..........:..~~~.T',
      'T..:..S.......:..~~~.T',
      'T..:::::::::::::.~~~.T',
      'T*.........:.....~~~.T',
      'T..........:.....~~~*T',
      'T....**....:..**.~~~.T',
      'T..........:.....~~~.T',
      'TTTTTTTTTTT:TTTTT~~~TT',
    ],
    // the bridge to the east was rubbed out by Team Gomme (rebuilt later in the story)
    patches: [{ id: 'plumeBridge', x: 17, y: 9, rows: ['eee'], unless: 'a2.bridge' }],
    buildings: [
      { kind: 'center', x: 4, y: 1, w: 5, h: 4, door: 2, to: { map: 'centre', x: 5, y: 6, facing: 'up' } },
      { kind: 'shop', x: 10, y: 1, w: 4, h: 4, door: 1, to: { map: 'boutique', x: 4, y: 6, facing: 'up' } },
      { kind: 'gym', x: 5, y: 7, w: 6, h: 4, door: 3, roof: '#c8b48a', to: { map: 'atelierPlume', x: 5, y: 10, facing: 'up' } },
    ],
    warps: [
      { x: 11, y: 17, to: { map: 'bois', x: 18, y: 1, facing: 'down' } },
      { x: 21, y: 9, to: { map: 'route3', x: 1, y: 2, facing: 'right' } },
    ],
    items: [{ x: 20, y: 1, item: 'page-5', hidden: true }],
    signs: [{ x: 6, y: 11, text: L('VILLAGE-PLUME\nOn y fait la sieste au chant des oiseaux.', 'FEATHERBY\nNaps to the sound of birdsong.') }],
    npcs: [
      { id: 'bridgeMan', x: 16, y: 8, look: LOOKS.sailor, facing: 'right', script: 'plumeBridge' },
      { id: 'birdKid', x: 3, y: 14, look: LOOKS.kid, facing: 'right', wander: true, text: [L('Les Piafou chantent tous les matins. Mais ce matin, ils se sont tus d’un coup…', 'The Chirpies sing every morning. But this morning they suddenly went quiet…')] },
      { id: 'plumeGranny', x: 14, y: 4, look: LOOKS.granny, facing: 'down', wander: true, text: [L('Gaspard, le Maître d’Atelier, dort plus qu’il ne se bat. Mais quand il se réveille… attention !', 'Gaspard, the Atelier Master, sleeps more than he battles. But when he wakes up… watch out!')] },
    ],
  },

  atelierPlume: {
    id: 'atelierPlume',
    name: L('Atelier Plume', 'Feather Atelier'),
    indoor: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWWWWwWW',
      'pfffffffffp',
      'fffffffffff',
      'fhffcccffhf',
      'fffffffffff',
      'fffffffffff',
      'ttffffffftt',
      'fffffffffff',
      'fffffffffff',
      'pfffffffffp',
      'fffffffffff',
      'WWWWWXWWWWW',
    ],
    warps: [{ x: 5, y: 11, to: { map: 'plume', x: 8, y: 11, facing: 'down' } }],
    npcs: [
      { id: 'gaspard', x: 5, y: 2, look: LOOKS.leaderPlume, facing: 'down', trainer: 'gaspard', sight: 1 },
      { id: 'plumeT1', x: 2, y: 7, look: LOOKS.hiker, facing: 'right', trainer: 'plumeT1', sight: 3 },
      { id: 'plumeT2', x: 8, y: 4, look: LOOKS.girl, facing: 'left', trainer: 'plumeT2', sight: 3 },
      { id: 'plumeGuide', x: 3, y: 10, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#5a8ad6' }, facing: 'right',
        text: [L('Chut… Gaspard fait la sieste. Ses Bestioles Normal tapent dur, mais les Spectres ne craignent pas leurs coups !', 'Shh… Gaspard is napping. His Normal Critters hit hard, but Ghosts don’t fear their blows!')] },
    ],
  },
};

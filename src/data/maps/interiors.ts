import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Interiors shared by every town: the exit leads back to the door you came in by. */
export const INTERIOR_MAPS: Record<string, MapDef> = {
  centre: {
    id: 'centre',
    name: L('Centre de soin', 'Healing Center'),
    indoor: true,
    generic: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWHWWwWW',
      'pfffffffffP',
      'fffCCCCCfff',
      'fffffffffff',
      'fffcccccfff',
      'tffcccccfft',
      'fffffffffff',
      'WWWWWXWWWWW',
    ],
    warps: [{ x: 5, y: 7, to: 'back' }],
    npcs: [
      { id: 'nurse', x: 5, y: 1, look: LOOKS.nurse, facing: 'down', script: 'nurse' },
      { id: 'pilot', x: 9, y: 4, look: { hair: '#c0582a', shirt: '#f2c14e', pants: '#5a3a20', hat: '#d64545' }, facing: 'left', script: 'balloon' },
      // Prof. Fusain's aide gives the Tracing Paper (shares XP), then goes back to the lab
      { id: 'aide', x: 2, y: 6, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#4a4a5a', coat: true }, facing: 'right', script: 'calqueAide', showIf: 'dex', hideIf: 'gift:calque' },
      { id: 'souvenirs', x: 1, y: 2, look: { hair: '#c8c0b0', shirt: '#5aa66a', pants: '#3a3a4a' }, facing: 'right', script: 'souvenirs' },
      { id: 'oubli', x: 9, y: 2, look: { hair: '#e07aa6', shirt: '#f2c14e', pants: '#6a4a8a', longHair: true }, facing: 'left', script: 'oubli' },
      { id: 'calligraphe', x: 8, y: 6, look: { hair: '#2a2238', shirt: '#7a5ad6', pants: '#2a2238' }, facing: 'left', script: 'calligraphe' },
      { id: 'visitor', x: 1, y: 4, look: LOOKS.sailor, facing: 'right', text: [L('Le PC dans le coin range tes Bestioles quand tu en as plus de six.', 'The PC in the corner stores your Critters when you have more than six.')] },
    ],
  },

  boutique: {
    id: 'boutique',
    name: L('Boutique', 'Shop'),
    indoor: true,
    generic: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWWwWW',
      'fffffffbb',
      'CCCffffff',
      'fffffffff',
      'fffttffpf',
      'fffffffff',
      'pffffffff',
      'WWWWXWWWW',
    ],
    warps: [{ x: 4, y: 7, to: 'back' }],
    npcs: [{ id: 'clerk', x: 1, y: 1, look: LOOKS.clerk, facing: 'down', script: 'clerk' }],
  },
};

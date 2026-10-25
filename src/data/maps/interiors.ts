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

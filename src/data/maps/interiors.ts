import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/** Interiors shared by every town: the exit leads back to the door you came in by. */
export const INTERIOR_MAPS: Record<string, MapDef> = {
  // the Inn (Auberge): the innkeeper heals, and its beds sleep until night or until morning
  centre: {
    id: 'centre',
    name: L('Auberge', 'Inn'),
    indoor: true,
    generic: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWHWWwWW',
      'pfffffffffP',
      'fffCCCCCfff',
      'fffffffffff',
      'hffcccccffh',
      'hffcccccffh',
      'fffffffffff',
      'WWWWWXWWWWW',
    ],
    warps: [{ x: 5, y: 7, to: 'back' }],
    interact: [{ x: 0, y: 4, script: 'innBed' }, { x: 0, y: 5, script: 'innBed' }, { x: 10, y: 4, script: 'innBed' }, { x: 10, y: 5, script: 'innBed' }],
    npcs: [
      { id: 'aubergiste', x: 5, y: 1, look: LOOKS.innkeeper, facing: 'down', script: 'auberge' },
      // every Inn has its own helpers: only there when entered from that town (`fromMap`), and listed
      // on the Town Map by their `service`. Prof. Fusain's aide gives the Tracing Paper (shares XP), then
      // goes back to the lab
      { id: 'aide', x: 2, y: 6, look: { hair: '#3a2a1a', shirt: '#ffffff', pants: '#4a4a5a', coat: true }, facing: 'right', script: 'calqueAide', showIf: 'dex', hideIf: 'gift:calque', fromMap: ['ville'] },
      { id: 'visitor', x: 1, y: 4, look: LOOKS.sailor, facing: 'right', fromMap: ['ville'], text: [
        L('Le PC dans le coin range tes Bestioles quand tu en as plus de six.', 'The PC in the corner stores your Critters when you have more than six.'),
        L('Et les lits sont si douillets ! On s’y endort le jour et on se réveille à la nuit tombée… ou l’inverse.', 'And the beds are so cosy! You fall asleep in the day and wake up at nightfall… or the other way round.'),
      ] },
      { id: 'calligraphe', x: 9, y: 2, look: { hair: '#2a2238', shirt: '#7a5ad6', pants: '#2a2238' }, facing: 'left', script: 'calligraphe', fromMap: ['plume'], service: L('Surnoms', 'Nicknames') },
      { id: 'souvenirs', x: 9, y: 2, look: { hair: '#c8c0b0', shirt: '#5aa66a', pants: '#3a3a4a' }, facing: 'left', script: 'souvenirs', fromMap: ['port'], service: L('Capacités oubliées', 'Forgotten moves') },
      { id: 'coach', x: 9, y: 2, look: { hair: '#2a1a10', shirt: '#d64545', pants: '#2a2a3a', hat: '#ffffff' }, facing: 'left', script: 'coachEffort', fromMap: ['feutre'], service: L('Efforts', 'Effort') },
      { id: 'humeurs', x: 9, y: 2, look: { hair: '#6a3ab0', shirt: '#e07aa6', pants: '#3a2a5a', longHair: true, bow: '#f2c14e' }, facing: 'left', script: 'humeurs', fromMap: ['braise'], service: L('Natures', 'Natures') },
      { id: 'polisseuse', x: 9, y: 2, look: { hair: '#f2c14e', shirt: '#c7a6f0', pants: '#5a4a8a', longHair: true }, facing: 'left', script: 'polisseuse', fromMap: ['paillette'], service: L('Qualités de naissance', 'Born qualities') },
      { id: 'talents', x: 9, y: 2, look: { hair: '#8a5a32', shirt: '#5cae5a', pants: '#5a3a20', hat: '#e2c46a' }, facing: 'left', script: 'talents', fromMap: ['gouache'], service: L('Talents', 'Talents') },
      { id: 'scribe', x: 9, y: 2, look: { hair: '#1a1a2a', shirt: '#34589c', pants: '#1a1a2a' }, facing: 'left', fromMap: ['encre'], text: [
        L('Ici, à Cité-Encre, on écrit tout à l’encre : impossible d’effacer !', 'Here in Ink City, we write everything in ink: no rubbing out!'),
        L('Ça rassure, par les temps qui courent.', 'That’s reassuring, these days.'),
      ] },
      { id: 'brouillonne', x: 9, y: 2, look: { hair: '#b8b0c4', shirt: '#e2dce9', pants: '#8a8296', longHair: true }, facing: 'left', fromMap: ['brouillon'], text: [
        L('Au Hameau-Brouillon, rien n’est jamais fini : on commence, on rature, on recommence.', 'In Draft Hamlet nothing is ever finished: we start, cross out, start again.'),
        L('C’est comme ça qu’on apprend !', 'That’s how you learn!'),
      ] },
      { id: 'amateur', x: 9, y: 2, look: { hair: '#c0582a', shirt: '#f2c14e', pants: '#2a2238', hat: '#2a2238' }, facing: 'left', fromMap: ['galerie'], text: [
        L('Chaque tableau de la Place a d’abord été un petit gribouillis.', 'Every painting on the Square started as a little scribble.'),
        L('Le tien aussi deviendra un chef-d’œuvre !', 'Yours will become a masterpiece too!'),
      ] },
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
  // a house in town: one room shared by the houses you can enter; who lives there depends on the door (`fromDoor`)
  maisonVille: {
    id: 'maisonVille',
    name: L('Maison', 'House'),
    indoor: true,
    generic: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWWwWW',
      'bbfffCCCv',
      'fffffffff',
      'fttffccff',
      'fttffccfh',
      'pffffffff',
      'fffffffff',
      'WWWWXWWWW',
    ],
    warps: [{ x: 4, y: 7, to: 'back' }],
    // its people come from each town's `residents`, by door
  },
  // a small cottage, for the people of the smaller houses
  maisonPetite: {
    id: 'maisonPetite',
    name: L('Maison', 'House'),
    indoor: true,
    generic: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWwWW',
      'hfffCCp',
      'fffffff',
      'ftfffcf',
      'fffffcf',
      'pffffff',
      'WWWXWWW',
    ],
    warps: [{ x: 3, y: 6, to: 'back' }],
  },
  // an artist's studio: easels (tables), shelves of crayons, a big carpet to draw on
  maisonAtelier: {
    id: 'maisonAtelier',
    name: L('Atelier d’artiste', 'Artist’s Studio'),
    indoor: true,
    generic: true,
    border: 'void',
    backdrop: 'lab',
    rows: [
      'WWwWWWWWwWW',
      'bbbfffffbbp',
      'fffffffffff',
      'ftfccccftff',
      'fffccccffff',
      'ftfffffftff',
      'pffffffffff',
      'WWWWWXWWWWW',
    ],
    warps: [{ x: 5, y: 7, to: 'back' }],
  },
};

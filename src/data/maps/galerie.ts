import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/**
 * After the ending: past the Edge of the Page, the next page is already coloured in. The Grand
 * Concours (four Grands Maîtres and the champion) and the Tour des Défis (battle tower) are here.
 */
export const GALERIE_MAPS: Record<string, MapDef> = {
  galerie: {
    id: 'galerie',
    name: L('Place des Chefs-d’Œuvre', 'Masterpiece Square'),
    border: 'tree',
    backdrop: 'city',
    onEnter: 'visitTown',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTT',
      'T....................T',
      'T....................T',
      'T....................T',
      'T....................T',
      'T....................T',
      'T..:::::::::::::::...T',
      'T..:.......:.........T',
      'T..:..F....:.........T',
      'T*.:.......:.........T',
      'T..:.......:.........T',
      'T..:.......:.........T',
      'T..:.......:.........T',
      'T..::::::::::::::::..T',
      'T*.......S::.......*.T',
      'T.........::.........T',
      'T.........::.........T',
      'TTTTTTTTTT::TTTTTTTTTT',
    ],
    buildings: [
      { kind: 'center', x: 2, y: 2, w: 5, h: 4, door: 2, to: { map: 'centre', x: 5, y: 6, facing: 'up' } },
      { kind: 'gym', x: 8, y: 1, w: 6, h: 5, door: 3, roof: '#e0b040', script: 'concoursDoor' },
      { kind: 'shop', x: 16, y: 2, w: 4, h: 4, door: 1, to: { map: 'boutique', x: 4, y: 6, facing: 'up' } },
      { kind: 'tower', x: 16, y: 8, w: 4, h: 5, door: 1, to: { map: 'tourDefis', x: 4, y: 6, facing: 'up' } },
    ],
    warps: [
      { x: 10, y: 17, to: { map: 'bordPage', x: 7, y: 1, facing: 'down' } },
      { x: 11, y: 17, to: { map: 'bordPage', x: 8, y: 1, facing: 'down' } },
    ],
    signs: [
      { x: 9, y: 14, text: L('PLACE DES CHEFS-D’ŒUVRE\n↑ Grand Concours   → Tour des Défis', 'MASTERPIECE SQUARE\n↑ Grand Contest   → Challenge Tower') },
    ],
    // the last fresque, bigger (4×4), painted on an easel
    fresques: [{ x: 6, y: 8, id: 'galerie', species: '011', size: 4, reward: { item: 'bandeau-tetu' } }],
    npcs: [
      { id: 'pantheon', x: 14, y: 7, look: LOOKS.grandma, facing: 'left', script: 'pantheon' },
      { id: 'galerieKid', x: 6, y: 10, look: LOOKS.kid, facing: 'down', wander: true,
        text: [L('Cette page-là, la petite artiste l’a coloriée en dernier. Regarde comme les couleurs débordent !', 'The little artist coloured this page in last. Look how the colours go over the lines!')] },
      { id: 'galerieGirl', x: 13, y: 15, look: LOOKS.girl, facing: 'up',
        text: [L('Au Grand Concours, on enchaîne cinq combats sans passer par un Centre de soin. Prends plein de potions !', 'At the Grand Contest you fight five battles in a row without a Healing Center. Bring lots of potions!')] },
    ],
  },

  concours: {
    id: 'concours',
    name: L('Grand Concours', 'Grand Contest'),
    indoor: true,
    border: 'void',
    backdrop: 'city',
    tint: 'rgba(240, 200, 90, 0.08)',
    rows: [
      'WWWwWwWWW',
      'pfffffffp',
      'fffcccfff',
      'fffcccfff',
      'ffffcffff',
      'WWWWcWWWW',
      'ffffcffff',
      'pfffcfffp',
      'ffffcffff',
      'WWWWcWWWW',
      'ffffcffff',
      'pfffcfffp',
      'ffffcffff',
      'WWWWcWWWW',
      'ffffcffff',
      'pfffcfffp',
      'ffffcffff',
      'WWWWcWWWW',
      'ffffcffff',
      'pfffcfffp',
      'ffffcffff',
      'WWWWXWWWW',
    ],
    warps: [{ x: 4, y: 21, to: { map: 'galerie', x: 11, y: 6, facing: 'down' } }],
    // each Grand Maître stands in a doorway and steps aside once beaten
    npcs: [
      { id: 'gc1', x: 4, y: 17, look: LOOKS.leaderAqua, facing: 'down', script: 'gc1', hideIf: 'gc:1' },
      { id: 'gc2', x: 4, y: 13, look: LOOKS.leaderBraise, facing: 'down', script: 'gc2', hideIf: 'gc:2' },
      { id: 'gc3', x: 4, y: 9, look: LOOKS.leaderPaillette, facing: 'down', script: 'gc3', hideIf: 'gc:3' },
      { id: 'gc4', x: 4, y: 5, look: LOOKS.leaderEncre, facing: 'down', script: 'gc4', hideIf: 'gc:4' },
      { id: 'gc5', x: 4, y: 1, look: LOOKS.prof, facing: 'down', script: 'gc5' },
    ],
    triggers: [
      { x: 4, y: 18, script: 'gc1', unless: 'gc:1' },
      { x: 4, y: 14, script: 'gc2', if: 'gc:1', unless: 'gc:2' },
      { x: 4, y: 10, script: 'gc3', if: 'gc:2', unless: 'gc:3' },
      { x: 4, y: 6, script: 'gc4', if: 'gc:3', unless: 'gc:4' },
      { x: 3, y: 3, w: 3, h: 1, script: 'gc5', if: 'gc:4' },
    ],
  },

  tourDefis: {
    id: 'tourDefis',
    name: L('Tour des Défis', 'Challenge Tower'),
    indoor: true,
    border: 'void',
    backdrop: 'tower',
    rows: [
      'QQQwQwQQQ',
      'pooooooop',
      'oooCCCooo',
      'ooooooooo',
      'ooooooooo',
      'ooooooooo',
      'ooooooooo',
      'QQQQXQQQQ',
    ],
    warps: [{ x: 4, y: 7, to: { map: 'galerie', x: 17, y: 13, facing: 'down' } }],
    npcs: [
      { id: 'towerDesk', x: 4, y: 1, look: LOOKS.clerk, facing: 'down', script: 'towerDesk' },
      { id: 'towerShop', x: 7, y: 3, look: LOOKS.nurse, facing: 'left', script: 'towerShop' },
      { id: 'towerFan', x: 1, y: 4, look: LOOKS.hiker, facing: 'right',
        text: [L('Là-haut, tes Bestioles combattent toutes au niveau 50. Les plus petites deviennent grandes, juste le temps d’un défi !', 'Up there, your Critters all fight at level 50. The little ones grow up, just for the challenge!')] },
    ],
  },

  tourSalle: {
    id: 'tourSalle',
    name: L('Salle des Défis', 'Challenge Room'),
    indoor: true,
    onEnter: 'towerRoom',
    border: 'void',
    backdrop: 'tower',
    rows: [
      'QQQQQQQQQ',
      'pooooooop',
      'ooocccooo',
      'ooocccooo',
      'ooocccooo',
      'ooocccooo',
      'QQQQXQQQQ',
    ],
    warps: [{ x: 4, y: 6, to: { map: 'tourDefis', x: 4, y: 3, facing: 'up' } }],
  },
};

import { L, type LText } from '../i18n';
import type { TeamMember } from '../engine/battle/types';

export interface DungeonDef {
  id: string;
  name: LText;
  intro: LText;
  lockedText: LText;
  /** Badge needed to enter. */
  requires?: string;
  rows: number;
  backdrop: 'cave' | 'tower';
  /** Creatures used by dungeon trainers and wild nodes. */
  pool: string[];
  /** Enemy level at the first and the last row. */
  levels: [number, number];
  trainerNames: LText[];
  boss: { name: LText; team: TeamMember[]; deck: string[]; intro: LText[]; outro: LText[] };
  badge: string;
  badgeName: LText;
  rewardGlitter: number;
}

const deck = ['potion', 'pile', 'pile', 'pile', 'crayon', 'gomme', 'taille-crayon', 'bouclier', 'echange', 'potion'];

export const DUNGEONS: Record<string, DungeonDef> = {
  grotte: {
    id: 'grotte',
    name: L('Grotte Gribouillis', 'Scribble Cave'),
    intro: L('L’entrée de la Grotte Gribouillis. Ses tunnels se redessinent à chaque visite…', 'The entrance to Scribble Cave. Its tunnels redraw themselves on every visit…'),
    lockedText: L('', ''),
    rows: 7,
    backdrop: 'cave',
    pool: ['004', '007', '006', '005', '008', '001', '002', '003'],
    levels: [4, 8],
    trainerNames: [L('Spéléo Max', 'Caver Max'), L('Gamine Zoé', 'Kid Zoe'), L('Mineur Bob', 'Miner Bob'), L('Artiste Léa', 'Artist Lea'), L('Campeur Tom', 'Camper Tom')],
    boss: {
      name: L('Gardien Ronflon', 'Guardian Snoozle'),
      team: [{ defId: '007', level: 7 }, { defId: '008', level: 9 }],
      deck: [...deck, 'potion+', 'bouclier+'],
      intro: [L('Ronnn… pshhh… Un énorme Ronflon bloque la sortie de la grotte !', 'Zzzz… pshhh… A huge Snoozle blocks the cave exit!'), L('Il ouvre un œil. Il n’a pas l’air content d’être réveillé…', 'It opens one eye. It doesn’t look happy to be woken up…')],
      outro: [L('Le Gardien Ronflon bâille, se pousse… et se rendort. Le passage est libre !', 'The Guardian Snoozle yawns, shuffles aside… and falls back asleep. The way is clear!')],
    },
    badge: 'grotte',
    badgeName: L('Badge Gribouillis', 'Scribble Badge'),
    rewardGlitter: 120,
  },
  tour: {
    id: 'tour',
    name: L('Tour Brumeuse', 'Misty Tower'),
    intro: L('La Tour Brumeuse. On entend des rires étouffés tout en haut…', 'The Misty Tower. Muffled giggles echo from the top…'),
    lockedText: L('Une force étrange t’empêche d’entrer… Reviens avec le Badge Gribouillis.', 'A strange force keeps you out… Come back with the Scribble Badge.'),
    requires: 'grotte',
    rows: 8,
    backdrop: 'tower',
    pool: ['009', '010', '005', '006', '007', '004', '008'],
    levels: [7, 11],
    trainerNames: [L('Médium Elsa', 'Medium Elsa'), L('Fantôme Pif', 'Spook Pif'), L('Conteuse Rose', 'Storyteller Rose'), L('Magicien Hugo', 'Magician Hugo')],
    boss: {
      name: L('Ombre de la Tour', 'Shadow of the Tower'),
      team: [{ defId: '009', level: 9 }, { defId: '010', level: 10 }, { defId: '011', level: 12 }],
      deck: [...deck, 'gribouillage', 'piece', 'professeur', 'coup-de-vent'],
      intro: [L('Hi hi hi… Tout en haut de la tour, une ombre géante te fait une grimace.', 'Hee hee hee… At the top of the tower, a giant shadow pulls a face at you.'), L('C’est Ombrouille ! Et il veut jouer…', 'It’s Gloomgrin! And it wants to play…')],
      outro: [L('Ombrouille éclate de rire et disparaît dans la brume. Quelle aventure !', 'Gloomgrin bursts out laughing and vanishes into the mist. What an adventure!')],
    },
    badge: 'tour',
    badgeName: L('Badge Brume', 'Mist Badge'),
    rewardGlitter: 200,
  },
};

/** Random events in "?" nodes. */
export const EVENTS = ['fontaine', 'coffre', 'egaree', 'dessin', 'marchand'] as const;
export type EventId = (typeof EVENTS)[number];

import { L } from '../i18n';
import type { SupportDef } from './schema';

/** Support ("Fourniture") cards: the deck-building half of the game. Upgraded versions end with "+". */
export const SUPPORT_CARDS: SupportDef[] = [
  {
    id: 'potion', name: L('Potion', 'Potion'), icon: '🧪', kind: 'objet', rarity: 'common', target: 'own', price: 60,
    effects: [{ kind: 'heal', amount: 30 }], upgrade: 'potion+',
    text: L('Soigne 30 dégâts à une de vos Bestioles.', 'Heal 30 damage from one of your Critters.'),
  },
  {
    id: 'potion+', name: L('Potion+', 'Potion+'), icon: '🧪', kind: 'objet', rarity: 'uncommon', target: 'own', price: 120,
    effects: [{ kind: 'heal', amount: 50 }],
    text: L('Soigne 50 dégâts à une de vos Bestioles.', 'Heal 50 damage from one of your Critters.'),
  },
  {
    id: 'super-potion', name: L('Super Potion', 'Super Potion'), icon: '💖', kind: 'objet', rarity: 'rare', target: 'own', price: 220,
    effects: [{ kind: 'heal', amount: 80 }, { kind: 'cure' }],
    text: L('Soigne 80 dégâts et tous les problèmes d’une de vos Bestioles.', 'Heal 80 damage and all conditions from one of your Critters.'),
  },
  {
    id: 'pile', name: L('Pile', 'Battery'), icon: '🔋', kind: 'objet', rarity: 'common', target: 'own', price: 60,
    effects: [{ kind: 'energy', count: 1 }], upgrade: 'pile+',
    text: L('Ajoutez 1 énergie à une de vos Bestioles.', 'Attach 1 energy to one of your Critters.'),
  },
  {
    id: 'pile+', name: L('Pile+', 'Battery+'), icon: '🔋', kind: 'objet', rarity: 'uncommon', target: 'own', price: 120,
    effects: [{ kind: 'energy', count: 1 }, { kind: 'draw', count: 1 }],
    text: L('Ajoutez 1 énergie à une de vos Bestioles. Piochez 1 carte.', 'Attach 1 energy to one of your Critters. Draw 1 card.'),
  },
  {
    id: 'double-pile', name: L('Double pile', 'Double Battery'), icon: '⚡', kind: 'objet', rarity: 'rare', target: 'own', price: 200,
    effects: [{ kind: 'energy', count: 2 }],
    text: L('Ajoutez 2 énergies à une de vos Bestioles.', 'Attach 2 energy to one of your Critters.'),
  },
  {
    id: 'echange', name: L('Échange', 'Swap'), icon: '🔄', kind: 'objet', rarity: 'common', target: 'ownBench', price: 50,
    effects: [{ kind: 'switch' }], upgrade: 'echange+',
    text: L('Échangez votre Bestiole active avec une de votre banc.', 'Switch your active Critter with one of your benched Critters.'),
  },
  {
    id: 'echange+', name: L('Échange+', 'Swap+'), icon: '🔄', kind: 'objet', rarity: 'uncommon', target: 'ownBench', price: 100,
    effects: [{ kind: 'switch' }, { kind: 'draw', count: 1 }],
    text: L('Échangez votre Bestiole active avec une de votre banc. Piochez 1 carte.', 'Switch your active Critter with a benched one. Draw 1 card.'),
  },
  {
    id: 'gomme', name: L('Gomme magique', 'Magic Eraser'), icon: '🧼', kind: 'objet', rarity: 'common', target: 'own', price: 50,
    effects: [{ kind: 'cure' }, { kind: 'heal', amount: 10 }], upgrade: 'gomme+',
    text: L('Efface les problèmes d’une de vos Bestioles et la soigne de 10.', 'Erase all conditions from one of your Critters and heal 10.'),
  },
  {
    id: 'gomme+', name: L('Gomme magique+', 'Magic Eraser+'), icon: '🧼', kind: 'objet', rarity: 'uncommon', target: 'own', price: 100,
    effects: [{ kind: 'cure' }, { kind: 'heal', amount: 30 }],
    text: L('Efface les problèmes d’une de vos Bestioles et la soigne de 30.', 'Erase all conditions from one of your Critters and heal 30.'),
  },
  {
    id: 'piece', name: L('Pièce porte-bonheur', 'Lucky Coin'), icon: '🪙', kind: 'objet', rarity: 'uncommon', target: 'none', price: 90,
    effects: [{ kind: 'luckyCoin' }], upgrade: 'piece+',
    text: L('Votre prochain lancer de pièce tombe du bon côté.', 'Your next coin flip lands on the side you want.'),
  },
  {
    id: 'piece+', name: L('Pièce porte-bonheur+', 'Lucky Coin+'), icon: '🪙', kind: 'objet', rarity: 'rare', target: 'none', price: 160,
    effects: [{ kind: 'luckyCoin' }, { kind: 'draw', count: 1 }],
    text: L('Votre prochain lancer tombe du bon côté. Piochez 1 carte.', 'Your next coin flip lands your way. Draw 1 card.'),
  },
  {
    id: 'crayon', name: L('Crayon pointu', 'Sharp Pencil'), icon: '✏️', kind: 'objet', rarity: 'common', target: 'none', price: 60,
    effects: [{ kind: 'atkBonus', amount: 20 }], upgrade: 'crayon+',
    text: L('La prochaine attaque de votre Bestiole active ce tour inflige 20 dégâts de plus.', 'Your active Critter’s next attack this turn does 20 more damage.'),
  },
  {
    id: 'crayon+', name: L('Crayon pointu+', 'Sharp Pencil+'), icon: '✏️', kind: 'objet', rarity: 'uncommon', target: 'none', price: 120,
    effects: [{ kind: 'atkBonus', amount: 30 }],
    text: L('La prochaine attaque de votre Bestiole active ce tour inflige 30 dégâts de plus.', 'Your active Critter’s next attack this turn does 30 more damage.'),
  },
  {
    id: 'taille-crayon', name: L('Taille-crayon', 'Sharpener'), icon: '📐', kind: 'objet', rarity: 'common', target: 'none', price: 50,
    effects: [{ kind: 'draw', count: 1 }], upgrade: 'taille-crayon+',
    text: L('Piochez 1 carte.', 'Draw 1 card.'),
  },
  {
    id: 'taille-crayon+', name: L('Taille-crayon+', 'Sharpener+'), icon: '📐', kind: 'objet', rarity: 'uncommon', target: 'none', price: 100,
    effects: [{ kind: 'draw', count: 2 }],
    text: L('Piochez 2 cartes.', 'Draw 2 cards.'),
  },
  {
    id: 'bouclier', name: L('Bouclier en carton', 'Cardboard Shield'), icon: '🛡️', kind: 'objet', rarity: 'common', target: 'none', price: 60,
    effects: [{ kind: 'protect', amount: 20 }], upgrade: 'bouclier+',
    text: L('Votre Bestiole active subit 20 dégâts de moins au prochain tour adverse.', 'Your active Critter takes 20 less damage during your opponent’s next turn.'),
  },
  {
    id: 'bouclier+', name: L('Bouclier en carton+', 'Cardboard Shield+'), icon: '🛡️', kind: 'objet', rarity: 'uncommon', target: 'none', price: 120,
    effects: [{ kind: 'protect', amount: 40 }],
    text: L('Votre Bestiole active subit 40 dégâts de moins au prochain tour adverse.', 'Your active Critter takes 40 less damage during your opponent’s next turn.'),
  },
  {
    id: 'rappel', name: L('Rappel', 'Revive'), icon: '🌟', kind: 'objet', rarity: 'rare', target: 'ownKO', price: 200,
    effects: [{ kind: 'revive', pct: 50 }],
    text: L('Une de vos Bestioles K.O. revient sur le banc avec la moitié de ses PV.', 'One of your Knocked Out Critters returns to your bench with half its HP.'),
  },
  {
    id: 'coup-de-vent', name: L('Coup de vent', 'Gust of Wind'), icon: '🌬️', kind: 'objet', rarity: 'uncommon', target: 'none', price: 90,
    effects: [{ kind: 'gust' }],
    text: L('L’adversaire échange sa Bestiole active avec une de son banc, au hasard.', 'Your opponent switches their active Critter with a random benched one.'),
  },
  {
    id: 'colle', name: L('Pot de colle', 'Glue Pot'), icon: '🍯', kind: 'objet', rarity: 'uncommon', target: 'none', price: 70,
    effects: [{ kind: 'glue' }],
    text: L('La Bestiole active adverse ne peut pas battre en retraite au prochain tour.', 'The opposing active Critter can’t retreat during the next turn.'),
  },
  {
    id: 'gribouillage', name: L('Gribouillage', 'Scribble'), icon: '🌀', kind: 'objet', rarity: 'uncommon', target: 'none', price: 80,
    effects: [{ kind: 'scribble', count: 1 }],
    text: L('L’adversaire défausse une carte de sa main, au hasard.', 'Your opponent discards a random card from their hand.'),
  },
  {
    id: 'professeur', name: L('Prof. Fusain', 'Prof. Charcoal'), icon: '🔬', kind: 'dresseur', rarity: 'uncommon', target: 'none', price: 100,
    effects: [{ kind: 'draw', count: 2 }], upgrade: 'professeur+',
    text: L('Piochez 2 cartes.', 'Draw 2 cards.'),
  },
  {
    id: 'professeur+', name: L('Prof. Fusain+', 'Prof. Charcoal+'), icon: '🔬', kind: 'dresseur', rarity: 'rare', target: 'none', price: 180,
    effects: [{ kind: 'draw', count: 2 }, { kind: 'refreshEnergy' }],
    text: L('Piochez 2 cartes et récupérez votre ⚡ du tour.', 'Draw 2 cards and get this turn’s ⚡ back.'),
  },
  {
    id: 'maman', name: L('Maman', 'Mom'), icon: '💐', kind: 'dresseur', rarity: 'uncommon', target: 'none', price: 100,
    effects: [{ kind: 'healAll', amount: 20 }], upgrade: 'maman+',
    text: L('Soigne 20 dégâts à chacune de vos Bestioles.', 'Heal 20 damage from each of your Critters.'),
  },
  {
    id: 'maman+', name: L('Maman+', 'Mom+'), icon: '💐', kind: 'dresseur', rarity: 'rare', target: 'none', price: 180,
    effects: [{ kind: 'healAll', amount: 30 }, { kind: 'draw', count: 1 }],
    text: L('Soigne 30 dégâts à chacune de vos Bestioles. Piochez 1 carte.', 'Heal 30 damage from each of your Critters. Draw 1 card.'),
  },
  {
    id: 'retour', name: L('Retour en arrière', 'Do-Over'), icon: '⏪', kind: 'dresseur', rarity: 'common', target: 'none', price: 60,
    effects: [{ kind: 'reshuffle', draw: 2 }],
    text: L('Mélangez votre main dans votre pioche, puis piochez 2 cartes.', 'Shuffle your hand into your deck, then draw 2 cards.'),
  },
];

export const SUPPORT_BY_ID: Record<string, SupportDef> = Object.fromEntries(SUPPORT_CARDS.map((c) => [c.id, c]));

export function support(id: string): SupportDef {
  const s = SUPPORT_BY_ID[id];
  if (!s) throw new Error(`Unknown support card ${id}`);
  return s;
}

/** Deck the professor gives with the first creature. */
export const STARTER_DECK = [
  'potion', 'potion', 'pile', 'pile', 'pile', 'echange', 'gomme', 'crayon', 'taille-crayon', 'bouclier',
];

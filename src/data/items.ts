import { L } from '../i18n';
import { move } from './moves';
import type { ItemDef } from './schema';

/** Technical capsules, in order (ct01…): the first eight are the Atelier Masters' rewards. */
export const TM_MOVES = [
  'rayon-d-ailes', 'coup-de-boule', 'pluie-d-aquarelle', 'eclair-fluo', 'queue-ardente', 'eclat-de-lune',
  'rafale-de-graines', 'ombre-farceuse', 'reve-eveille', 'poing-crayon', 'tache-d-encre', 'gros-baillement',
];
export const tmId = (n: number) => `ct${String(n).padStart(2, '0')}`;

function capsule(moveId: string, i: number): ItemDef {
  const mv = move(moveId);
  const n = String(i + 1).padStart(2, '0');
  return {
    id: tmId(i + 1), name: L(`CT${n} ${mv.name.fr}`, `TM${n} ${mv.name.en}`), price: 0, kind: 'tm', amount: 0, move: moveId,
    desc: L(`${mv.desc.fr} Capsule technique : elle ne s’use jamais.`, `${mv.desc.en} Technical capsule: it never wears out.`),
  };
}

export const ITEMS: ItemDef[] = [
  {
    id: 'crayon-ball', name: L('Crayon-ball', 'Pencil Ball'), price: 200, kind: 'ball', amount: 10,
    desc: L('Une balle en crayon pour attraper les Bestioles sauvages.', 'A pencil ball to catch wild Critters.'),
  },
  {
    id: 'super-crayon-ball', name: L('Super Crayon-ball', 'Great Pencil Ball'), price: 600, kind: 'ball', amount: 15,
    desc: L('Une balle plus efficace que la Crayon-ball.', 'A ball that works better than a Pencil Ball.'),
  },
  {
    id: 'potion', name: L('Potion', 'Potion'), price: 300, kind: 'heal', amount: 20,
    desc: L('Rend 20 PV à une Bestiole.', 'Restores 20 HP to a Critter.'),
  },
  {
    id: 'super-potion', name: L('Super Potion', 'Super Potion'), price: 700, kind: 'heal', amount: 60,
    desc: L('Rend 60 PV à une Bestiole.', 'Restores 60 HP to a Critter.'),
  },
  {
    id: 'retouche', name: L('Retouche', 'Touch-Up'), price: 250, kind: 'status', amount: 0,
    desc: L('Un coup de pinceau qui soigne tous les problèmes de statut.', 'A brush stroke that cures every status problem.'),
  },
  {
    id: 'rappel', name: L('Rappel', 'Revive'), price: 1500, kind: 'revive', amount: 50,
    desc: L('Réveille une Bestiole K.O. avec la moitié de ses PV.', 'Revives a fainted Critter with half its HP.'),
  },
  // ---------------------------------------------------------------- battle items (on the creature fighting)
  {
    id: 'attaque-plus', name: L('Attaque +', 'X Attack'), price: 500, kind: 'battle', amount: 0, boost: 'atk',
    desc: L('Augmente l’Attaque de la Bestiole au combat. Ne dure que jusqu’à ce qu’elle revienne.', 'Raises the Attack of the Critter in battle. It wears off once it is withdrawn.'),
  },
  {
    id: 'defense-plus', name: L('Défense +', 'X Defend'), price: 550, kind: 'battle', amount: 0, boost: 'def',
    desc: L('Augmente la Défense de la Bestiole au combat.', 'Raises the Defense of the Critter in battle.'),
  },
  {
    id: 'vitesse-plus', name: L('Vitesse +', 'X Speed'), price: 350, kind: 'battle', amount: 0, boost: 'spe',
    desc: L('Augmente la Vitesse de la Bestiole au combat.', 'Raises the Speed of the Critter in battle.'),
  },
  {
    id: 'special-plus', name: L('Spécial +', 'X Special'), price: 350, kind: 'battle', amount: 0, boost: 'spa',
    desc: L('Augmente l’Attaque Spéciale de la Bestiole au combat.', 'Raises the Sp. Atk of the Critter in battle.'),
  },
  {
    id: 'precision-plus', name: L('Précision +', 'X Accuracy'), price: 950, kind: 'battle', amount: 0, boost: 'acc',
    desc: L('Augmente la Précision de la Bestiole au combat.', 'Raises the accuracy of the Critter in battle.'),
  },
  {
    id: 'muscle-plus', name: L('Muscle +', 'Dire Hit'), price: 650, kind: 'battle', amount: 0, boost: 'crit',
    desc: L('La Bestiole au combat porte plus souvent des coups critiques.', 'The Critter in battle lands critical hits more often.'),
  },
  {
    id: 'defense-spec', name: L('Défense Spéc.', 'Guard Spec.'), price: 700, kind: 'battle', amount: 0, boost: 'mist',
    desc: L('Pendant 5 tours, l’ennemi ne peut pas faire baisser les stats de ton équipe.', 'For 5 turns, the foe can’t lower your team’s stats.'),
  },
  // ---------------------------------------------------------------- berries (a Bestiole can hold one)
  {
    id: 'baie-bleue', name: L('Baie Bleue', 'Blue Berry'), price: 0, kind: 'berry', amount: 10,
    desc: L('Tenue, elle rend 10 PV quand les PV tombent à la moitié. Se mange aussi depuis le sac.', 'When held, restores 10 HP once HP drops to half. Can also be eaten from the bag.'),
  },
  {
    id: 'baie-doree', name: L('Baie Dorée', 'Golden Berry'), price: 0, kind: 'berry', amount: 30,
    desc: L('Tenue, elle rend 30 PV quand les PV tombent à la moitié. Se mange aussi depuis le sac.', 'When held, restores 30 HP once HP drops to half. Can also be eaten from the bag.'),
  },
  {
    id: 'baie-cerise', name: L('Baie Cerise', 'Cherry Berry'), price: 0, kind: 'berry', amount: 0, cures: ['paralyze'],
    desc: L('Tenue, elle guérit la paralysie.', 'When held, it cures paralysis.'),
  },
  {
    id: 'baie-reveil', name: L('Baie Réveil', 'Wake Berry'), price: 0, kind: 'berry', amount: 0, cures: ['sleep'],
    desc: L('Tenue, elle réveille la Bestiole qui s’endort.', 'When held, it wakes up its holder.'),
  },
  {
    id: 'baie-peche', name: L('Baie Pêche', 'Peach Berry'), price: 0, kind: 'berry', amount: 0, cures: ['poison'],
    desc: L('Tenue, elle guérit le poison.', 'When held, it cures poison.'),
  },
  {
    id: 'baie-givree', name: L('Baie Givrée', 'Frost Berry'), price: 0, kind: 'berry', amount: 0, cures: ['burn'],
    desc: L('Tenue, elle soigne les brûlures.', 'When held, it heals a burn.'),
  },
  {
    id: 'baie-menthe', name: L('Baie Menthe', 'Mint Berry'), price: 0, kind: 'berry', amount: 0, cures: ['confusion'],
    desc: L('Tenue, elle chasse la confusion en combat.', 'When held, it snaps its holder out of confusion.'),
  },
  {
    id: 'baie-prisme', name: L('Baie Prisme', 'Prism Berry'), price: 0, kind: 'berry', amount: 0,
    cures: ['sleep', 'paralyze', 'poison', 'burn', 'confusion'],
    desc: L('Tenue, elle guérit n’importe quel problème de statut, et la confusion.', 'When held, it cures any status problem, and confusion.'),
  },
  // ---------------------------------------------------------------- held items
  {
    id: 'gouter', name: L('Goûter', 'Snack'), price: 0, kind: 'hold', amount: 0, hold: 'leftovers',
    desc: L('À faire tenir. La Bestiole en grignote un peu à chaque tour de combat et récupère des PV.', 'An item to hold. Its holder nibbles a bit every turn of battle and regains HP.'),
  },
  {
    id: 'papier-calque', name: L('Papier Calque', 'Tracing Paper'), price: 0, kind: 'hold', amount: 0, hold: 'expShare',
    desc: L('À faire tenir. La Bestiole décalque tout ce que voit l’équipe : elle reçoit la moitié de l’expérience, même sans combattre.', 'An item to hold. Its holder traces everything the team sees: it gets half the experience, even without fighting.'),
  },
  ...TM_MOVES.map(capsule),
  {
    id: 'ticket-or', name: L('Ticket d’or', 'Golden Ticket'), price: 0, kind: 'key', amount: 0,
    desc: L('Un ticket brillant tombé de la poche du monsieur de la tombola, à Port-Aquarelle.', 'A shiny ticket dropped by the fair man of Port Aquarelle.'),
  },
  ...Array.from({ length: 12 }, (_, i): ItemDef => ({
    id: `page-${i + 1}`, name: L(`Page déchirée n°${i + 1}`, `Torn page #${i + 1}`), price: 0, kind: 'key', amount: 0,
    desc: L('Une page arrachée d’un cahier de dessin. Choisis LIRE pour la regarder.', 'A page torn from a sketchbook. Choose READ to look at it.'),
  })),
];

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

/** Things a Bestiole can hold (anything but key items and capsules). */
export const canHold = (def: ItemDef) => def.kind !== 'key' && def.kind !== 'tm';

export function item(id: string): ItemDef {
  const i = ITEM_BY_ID[id];
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
}

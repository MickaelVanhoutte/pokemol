import { L } from '../i18n';
import { move } from './moves';
import type { ItemDef } from './schema';

/** Stencils, in order (pochoir-01…): the first eight are the Atelier Masters' rewards. */
export const STENCIL_MOVES = [
  'rayon-d-ailes', 'coup-de-boule', 'pluie-d-aquarelle', 'eclair-fluo', 'queue-ardente', 'eclat-de-lune',
  'rafale-de-graines', 'ombre-farceuse', 'reve-eveille', 'poing-crayon', 'tache-d-encre', 'gros-baillement',
];
export const stencilId = (n: number) => `pochoir-${String(n).padStart(2, '0')}`;

/** A stencil teaches its move to any compatible Bestiole, as often as you like (it never wears out). */
function stencil(moveId: string, i: number): ItemDef {
  const mv = move(moveId);
  const n = String(i + 1).padStart(2, '0');
  return {
    id: stencilId(i + 1), name: L(`Pochoir ${n} ${mv.name.fr}`, `Stencil ${n} ${mv.name.en}`), price: 0, kind: 'stencil', amount: 0, move: moveId,
    desc: L(`${mv.desc.fr} Un pochoir ne s’use jamais.`, `${mv.desc.en} A stencil never wears out.`),
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
    id: 'sirop-attaque', name: L('Sirop d’Attaque', 'Attack Syrup'), price: 500, kind: 'battle', amount: 0, boost: 'atk',
    desc: L('Une gorgée qui augmente l’Attaque de la Bestiole au combat, jusqu’à ce qu’elle revienne.', 'A sip that raises the Attack of the Critter in battle, until it is withdrawn.'),
  },
  {
    id: 'sirop-defense', name: L('Sirop de Défense', 'Defense Syrup'), price: 550, kind: 'battle', amount: 0, boost: 'def',
    desc: L('Une gorgée qui augmente la Défense de la Bestiole au combat.', 'A sip that raises the Defense of the Critter in battle.'),
  },
  {
    id: 'sirop-vitesse', name: L('Sirop de Vitesse', 'Speed Syrup'), price: 350, kind: 'battle', amount: 0, boost: 'spe',
    desc: L('Une gorgée qui augmente la Vitesse de la Bestiole au combat.', 'A sip that raises the Speed of the Critter in battle.'),
  },
  {
    id: 'sirop-special', name: L('Sirop Spécial', 'Special Syrup'), price: 350, kind: 'battle', amount: 0, boost: 'spa',
    desc: L('Une gorgée qui augmente l’Attaque Spéciale de la Bestiole au combat.', 'A sip that raises the Sp. Atk of the Critter in battle.'),
  },
  {
    id: 'sirop-precision', name: L('Sirop de Précision', 'Accuracy Syrup'), price: 950, kind: 'battle', amount: 0, boost: 'acc',
    desc: L('Une gorgée qui augmente la Précision de la Bestiole au combat.', 'A sip that raises the accuracy of the Critter in battle.'),
  },
  {
    id: 'taille-crayon', name: L('Taille-crayon', 'Pencil Sharpener'), price: 650, kind: 'battle', amount: 0, boost: 'crit',
    desc: L('Une mine bien taillée : la Bestiole au combat porte plus souvent des coups critiques.', 'A sharp tip: the Critter in battle lands critical hits more often.'),
  },
  {
    id: 'vernis', name: L('Vernis Protecteur', 'Protective Varnish'), price: 700, kind: 'battle', amount: 0, boost: 'guard',
    desc: L('Un coup de vernis : pendant 5 tours, l’ennemi ne peut pas faire baisser les stats de ton équipe.', 'A coat of varnish: for 5 turns, the foe can’t lower your team’s stats.'),
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
    id: 'gouter', name: L('Goûter', 'Snack'), price: 0, kind: 'hold', amount: 0, hold: 'regen',
    desc: L('À faire tenir. La Bestiole en grignote un peu à chaque tour de combat et récupère des PV.', 'An item to hold. Its holder nibbles a bit every turn of battle and regains HP.'),
  },
  {
    id: 'papier-calque', name: L('Papier Calque', 'Tracing Paper'), price: 0, kind: 'hold', amount: 0, hold: 'shareXp',
    desc: L('À faire tenir. La Bestiole décalque tout ce que voit l’équipe : elle reçoit la moitié de l’expérience, même sans combattre.', 'An item to hold. Its holder traces everything the team sees: it gets half the experience, even without fighting.'),
  },
  ...STENCIL_MOVES.map(stencil),
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

/** Things a Bestiole can hold (anything but key items and stencils). */
export const canHold = (def: ItemDef) => def.kind !== 'key' && def.kind !== 'stencil';

export function item(id: string): ItemDef {
  const i = ITEM_BY_ID[id];
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
}

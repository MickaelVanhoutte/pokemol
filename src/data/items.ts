import { L } from '../i18n';
import type { ItemDef } from './schema';

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

/** Things a Bestiole can hold (anything but key items). */
export const canHold = (def: ItemDef) => def.kind !== 'key';

export function item(id: string): ItemDef {
  const i = ITEM_BY_ID[id];
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
}

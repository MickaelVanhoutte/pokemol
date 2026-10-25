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

export function item(id: string): ItemDef {
  const i = ITEM_BY_ID[id];
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
}

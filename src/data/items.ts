import { L } from '../i18n';
import type { ItemDef } from './schema';

export const ITEMS: ItemDef[] = [
  {
    id: 'crayon-ball', name: L('Crayon-ball', 'Pencil Ball'), icon: '✏️', price: 200, kind: 'ball', amount: 10,
    desc: L('Une balle en crayon pour attraper les Bestioles sauvages.', 'A pencil ball to catch wild Critters.'),
  },
  {
    id: 'super-crayon-ball', name: L('Super Crayon-ball', 'Great Pencil Ball'), icon: '🖍️', price: 600, kind: 'ball', amount: 15,
    desc: L('Une balle plus efficace que la Crayon-ball.', 'A ball that works better than a Pencil Ball.'),
  },
  {
    id: 'potion', name: L('Potion', 'Potion'), icon: '🧪', price: 300, kind: 'heal', amount: 20,
    desc: L('Rend 20 PV à une Bestiole.', 'Restores 20 HP to a Critter.'),
  },
  {
    id: 'super-potion', name: L('Super Potion', 'Super Potion'), icon: '💖', price: 700, kind: 'heal', amount: 60,
    desc: L('Rend 60 PV à une Bestiole.', 'Restores 60 HP to a Critter.'),
  },
  {
    id: 'gomme', name: L('Gomme magique', 'Magic Eraser'), icon: '🧼', price: 250, kind: 'status', amount: 0,
    desc: L('Efface tous les problèmes de statut d’une Bestiole.', 'Erases every status problem of a Critter.'),
  },
  {
    id: 'rappel', name: L('Rappel', 'Revive'), icon: '🌟', price: 1500, kind: 'revive', amount: 50,
    desc: L('Réveille une Bestiole K.O. avec la moitié de ses PV.', 'Revives a fainted Critter with half its HP.'),
  },
];

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export function item(id: string): ItemDef {
  const i = ITEM_BY_ID[id];
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
}

import { ITEMS } from '../../data/items';
import { backToWorld } from '../../overworld/controller';
import { addItem, save, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { ShopView } from '../views/ShopView';

/** What every shop sells, and how many badges each item needs. */
const STOCK: Record<string, number> = {
  'crayon-ball': 0, potion: 0, retouche: 0,
  'super-crayon-ball': 1, 'super-potion': 1, rappel: 1,
  'sirop-attaque': 2, 'sirop-defense': 2, 'sirop-vitesse': 2, 'sirop-special': 2, 'sirop-precision': 2,
  'taille-crayon': 3, 'vernis': 3,
};

export function ShopScreen() {
  const d = save.value!;
  const stock = ITEMS.filter((it) => it.id in STOCK && d.badges.length >= STOCK[it.id]);
  return (
    <ShopView
      money={d.money}
      stock={stock}
      bag={d.bag}
      onBuy={(id, n) => {
        const it = stock.find((s) => s.id === id)!;
        if (save.value!.money < it.price * n) return;
        update((x) => {
          x.money -= it.price * n;
          addItem(x, id, n);
        });
        sfx.coin();
      }}
      onClose={backToWorld}
    />
  );
}

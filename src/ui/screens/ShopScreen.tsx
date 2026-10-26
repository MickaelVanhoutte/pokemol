import { L, tr } from '../../i18n';
import { ITEMS } from '../../data/items';
import { TOWER_STOCK } from '../../data/postgame';
import { backToWorld } from '../../overworld/controller';
import { addItem, save, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { ShopView } from '../views/ShopView';

/** What every shop sells, and how many badges each item needs. */
const STOCK: Record<string, number> = {
  'crayon-ball': 0, potion: 0, retouche: 0, spray: 0,
  'fil-ariane': 1, 'super-spray': 2,
  'super-crayon-ball': 1, 'super-potion': 1, rappel: 1,
  'sirop-attaque': 2, 'sirop-defense': 2, 'sirop-vitesse': 2, 'sirop-special': 2, 'sirop-precision': 2,
  'taille-crayon': 3, 'vernis': 3,
  'plume-vive': 4, 'loupe': 4, 'couronne-carton': 4, 'clochette': 4,
  'ruban-tenace': 5, 'casque-pointes': 5,
  'bandeau-tetu': 6, 'lunettes-tetues': 6, 'echarpe-tetue': 6, 'bille-ardente': 6, 'tablier-peintre': 6,
};

export function ShopScreen({ tower }: { tower?: boolean }) {
  const d = save.value!;
  if (tower) return <TowerShop />;
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

/** The Tour des Défis exchange: items for points (stencils only while you don't have them). */
function TowerShop() {
  const d = save.value!;
  const points = d.tower?.points ?? 0;
  const stock = ITEMS.filter((it) => it.id in TOWER_STOCK || (it.kind === 'stencil' && !d.bag[it.id]));
  const priceOf = (id: string) => TOWER_STOCK[id] ?? 32;
  return (
    <ShopView
      title={tr(L('Échange', 'Exchange'))}
      money={points}
      stock={stock}
      bag={d.bag}
      priceOf={(it) => priceOf(it.id)}
      fmt={(n) => `${n} pts`}
      poor={tr(L('Tu n’as pas assez de points.', 'You don’t have enough points.'))}
      onBuy={(id, n) => {
        const cost = priceOf(id) * n;
        if ((save.value!.tower?.points ?? 0) < cost) return;
        update((x) => {
          x.tower!.points -= cost;
          addItem(x, id, n);
        });
        sfx.coin();
      }}
      onClose={backToWorld}
    />
  );
}

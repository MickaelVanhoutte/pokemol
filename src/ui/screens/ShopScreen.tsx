import { ITEMS } from '../../data/items';
import { backToWorld } from '../../overworld/controller';
import { addItem, save, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { ShopView } from '../views/ShopView';

const AFTER_BADGE = ['super-crayon-ball', 'super-potion', 'rappel'];

export function ShopScreen() {
  const d = save.value!;
  const stock = ITEMS.filter((it) => it.kind !== 'key' && (!AFTER_BADGE.includes(it.id) || d.badges.length > 0));
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

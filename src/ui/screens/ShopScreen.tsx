import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { ITEMS } from '../../data/items';
import { backToWorld } from '../../overworld/controller';
import { addItem, save, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import '../screens.css';

const AFTER_BADGE = ['super-crayon-ball', 'super-potion', 'rappel'];

export function ShopScreen() {
  const d = save.value!;
  const [qty, setQty] = useState<Record<string, number>>({});
  const stock = ITEMS.filter((it) => !AFTER_BADGE.includes(it.id) || d.badges.length > 0);
  const buy = (id: string, price: number) => {
    const n = qty[id] ?? 1;
    if (save.value!.money < price * n) return;
    update((x) => {
      x.money -= price * n;
      addItem(x, id, n);
    });
    sfx.coin();
  };
  return (
    <div class="screen mscreen">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={backToWorld}>← {tr(L('Sortir', 'Leave'))}</button>
        <h1>{tr(L('Boutique', 'Shop'))}</h1>
        <span class="money">{d.money} ₽</span>
      </div>
      <div class="mscreen__list">
        {stock.map((it) => {
          const n = qty[it.id] ?? 1;
          return (
            <div class="mrow">
              <span class="mrow__icon">{it.icon}</span>
              <span class="mrow__main">
                <b>{tr(it.name)} <small>{tr(L('(tu en as {n})', '(you have {n})'), { n: d.bag[it.id] ?? 0 })}</small></b>
                <small>{tr(it.desc)}</small>
              </span>
              <span class="mrow__side">
                <span class="pixel">{it.price * n} ₽</span>
                <span style={{ display: 'flex', gap: '4px' }}>
                  <button class="btn btn--small" onClick={() => setQty((q) => ({ ...q, [it.id]: Math.max(1, n - 1) }))}>−</button>
                  <span class="pixel" style={{ minWidth: '1.6em', textAlign: 'center', alignSelf: 'center' }}>{n}</span>
                  <button class="btn btn--small" onClick={() => setQty((q) => ({ ...q, [it.id]: Math.min(99, n + 1) }))}>+</button>
                </span>
                <button class="btn btn--small btn--primary" disabled={d.money < it.price * n} onClick={() => buy(it.id, it.price)}>{tr(L('Acheter', 'Buy'))}</button>
              </span>
            </div>
          );
        })}
      </div>
      {d.badges.length === 0 && <p class="mscreen__note">{tr(L('D’autres articles arrivent quand tu auras un badge !', 'More items arrive once you have a badge!'))}</p>}
    </div>
  );
}

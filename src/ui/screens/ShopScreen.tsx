import { L, tr, type LText } from '../../i18n';
import { support } from '../../data/supportCards';
import { backToWorld } from '../../overworld/controller';
import { addSupply, save, update } from '../../state/game';
import { SupportCard } from '../Card';
import './shop.css';

const BASIC = ['potion', 'pile', 'echange', 'gomme', 'crayon', 'taille-crayon', 'bouclier', 'retour', 'colle', 'gribouillage', 'coup-de-vent', 'piece', 'professeur', 'maman'];
const AFTER_BADGE = ['potion+', 'pile+', 'double-pile', 'super-potion', 'rappel', 'bouclier+'];

interface Item {
  key: string;
  label: LText;
  price: number;
  buy: () => void;
}

export function ShopScreen() {
  const d = save.value!;
  const cards = [...BASIC, ...(d.badges.includes('grotte') ? AFTER_BADGE : [])];
  const items: Item[] = [
    { key: 'blank1', label: L('Carte vierge ×1', 'Blank Card ×1'), price: 60, buy: () => update((x) => (x.items.blank += 1)) },
    { key: 'blank5', label: L('Cartes vierges ×5', 'Blank Cards ×5'), price: 270, buy: () => update((x) => (x.items.blank += 5)) },
  ];
  const pay = (price: number, fn: () => void) => {
    if (save.value!.coins < price) return;
    update((x) => (x.coins -= price));
    fn();
  };
  return (
    <div class="screen shop">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={backToWorld}>← {tr(L('Sortir', 'Leave'))}</button>
        <h1>{tr(L('Boutique', 'Shop'))}</h1>
        <span class="shop__money pixel">🪙 {d.coins}</span>
      </div>
      <h2 class="pixel">{tr(L('Objets', 'Items'))}</h2>
      <div class="shop__items">
        {items.map((it) => (
          <div class="shop__item">
            <span class="shop__icon">🃏</span>
            <b>{tr(it.label)}</b>
            <small>{tr(L('Tu en as {n}', 'You have {n}'), { n: d.items.blank })}</small>
            <button class="btn btn--small btn--primary" disabled={d.coins < it.price} onClick={() => pay(it.price, it.buy)}>🪙 {it.price}</button>
          </div>
        ))}
      </div>
      <h2 class="pixel">{tr(L('Cartes Fourniture', 'Supply cards'))}</h2>
      <div class="shop__cards">
        {cards.map((id) => {
          const def = support(id);
          return (
            <div class="shop__card">
              <SupportCard def={def} width={150} />
              <small>{tr(L('Possédées : {n}', 'Owned: {n}'), { n: d.supplies[id] ?? 0 })}</small>
              <button class="btn btn--small btn--primary" disabled={d.coins < def.price} onClick={() => pay(def.price, () => update((x) => addSupply(x, id)))}>
                🪙 {def.price}
              </button>
            </div>
          );
        })}
      </div>
      <p class="shop__hint">{tr(L('Astuce : ajoute tes nouvelles cartes à ton deck depuis le PC ou le menu.', 'Tip: add new cards to your deck from the PC or the menu.'))}</p>
    </div>
  );
}

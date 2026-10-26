import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import type { ItemDef } from '../../data/schema';
import { Frame, MenuList, PixelIcon, QtyPicker, Window, YesNo } from '../paper';
import './views.css';

/** FRLG shop: money box, item list with prices, quantity, confirmation. */
export function ShopView({ money, stock, bag, onBuy, onClose, title, priceOf = (it) => it.price, fmt = (n) => `${n} ₽`, poor }: {
  money: number; stock: ItemDef[]; bag: Record<string, number>; onBuy: (id: string, n: number) => void; onClose: () => void;
  /** Tour des Défis: points instead of money. */
  title?: string; priceOf?: (it: ItemDef) => number; fmt?: (n: number) => string; poor?: string;
}) {
  const [cursor, setCursor] = useState(0);
  const [picked, setPicked] = useState<ItemDef | null>(null);
  const [qty, setQty] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const [say, setSay] = useState('');
  const focused = picked ?? stock[cursor];
  // stencils never wear out: one is enough
  const maxQty = picked ? (picked.kind === 'stencil' ? 1 : Math.max(1, Math.min(99, Math.floor(money / priceOf(picked))))) : 1;

  const choose = (it: ItemDef) => {
    if (money < priceOf(it)) return setSay(poor ?? tr(L('Tu n’as pas assez d’argent.', 'You don’t have enough money.')));
    setSay('');
    setQty(1);
    setPicked(it);
  };

  return (
    <Frame
      title={title ?? tr(L('Boutique', 'Shop'))}
      onBack={picked ? () => setPicked(null) : onClose}
      backLabel={picked ? undefined : tr(L('Sortir', 'Leave'))}
      right={<Window class="money-win">{fmt(money)}</Window>}
    >
      <Window class="shop__list">
        <MenuList
          active={!picked}
          onCursor={setCursor}
          onCancel={onClose}
          tapFocus
          items={stock.map((it) => ({ label: tr(it.name), icon: it.id, side: fmt(priceOf(it)), onSelect: () => choose(it) }))}
        />
      </Window>
      <Window seyes class="bag__desc">
        {focused && <PixelIcon id={focused.id} size={36} />}
        <p>{say || (focused ? `${tr(focused.desc)} ${tr(L('(Tu en as {n}.)', '(You have {n}.)'), { n: bag[focused.id] ?? 0 })}` : '')}</p>
      </Window>
      {picked && (
        <div class="view-modal">
          {!confirm ? (
            <>
              <Window seyes class="view-modal__text">{tr(L('{i} ? Combien en veux-tu ?', '{i}? How many would you like?'), { i: tr(picked.name) })}</Window>
              <Window class="shop__qty">
                <QtyPicker value={qty} max={maxQty} onChange={setQty} />
                <span class="shop__total">{fmt(priceOf(picked) * qty)}</span>
                <button class="pbtn pbtn--accent" onClick={() => setConfirm(true)}>OK</button>
                <button class="pbtn" onClick={() => setPicked(null)}>✕</button>
              </Window>
            </>
          ) : (
            <>
              <Window seyes class="view-modal__text">
                {tr(L('{i} ×{n}, ça fera {p}. D’accord ?', '{i} ×{n}, that’ll be {p}. OK?'), { i: tr(picked.name), n: qty, p: fmt(priceOf(picked) * qty) })}
              </Window>
              <YesNo onAnswer={(yes) => {
                if (yes) {
                  onBuy(picked.id, qty);
                  setSay(tr(L('Voilà ! Merci beaucoup !', 'Here you go! Thank you!')));
                }
                setConfirm(false);
                setPicked(null);
              }} />
            </>
          )}
        </div>
      )}
    </Frame>
  );
}

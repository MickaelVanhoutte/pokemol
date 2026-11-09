import { useEffect, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import type { ItemDef } from '../../data/schema';
import { ActionBar, Frame, MenuList, PixelIcon, QtyPicker, Window, YesNo } from '../paper';
import { navKey } from '../paper/nav';
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

  // the quantity box: ◀ ▶ (or ▲ ▼) count, A says OK, B cancels (before the Frame's own B, which would leave)
  useEffect(() => {
    if (!picked || confirm) return;
    const onKey = (e: KeyboardEvent) => {
      const k = navKey(e);
      if (!k) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat && (k === 'a' || k === 'b')) return;
      if (k === 'a') setConfirm(true);
      else if (k === 'b') setPicked(null);
      else setQty((n) => Math.max(1, Math.min(maxQty, n + (k === 'right' || k === 'up' ? 1 : -1))));
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [picked, confirm, maxQty]);

  return (
    <Frame
      title={title ?? tr(L('Boutique', 'Shop'))}
      onBack={picked ? () => setPicked(null) : onClose}
      right={<Window class="money-win">{fmt(money)}</Window>}
    >
      <Window class="shop__list">
        <MenuList
          active={!picked}
          // « Voilà ! » or « pas assez d’argent » is about one item: another one shows its description again
          onCursor={(i) => { setCursor(i); setSay(''); }}
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
                <div class="shop__count">
                  <QtyPicker value={qty} max={maxQty} onChange={setQty} />
                  <span class="shop__total">{fmt(priceOf(picked) * qty)}</span>
                </div>
                <ActionBar
                  onBack={() => setPicked(null)}
                  backLabel={tr(L('Annuler', 'Cancel'))}
                  action={<button class="pbtn pbtn--accent" onClick={() => setConfirm(true)}>OK ▶</button>}
                />
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

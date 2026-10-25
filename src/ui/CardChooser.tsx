import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../i18n';
import { creature } from '../data/creatures';
import { support } from '../data/supportCards';
import { Card, SupportCard } from './Card';
import './chooser.css';

export interface ChooserItem {
  kind: 'creature' | 'support';
  id: string;
  level?: number;
}

interface Props {
  items: ChooserItem[];
  title?: string;
  /** 'pick' shows a Choose button on the big card, 'show' only OK. */
  mode: 'pick' | 'show';
  /** Label of the choose button, given the card name. */
  chooseLabel?: (name: string) => string;
  onChoose: (index: number) => void;
  /** Rendered in place (e.g. inside a panel) instead of as a full-screen overlay. */
  inline?: boolean;
  /** Extra classes per item (e.g. sold / picked). */
  itemClass?: (index: number) => string;
}

const nameOf = (it: ChooserItem) => tr(it.kind === 'creature' ? creature(it.id).name : support(it.id).name);

function BigCard({ it, width }: { it: ChooserItem; width: number }) {
  return it.kind === 'creature'
    ? <Card def={creature(it.id)} width={width} level={it.level} />
    : <SupportCard def={support(it.id)} width={width} />;
}

/** Cards too small to read on a phone: tap one to see it full screen, browse with ‹ ›, then choose or go back. */
export function CardChooser({ items, title, mode, chooseLabel, onChoose, inline, itemClass }: Props) {
  const n = items.length;
  const [focus, setFocus] = useState<number | null>(!inline && n === 1 ? 0 : null);
  const [, setTick] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setTick((x) => x + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (focus === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setFocus((f) => (f === null ? f : (f + n - 1) % n));
      if (e.key === 'ArrowRight') setFocus((f) => (f === null ? f : (f + 1) % n));
      if (e.key === 'Escape' && n > 1) setFocus(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, n]);

  const vw = window.innerWidth, vh = window.innerHeight;
  const bigW = Math.floor(Math.min(420, vw * 0.9, (vh - 150) * 0.7));
  const perRow = Math.min(n, vw < 520 ? 3 : 4);
  const smallW = Math.floor(Math.min(220, (Math.min(vw, 900) - 32 - (perRow - 1) * 10) / perRow, inline ? 150 : 999));

  const grid = (
    <div class={`chooser__grid ${inline ? 'is-inline' : ''}`}>
      {title && <h2 class="pixel chooser__title">{title}</h2>}
      <p class="chooser__hint">{tr(L('Touche une carte pour la voir en grand', 'Tap a card to see it up close'))}</p>
      <div class="chooser__row">
        {items.map((it, i) => (
          <div class={`chooser__cell ${itemClass?.(i) ?? ''}`}>
            {it.kind === 'creature'
              ? <Card def={creature(it.id)} width={smallW} level={it.level} onClick={() => setFocus(i)} />
              : <SupportCard def={support(it.id)} width={smallW} onClick={() => setFocus(i)} />}
          </div>
        ))}
      </div>
    </div>
  );

  const big = focus !== null && items[focus] && (
    <div
      class="overlay chooser__focus"
      onPointerDown={(e) => (touchX.current = e.clientX)}
      onPointerUp={(e) => {
        const dx = touchX.current === null ? 0 : e.clientX - touchX.current;
        touchX.current = null;
        if (n > 1 && Math.abs(dx) > 50) setFocus((focus + (dx < 0 ? 1 : n - 1)) % n);
      }}
    >
      {title && !inline && <h2 class="pixel chooser__title">{title}</h2>}
      <div class="chooser__stage">
        {n > 1 && <button class="chooser__arrow" aria-label="‹" onClick={() => setFocus((focus + n - 1) % n)}>‹</button>}
        <div class="chooser__big" key={focus}><BigCard it={items[focus]} width={bigW} /></div>
        {n > 1 && <button class="chooser__arrow" aria-label="›" onClick={() => setFocus((focus + 1) % n)}>›</button>}
      </div>
      {n > 1 && <div class="chooser__dots">{items.map((_, i) => <i class={i === focus ? 'is-on' : ''} onClick={() => setFocus(i)} />)}</div>}
      <div class="chooser__btns">
        {(n > 1 || inline) && (
          <button class="btn" onClick={() => setFocus(null)}>← {tr(L('Retour', 'Back'))}</button>
        )}
        {mode === 'pick' ? (
          <button class="btn btn--primary" onClick={() => { const i = focus; setFocus(null); onChoose(i); }}>
            {chooseLabel ? chooseLabel(nameOf(items[focus])) : tr(L('Choisir {name}', 'Choose {name}'), { name: nameOf(items[focus]) })}
          </button>
        ) : (
          !inline && n === 1 && <button class="btn btn--primary" onClick={() => onChoose(0)}>OK</button>
        )}
      </div>
    </div>
  );

  if (inline) return <>{grid}{big}</>;
  return (
    <div class="overlay chooser">
      {focus === null ? grid : null}
      {big}
      {focus === null && mode === 'show' && <button class="btn btn--primary" onClick={() => onChoose(0)}>OK</button>}
    </div>
  );
}

import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { move } from '../../data/moves';
import { STATUSES, TYPES } from '../../data/types';
import type { TypeId } from '../../data/schema';
import type { Mon } from '../../engine/pk/creature';
import { textPace } from '../../state/prefs';
import { sfx } from '../../audio/sfx';
import { iconUrl } from '../icons';
import { useMenuNav } from './nav';
import { paginate } from './paginate';
import './paper.css';

export function Window({ children, class: cls = '', seyes, onClick }: { children: ComponentChildren; class?: string; seyes?: boolean; onClick?: () => void }) {
  return <div class={`window ${seyes ? 'seyes' : ''} ${cls}`} onClick={onClick}>{children}</div>;
}

export function PixelIcon({ id, size = 24 }: { id: string; size?: number }) {
  return <img class="picon" src={iconUrl(id)} width={size} height={size} alt="" />;
}

export function HpBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / max) * 100);
  return (
    <span class={`hpbar hpbar--${pct > 50 ? 'ok' : pct > 20 ? 'mid' : 'low'}`}>
      <span style={{ width: `${pct}%` }} />
    </span>
  );
}

export function XpBar({ pct }: { pct: number }) {
  return <span class="xpbar"><span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></span>;
}

export function StatusTag({ s }: { s: NonNullable<Mon['status']> }) {
  return <i class="status-tag" style={{ background: STATUSES[s].color }}>{tr(STATUSES[s].tag)}</i>;
}

export function TypeBadge({ type }: { type: TypeId }) {
  return <span class="type-badge" style={{ background: TYPES[type].color }}>{tr(TYPES[type].name)}</span>;
}

export const lv = (l: number) => tr(L('N.{l}', 'Lv{l}'), { l });

export interface MenuItem {
  label: ComponentChildren;
  icon?: string;
  side?: ComponentChildren;
  disabled?: boolean;
  /** Text shown in a description box while the entry has the cursor. */
  desc?: string;
  onSelect: () => void;
}

/** Vertical GBA menu with the pencil cursor. Keyboard: ↑↓ A B; touch: tap an entry. */
export function MenuList({ items, onCancel, active = true, class: cls = '', onCursor }: {
  items: MenuItem[]; onCancel?: () => void; active?: boolean; class?: string; onCursor?: (i: number) => void;
}) {
  const pick = (i: number) => {
    if (items[i]?.disabled) return;
    sfx.blip();
    items[i].onSelect();
  };
  const [cur, setCur] = useMenuNav(items.length, { onSelect: pick, onCancel, active });
  useEffect(() => onCursor?.(cur), [cur]);
  return (
    <div class={`mlist ${cls}`} role="menu">
      {items.map((it, i) => (
        <button
          class={`mlist__item ${i === cur ? 'is-on' : ''}`}
          role="menuitem"
          disabled={it.disabled}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setCur(i)}
          onClick={() => { setCur(i); pick(i); }}
        >
          {it.icon && <img class="picon" src={iconUrl(it.icon)} alt="" />}
          <span>{it.label}</span>
          {it.side && <small>{it.side}</small>}
        </button>
      ))}
    </div>
  );
}

export function YesNo({ onAnswer, active = true }: { onAnswer: (yes: boolean) => void; active?: boolean }) {
  return (
    <Window class="yesno">
      <MenuList
        active={active}
        onCancel={() => onAnswer(false)}
        items={[
          { label: tr(L('OUI', 'YES')), onSelect: () => onAnswer(true) },
          { label: tr(L('NON', 'NO')), onSelect: () => onAnswer(false) },
        ]}
      />
    </Window>
  );
}

/**
 * Typewriter text on notebook paper, in a box of fixed height. Text longer than the box is
 * split into pages: tap / A finishes the line, then shows the next page, then calls `onAdvance`.
 * Without `onAdvance` (battle messages), pages turn by themselves after `autoPage` ms.
 */
export function TextBox({ text, speaker, onAdvance, onDone, arrow = true, keys = false, class: cls = '', instant, autoPage }: {
  text: string; speaker?: string; onAdvance?: () => void; onDone?: () => void; arrow?: boolean; keys?: boolean; class?: string; instant?: boolean; autoPage?: number;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);
  const [pages, setPages] = useState<string[]>([text]);
  const [page, setPage] = useState(0);
  // split into pages that fit the box (again whenever its size changes)
  useLayoutEffect(() => {
    const el = textRef.current, m = measureRef.current;
    if (!el || !m) return;
    const compute = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
      const maxH = Math.max(lh, Math.floor((el.clientHeight + 1) / lh) * lh) + 1;
      m.style.width = `${el.clientWidth}px`;
      const out = paginate(text, (candidate) => {
        m.textContent = candidate;
        return m.scrollHeight <= maxH;
      });
      setPages((prev) => (prev.length === out.length && prev.every((x, i) => x === out[i]) ? prev : out));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);
  useEffect(() => setPage(0), [text]);

  const current = pages[Math.min(page, pages.length - 1)] ?? '';
  const [shown, setShown] = useState(instant ? current.length : 0);
  useEffect(() => {
    if (instant) return setShown(current.length);
    setShown(0);
    const { chars, ms } = textPace();
    let n = 0;
    const id = setInterval(() => {
      n += chars;
      setShown(n);
      if (n >= current.length) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [current, instant]);
  const last = page >= pages.length - 1;
  const pageDone = shown >= current.length;
  const done = last && pageDone;
  useEffect(() => {
    if (done) onDone?.();
  }, [done, text]);
  // battle messages turn their pages by themselves
  useEffect(() => {
    if (!autoPage || onAdvance || !pageDone || last) return;
    const id = setTimeout(() => setPage((p) => p + 1), autoPage);
    return () => clearTimeout(id);
  }, [autoPage, pageDone, last, page]);
  const tap = () => {
    if (!pageDone) return setShown(current.length);
    if (!last) {
      sfx.blip();
      return setPage((p) => p + 1);
    }
    if (onAdvance) {
      sfx.blip();
      onAdvance();
    }
  };
  useEffect(() => {
    if (!keys) return;
    const onKey = (e: KeyboardEvent) => {
      if (!['Enter', ' ', 'z', 'Z', 'x', 'X'].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) tap();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });
  return (
    <div class={`window seyes textbox ${cls}`} onClick={tap}>
      {speaker && <span class="textbox__speaker">{speaker}</span>}
      <p class="textbox__text" ref={textRef}>{current.slice(0, shown)}</p>
      <p class="textbox__text textbox__measure" ref={measureRef} aria-hidden="true" />
      {arrow && pageDone && (!last || onAdvance) && <span class="textbox__next blip">▼</span>}
    </div>
  );
}

/** Full-screen menu page on graph paper: title strip, body, optional footer. */
export function Frame({ title, onBack, backLabel, right, children, foot, class: cls = '' }: {
  title: ComponentChildren; onBack?: () => void; backLabel?: string; right?: ComponentChildren; children: ComponentChildren; foot?: ComponentChildren; class?: string;
}) {
  useEffect(() => {
    if (!onBack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X' || e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);
  return (
    <div class={`frame graph ${cls}`}>
      <div class="frame__top">
        <Window class="frame__title-win"><h1 class="frame__title">{title}</h1></Window>
        {right}
        {onBack && <button class="pbtn pbtn--b" onClick={onBack}>{backLabel ?? tr(L('Retour', 'Back'))}</button>}
      </div>
      <div class="frame__body">{children}</div>
      {foot && <div class="frame__foot">{foot}</div>}
    </div>
  );
}

export function MoveButton({ id, pp, disabled, onClick, class: cls = '' }: { id: string; pp?: number; disabled?: boolean; onClick: () => void; class?: string }) {
  const mv = move(id);
  return (
    <button class={`pk-move ${cls}`} style={{ '--type': TYPES[mv.type].color }} disabled={disabled} onClick={onClick}>
      <b>{tr(mv.name)}</b>
      <small><span class="pk-move__type">{tr(TYPES[mv.type].name)}</span>{pp !== undefined ? <span>PP {pp}/{mv.pp}</span> : null}</small>
    </button>
  );
}

export function QtyPicker({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div class="qty">
      <button class="pbtn" disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <span class="qty__n">×{String(value).padStart(2, '0')}</span>
      <button class="pbtn" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

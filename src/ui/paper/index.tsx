import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { move } from '../../data/moves';
import { STATUSES, TYPES } from '../../data/types';
import type { TypeId } from '../../data/schema';
import type { Mon } from '../../engine/pk/creature';
import { textPace } from '../../state/prefs';
import { sfx } from '../../audio/sfx';
import { iconUrl } from '../icons';
import { useMenuNav } from './nav';
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

/** Typewriter text on notebook paper. Tap / A finishes the line, then calls `onAdvance`. */
export function TextBox({ text, speaker, onAdvance, onDone, arrow = true, keys = false, class: cls = '', instant }: {
  text: string; speaker?: string; onAdvance?: () => void; onDone?: () => void; arrow?: boolean; keys?: boolean; class?: string; instant?: boolean;
}) {
  const [shown, setShown] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) return setShown(text.length);
    setShown(0);
    const { chars, ms } = textPace();
    let n = 0;
    const id = setInterval(() => {
      n += chars;
      setShown(n);
      if (n >= text.length) clearInterval(id);
    }, ms);
    return () => clearInterval(id);
  }, [text, instant]);
  const done = shown >= text.length;
  useEffect(() => {
    if (done) onDone?.();
  }, [done, text]);
  const tap = () => {
    if (!done) return setShown(text.length);
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
      <p class="textbox__text">{text.slice(0, shown)}</p>
      {arrow && done && onAdvance && <span class="textbox__next blip">▼</span>}
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

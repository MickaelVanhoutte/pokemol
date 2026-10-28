import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { move } from '../../data/moves';
import { typesOf } from '../../data/creatures';
import { STATUSES, TYPES } from '../../data/types';
import type { TypeId } from '../../data/schema';
import type { Mon } from '../../engine/pk/creature';
import { textPace } from '../../state/prefs';
import { sfx } from '../../audio/sfx';
import { iconUrl } from '../icons';
import { sketchIconUrl } from '../sketchIcons';
import { useMenuNav } from './nav';
import { paginate } from './paginate';
import './paper.css';

export function Window({ children, class: cls = '', seyes, onClick }: { children: ComponentChildren; class?: string; seyes?: boolean; onClick?: () => void }) {
  return <div class={`window ${seyes ? 'seyes' : ''} ${cls}`} onClick={onClick}>{children}</div>;
}

export function PixelIcon({ id, size = 24 }: { id: string; size?: number }) {
  return <img class="picon" src={iconUrl(id)} width={size} height={size} alt="" />;
}

/** HP bar; `numbers` writes "hp/max" inside it (battle boxes). */
export function HpBar({ hp, max, numbers }: { hp: number; max: number; numbers?: boolean }) {
  const pct = Math.max(0, (hp / max) * 100);
  return (
    <span class={`hpbar hpbar--${pct > 50 ? 'ok' : pct > 20 ? 'mid' : 'low'} ${numbers ? 'hpbar--num' : ''}`}>
      <span style={{ width: `${pct}%` }} />
      {numbers && <i class="hpbar__num">{hp}/{max}</i>}
    </span>
  );
}

const XP_FILL_MS = 700;

/**
 * Experience bar. Given the `level`, a level-up fills the bar to the end, empties it at once and
 * fills it again to the new amount, instead of sliding backwards.
 */
export function XpBar({ pct, level }: { pct: number; level?: number }) {
  const target = Math.max(0, Math.min(100, pct));
  const [bar, setBar] = useState({ pct: target, level, instant: true });
  useEffect(() => {
    if (level === undefined || bar.level === undefined || level <= bar.level) {
      setBar({ pct: target, level, instant: level !== undefined && bar.level !== undefined && level < bar.level });
      return;
    }
    setBar({ pct: 100, level: bar.level, instant: false });
    const t1 = setTimeout(() => setBar({ pct: 0, level, instant: true }), XP_FILL_MS);
    const t2 = setTimeout(() => setBar({ pct: target, level, instant: false }), XP_FILL_MS + 50);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [target, level]);
  return (
    <span class="xpbar">
      <span style={{ width: `${bar.pct}%`, transition: bar.instant ? 'none' : `width ${XP_FILL_MS}ms ease` }} />
    </span>
  );
}

export function StatusTag({ s }: { s: NonNullable<Mon['status']> }) {
  return <i class="status-tag" style={{ '--c': STATUSES[s].color }}>{tr(STATUSES[s].tag)}</i>;
}

export function TypeBadge({ type }: { type: TypeId }) {
  return <span class="type-badge" style={{ '--c': TYPES[type].color }}>{tr(TYPES[type].name)}</span>;
}

/** The type badge(s) of a species: one, or two for dual-type Bestioles. */
export function TypeBadges({ species }: { species: string }) {
  return <>{typesOf(species).map((t) => <TypeBadge type={t} />)}</>;
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

/**
 * Vertical GBA menu with the pencil cursor. Keyboard: ↑↓ A B; touch: tap an entry. With `tapFocus`, a
 * tap on another entry only moves the cursor there (to read its description) and a second tap picks it.
 */
export function MenuList({ items, onCancel, active = true, class: cls = '', onCursor, tapFocus }: {
  items: MenuItem[]; onCancel?: () => void; active?: boolean; class?: string; onCursor?: (i: number) => void; tapFocus?: boolean;
}) {
  const pick = (i: number) => {
    if (items[i]?.disabled) return;
    sfx.blip();
    items[i].onSelect();
  };
  const [cur, setCur] = useMenuNav(items.length, { onSelect: pick, onCancel, active });
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => onCursor?.(cur), [cur]);
  // in a list too long for its box, the keys bring the cursor into view
  useEffect(() => void box.current?.children[cur]?.scrollIntoView?.({ block: 'nearest' }), [cur]);
  return (
    <div ref={box} class={`mlist ${cls}`} role="menu">
      {items.map((it, i) => (
        <button
          class={`mlist__item ${i === cur ? 'is-on' : ''}`}
          role="menuitem"
          disabled={it.disabled}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setCur(i)}
          onClick={(e) => {
            // a mouse already moved the cursor on hover; a finger shows the description first
            if (tapFocus && i !== cur && (e as unknown as PointerEvent).pointerType !== 'mouse') return setCur(i);
            setCur(i);
            pick(i);
          }}
        >
          {it.icon && (sketchIconUrl(it.icon) ? <img class="sicon" src={sketchIconUrl(it.icon)!} alt="" /> : <img class="picon" src={iconUrl(it.icon)} alt="" />)}
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
  // Pages, page number and typed characters are all tagged with the text (and page) they belong to,
  // so a new message starts empty in the very first render. Resetting them in an effect instead
  // painted one frame of the new text at the old length before it was typed again.
  const [paged, setPaged] = useState({ text, pages: [text] });
  const pages = paged.text === text ? paged.pages : [text];
  const [pg, setPg] = useState({ text, i: 0 });
  const page = Math.min(pg.text === text ? pg.i : 0, pages.length - 1);
  const current = pages[page] ?? '';
  const [typed, setTyped] = useState({ text, page, n: instant ? Infinity : 0 });
  const shown = typed.text === text && typed.page === page ? Math.min(typed.n, current.length) : instant ? current.length : 0;
  // split into pages that fit the box (again whenever its size changes, keeping what is typed)
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
      setPaged((prev) => (prev.text === text && prev.pages.length === out.length && prev.pages.every((x, i) => x === out[i]) ? prev : { text, pages: out }));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    if (instant || shown >= current.length) return;
    const { chars, ms } = textPace();
    const id = setInterval(() => {
      setTyped((t) => ({ text, page, n: (t.text === text && t.page === page ? t.n : 0) + chars }));
    }, ms);
    return () => clearInterval(id);
  }, [text, page, current, instant, shown >= current.length]);
  const last = page >= pages.length - 1;
  const pageDone = shown >= current.length;
  const done = last && pageDone;
  useEffect(() => {
    if (done) onDone?.();
  }, [done, text]);
  const nextPage = () => setPg({ text, i: page + 1 });
  // battle messages turn their pages by themselves
  useEffect(() => {
    if (!autoPage || onAdvance || !pageDone || last) return;
    const id = setTimeout(nextPage, autoPage);
    return () => clearTimeout(id);
  }, [autoPage, pageDone, last, page, text]);
  const tap = () => {
    if (!pageDone) return setTyped({ text, page, n: Infinity });
    if (!last) {
      sfx.blip();
      return nextPage();
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

/** A move button. `onHold`: a long press (or a right click) asks what the move does, without picking it. */
export function MoveButton({ id, pp, disabled, onClick, onHold, class: cls = '' }: {
  id: string; pp?: number; disabled?: boolean; onClick: () => void; onHold?: () => void; class?: string;
}) {
  const mv = move(id);
  const hold = useRef<{ timer?: number; fired: boolean }>({ fired: false });
  const stop = () => clearTimeout(hold.current.timer);
  const fire = () => {
    stop();
    if (hold.current.fired) return;
    hold.current.fired = true;
    onHold?.();
  };
  return (
    <button
      class={`pk-move ${cls}`}
      style={{ '--type': TYPES[mv.type].color, '--th': `var(--hatch-t-${mv.type})` }}
      disabled={disabled}
      onPointerDown={() => {
        if (!onHold) return;
        stop();
        hold.current.fired = false;
        hold.current.timer = window.setTimeout(fire, 450);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => {
        if (!onHold) return;
        e.preventDefault();
        fire();
      }}
      onClick={() => {
        // the press that showed the details doesn't pick the move too
        if (hold.current.fired) hold.current.fired = false;
        else onClick();
      }}
    >
      <b>{tr(mv.name)}</b>
      <small><span class="pk-move__type">{tr(TYPES[mv.type].name)}</span>{pp !== undefined ? <span>PP {pp}/{mv.pp}</span> : null}</small>
    </button>
  );
}

const CATEGORY = { phys: L('Physique', 'Physical'), spec: L('Spéciale', 'Special'), status: L('Statut', 'Status') };

/** What a move does: its type and kind, power, accuracy, PP, and its description. */
export function MoveInfo({ id, pp }: { id: string; pp?: number }) {
  const mv = move(id);
  return (
    <div class="move-info">
      <p class="move-info__head"><b>{tr(mv.name)}</b> <TypeBadge type={mv.type} /> <span class="move-info__cat">{tr(CATEGORY[mv.cat])}</span></p>
      <p class="move-info__stats">
        {mv.cat !== 'status' && <span>{tr(L('Puissance', 'Power'))} {mv.power}</span>}
        <span>{tr(L('Précision', 'Accuracy'))} {mv.acc ?? '—'}</span>
        <span>PP {pp ?? mv.pp}/{mv.pp}</span>
      </p>
      <p class="move-info__desc">{tr(mv.desc)}</p>
    </div>
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

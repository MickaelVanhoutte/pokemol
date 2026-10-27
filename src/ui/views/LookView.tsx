import type { ComponentChildren } from 'preact';
import { useRef } from 'preact/hooks';
import { L, tr, type LText } from '../../i18n';
import {
  BOTTOM_STYLES, CLOTH_COLORS, EXTRAS, HAIR_COLORS, HAIR_STYLES, SKIN_COLORS, TOP_STYLES, randomLook, type Appearance,
} from '../../data/appearance';
import { personUrl } from '../personArt';
import { Window } from '../paper';
import { useMenuNav } from '../paper/nav';
import { sfx } from '../../audio/sfx';
import './views.css';

/** ◀ name ▶ through a list of styles. */
function Cycle<T extends string>({ list, value, onPick }: { list: { id: T; name: LText }[]; value: T; onPick: (v: T) => void }) {
  const i = Math.max(0, list.findIndex((o) => o.id === value));
  const step = (d: number) => onPick(list[(i + d + list.length) % list.length].id);
  return (
    <span class="lookv__cycle">
      <button class="pbtn" onClick={() => step(-1)} aria-label="◀">◀</button>
      <span class="lookv__value">{tr(list[i].name)}</span>
      <button class="pbtn" onClick={() => step(1)} aria-label="▶">▶</button>
    </span>
  );
}

/** Crayon swatches to pick a colour. */
function Swatches({ colors, value, onPick }: { colors: string[]; value: string; onPick: (c: string) => void }) {
  return (
    <span class="lookv__swatches">
      {colors.map((c) => (
        <button class={`lookv__swatch ${c === value ? 'is-on' : ''}`} style={{ '--c': c }} onClick={() => onPick(c)} aria-label={c} />
      ))}
    </span>
  );
}

function Row({ label, on, children }: { label: LText; on: boolean; children: ComponentChildren }) {
  return (
    <div class={`lookv__row ${on ? 'is-on' : ''}`}>
      <span class="lookv__label">{tr(label)}</span>
      <div class="lookv__controls">{children}</div>
    </div>
  );
}

const next = <T,>(list: readonly T[], v: T, d: number) => list[(Math.max(0, list.indexOf(v)) + d + list.length) % list.length];

/**
 * « Dessine-toi ! »: hairstyle and colour, skin, top, bottom and something extra, with the drawing
 * (front and back) changing as you pick. Keys: ▲▼ a row, ◀▶ its colour (or its style), A = OK.
 */
export function LookView({ look, onChange, onDone, onCancel, title }: {
  look: Appearance; onChange: (a: Appearance) => void; onDone: () => void; onCancel?: () => void; title?: string;
}) {
  // two picks before the next render both count
  const latest = useRef(look);
  latest.current = look;
  const set = (p: Partial<Appearance>) => {
    sfx.blip();
    latest.current = { ...latest.current, ...p };
    onChange(latest.current);
  };
  const hasColor = look.extra === 'casquette' || look.extra === 'bonnet' || look.extra === 'noeud';
  const ids = HAIR_STYLES.map((o) => o.id), tops = TOP_STYLES.map((o) => o.id), bottoms = BOTTOM_STYLES.map((o) => o.id), extras = EXTRAS.map((o) => o.id);
  // keyboard: each row's ◀▶ moves its colour, or its style when it has no colours
  const side: ((d: number) => void)[] = [
    (d) => set({ hair: next(ids, look.hair, d) }),
    (d) => set({ hairColor: next(HAIR_COLORS, look.hairColor, d) }),
    (d) => set({ skin: next(SKIN_COLORS, look.skin, d) }),
    (d) => set({ topColor: next(CLOTH_COLORS, look.topColor, d) }),
    (d) => set({ bottomColor: next(CLOTH_COLORS, look.bottomColor, d) }),
    (d) => set({ extra: next(extras, look.extra, d) }),
  ];
  const [cur] = useMenuNav(side.length, {
    // A on a row with a style and colours turns its style
    onSelect: (i) => (i === 3 ? set({ top: next(tops, look.top, 1) }) : i === 4 ? set({ bottom: next(bottoms, look.bottom, 1) }) : onDone()),
    onSide: (d, i) => side[i](d),
    onCancel,
  });
  return (
    <div class="lookv graph">
      <div class="lookv__stage">
        <img class="lookv__front" src={personUrl(look)} alt="" />
        <img class="lookv__back" src={personUrl(look, 'back')} alt="" />
      </div>
      <Window class="lookv__rows">
        {title && <p class="lookv__title">{title}</p>}
        <Row label={L('Coiffure', 'Hair')} on={cur === 0}><Cycle list={HAIR_STYLES} value={look.hair} onPick={(hair) => set({ hair })} /></Row>
        <Row label={L('Cheveux', 'Hair colour')} on={cur === 1}><Swatches colors={HAIR_COLORS} value={look.hairColor} onPick={(hairColor) => set({ hairColor })} /></Row>
        <Row label={L('Peau', 'Skin')} on={cur === 2}><Swatches colors={SKIN_COLORS} value={look.skin} onPick={(skin) => set({ skin })} /></Row>
        <Row label={L('Haut', 'Top')} on={cur === 3}>
          <Cycle list={TOP_STYLES} value={look.top} onPick={(top) => set({ top })} />
          <Swatches colors={CLOTH_COLORS} value={look.topColor} onPick={(topColor) => set({ topColor })} />
        </Row>
        <Row label={L('Bas', 'Bottom')} on={cur === 4}>
          <Cycle list={BOTTOM_STYLES} value={look.bottom} onPick={(bottom) => set({ bottom })} />
          <Swatches colors={CLOTH_COLORS} value={look.bottomColor} onPick={(bottomColor) => set({ bottomColor })} />
        </Row>
        <Row label={L('En plus', 'Extra')} on={cur === 5}>
          <Cycle list={EXTRAS} value={look.extra} onPick={(extra) => set({ extra })} />
          {hasColor && <Swatches colors={CLOTH_COLORS} value={look.extraColor ?? look.topColor} onPick={(extraColor) => set({ extraColor })} />}
        </Row>
      </Window>
      <div class="lookv__foot">
        {onCancel && <button class="pbtn pbtn--b" onClick={onCancel}>{tr(L('Annuler', 'Cancel'))}</button>}
        <button class="pbtn" onClick={() => { sfx.blip(); onChange(randomLook()); }}>{tr(L('Au hasard', 'Surprise me'))}</button>
        <button class="pbtn pbtn--accent" onClick={onDone}>OK ▶</button>
      </div>
    </div>
  );
}

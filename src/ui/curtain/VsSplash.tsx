import { useEffect, useMemo } from 'preact/hooks';
import type { Appearance } from '../../data/appearance';
import { personUrl } from '../personArt';
import { playSound } from '../../audio/sfx';
import { calmMotion } from '../../anim/calm';
import { seeded } from '../paper/pencilCanvas';
import './curtain.css';

export type VsKind = 'leader' | 'rival' | 'boss' | 'legend' | 'champion' | 'concours';

/** A boss's VS splash: the foe and the player face to face on a page torn in two. */
export interface VsCard {
  kind: VsKind;
  /** Small line over the name: Maître d'Atelier, Rival… (already translated). */
  title: string;
  name: string;
  /** The foe's half of the page (its badge's colour, the rival's purple…). */
  color: string;
  /** The foe drawn big: a person, or a Bestiole's drawing (legends). */
  foe: { person?: Appearance; art?: string };
  me: { person: Appearance; name: string };
}

/** When the « VS » is stamped, ms after the splash appears. */
export const VS_STAMP_AT = 430;

/** The torn edge across the page: a jagged line from left (at `y0`) to right (at `y1`), in %. */
function tornEdge(y0: number, y1: number, seed: number): [number, number][] {
  const r = seeded(seed);
  const n = 14;
  return Array.from({ length: n + 1 }, (_, i) => [(i / n) * 100, y0 + ((y1 - y0) * i) / n + (i % 2 ? -1 : 1) * (0.8 + r() * 1.6)]);
}

const poly = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(', ')})`;

export function VsSplash({ card, leaving, onSkip }: { card: VsCard; leaving: boolean; onSkip: () => void }) {
  const calm = calmMotion();
  const [foeClip, meClip] = useMemo(() => {
    // the foe's half ends a little above the player's: the paper shows through the tear
    const top = tornEdge(60, 38, 7), bottom = tornEdge(63, 41, 7);
    return [poly([[0, 0], [100, 0], ...[...top].reverse()]), poly([...bottom, [100, 100], [0, 100]])];
  }, []);
  useEffect(() => {
    const swoosh = setTimeout(() => playSound('swoosh'), 40);
    const stamp = setTimeout(() => playSound('stamp'), VS_STAMP_AT);
    const onKey = (e: KeyboardEvent) => {
      if (['z', 'Z', 'x', 'X', 'Enter', ' ', 'Escape'].includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        onSkip();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(swoosh);
      clearTimeout(stamp);
      window.removeEventListener('keydown', onKey, true);
    };
  }, []);
  const foeSrc = card.foe.art ?? (card.foe.person ? personUrl(card.foe.person) : '');
  return (
    <div
      class={`vs vs--${card.kind} ${leaving ? 'is-leaving' : ''} ${calm ? 'is-calm' : ''}`}
      style={{ '--vs-color': card.color, '--vs-stamp': `${VS_STAMP_AT}ms` }}
      onPointerDown={onSkip}
      role="presentation"
    >
      <div class="vs__band vs__band--foe" style={{ clipPath: foeClip }}>
        <div class="vs__lines" />
        {foeSrc && <img class={`vs__who vs__who--foe ${card.foe.art ? 'is-art' : ''}`} src={foeSrc} alt="" />}
      </div>
      <div class="vs__band vs__band--me" style={{ clipPath: meClip }}>
        <div class="vs__lines" />
        <img class="vs__who vs__who--me" src={personUrl(card.me.person)} alt="" />
      </div>
      <div class="vs__label vs__label--foe">
        <span class="vs__title">{card.title}</span>
        <span class="vs__name">{card.name}</span>
      </div>
      <div class="vs__label vs__label--me">
        <span class="vs__name">{card.me.name}</span>
      </div>
      <div class="vs__stamp" aria-hidden="true">VS</div>
    </div>
  );
}

/**
 * How the drawings move during a move animation, with the Web Animations API on the individual
 * `translate`, `rotate` and `scale` properties: they add up with the `transform: scaleX(-1)`
 * that mirrors sideways drawings, so a mirrored drawing stays mirrored while it moves.
 */
import type { Motion, Reaction } from './core';

interface Moves { frames: Keyframe[]; dur: number; hold?: boolean; easing?: string }

/** `d` is +1 for your Bestiole (it moves up and right towards the foe), -1 for the foe. */
export function motionFrames(kind: Motion, d: number): Moves {
  const fwd = (x: number, y: number) => `${d * x}% ${-d * y}%`;
  switch (kind) {
    case 'lunge': return { dur: 420, frames: [{ translate: '0 0' }, { translate: fwd(18, 10), offset: 0.4 }, { translate: '0 0' }] };
    case 'hop': return { dur: 520, frames: [{ translate: '0 0' }, { translate: '0 -16%', offset: 0.25 }, { translate: '0 0', offset: 0.5 }, { translate: '0 -9%', offset: 0.72 }, { translate: '0 0' }] };
    // a paper drawing turning round on itself, in the air
    case 'spin': return { dur: 520, frames: [{ scale: '1 1', translate: '0 0' }, { scale: '0.1 1', translate: '0 -8%', offset: 0.25 }, { scale: '-1 1', translate: '0 -12%', offset: 0.5 }, { scale: '0.1 1', translate: '0 -8%', offset: 0.75 }, { scale: '1 1', translate: '0 0' }] };
    case 'rear': return { dur: 560, frames: [{ translate: '0 0', rotate: '0deg' }, { translate: fwd(-8, -3), rotate: `${-d * 8}deg`, offset: 0.4 }, { translate: fwd(22, 12), rotate: `${d * 6}deg`, offset: 0.62 }, { translate: '0 0', rotate: '0deg' }] };
    case 'dash': return { dur: 460, frames: [{ translate: '0 0' }, { translate: fwd(34, 18), offset: 0.35 }, { translate: fwd(34, 18), offset: 0.5 }, { translate: '0 0' }] };
    case 'roll': return { dur: 620, frames: [{ translate: '0 0', scale: '1 1' }, { translate: fwd(17, 9), scale: '-1 0.9', offset: 0.22 }, { translate: fwd(34, 18), scale: '1 0.9', offset: 0.45 }, { translate: fwd(20, 10), scale: '-1 1', offset: 0.7 }, { translate: '0 0', scale: '1 1' }] };
    case 'shake': return { dur: 520, easing: 'linear', frames: [0, -3, 3, -3, 3, -2, 2, 0].map((x) => ({ translate: `${x}% 0` })) };
    case 'wiggle': return { dur: 620, frames: [0, -10, 10, -10, 10, 0].map((r) => ({ rotate: `${r}deg` })) };
    case 'rise': return { dur: 520, hold: true, frames: [{ translate: '0 0', opacity: 1 }, { translate: '0 8%', offset: 0.2, opacity: 1 }, { translate: '0 -230%', opacity: 0 }] };
    case 'sink': return { dur: 520, hold: true, frames: [{ translate: '0 0', scale: '1 1', opacity: 1 }, { translate: '0 -6%', scale: '1 1', offset: 0.2, opacity: 1 }, { translate: '0 60%', scale: '1.15 0.3', opacity: 0 }] };
    case 'drop': return { dur: 460, frames: [{ translate: `${-d * 30}% -230%`, opacity: 0 }, { opacity: 1, offset: 0.12 }, { translate: fwd(6, 3), offset: 0.75 }, { translate: '0 0', opacity: 1 }] };
    case 'popUp': return { dur: 460, frames: [{ translate: '0 60%', scale: '1 0.3', opacity: 0 }, { translate: '0 -14%', scale: '1 1.1', opacity: 1, offset: 0.55 }, { translate: '0 0', scale: '1 1', opacity: 1 }] };
  }
}

/** The target taking a hit: `power` grows on a critical or super-effective hit. */
export function reactionFrames(kind: Reaction, d: number, power: number): Moves | null {
  const k = power;
  switch (kind) {
    case 'jiggle': return { dur: 340, easing: 'linear', frames: [0, -5, 5, -4, 4, -2, 0].map((x) => ({ translate: `${x * k}% 0` })) };
    case 'knock': return { dur: 400, frames: [{ translate: '0 0' }, { translate: `${d * 11 * k}% ${-d * 5 * k}%`, offset: 0.3 }, { translate: '0 0' }] };
    case 'squash': return { dur: 400, frames: [{ scale: '1 1' }, { scale: `${1 + 0.15 * k} ${1 - 0.18 * k}`, offset: 0.3 }, { scale: '0.96 1.05', offset: 0.62 }, { scale: '1 1' }] };
    case 'none': return null;
  }
}

/** The hit blink after damage. */
export const BLINK: Moves = { dur: 600, easing: 'steps(1, end)', frames: [{ opacity: 1 }, { opacity: 0.12 }, { opacity: 1 }, { opacity: 0.12 }, { opacity: 1 }] };

/** The whole scene shaking (quakes, big hits). */
export function shakeFrames(power: number): Moves {
  return { dur: 440, easing: 'linear', frames: [[0, 0], [-6, 3], [5, -2], [-4, 2], [3, -1], [-2, 1], [0, 0]].map(([x, y]) => ({ translate: `${x * power}px ${y * power}px` })) };
}

/** Starts a motion; `speed` is the battle-speed multiplier, `delay` in ms. */
export function run(el: Element | null, m: Moves | null, speed: number, delay = 0): Animation | null {
  if (!m || !el || typeof (el as HTMLElement).animate !== 'function') return null;
  return (el as HTMLElement).animate(m.frames, {
    duration: m.dur * speed,
    delay: delay * speed,
    easing: m.easing ?? 'ease-out',
    fill: m.hold ? 'both' : delay ? 'backwards' : 'none',
  });
}

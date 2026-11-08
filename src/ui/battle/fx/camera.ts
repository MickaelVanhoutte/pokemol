/**
 * The battle camera, kept for the big moments: a plain hit or a status move leaves it still; a super-effective
 * or critical hit gets a short push onto the target at the hit, and settles back (the owner found a zoom on every
 * move too much). It only ever zooms in, around a point inside the scene, so the backdrop always covers the screen.
 *
 * It moves `.pk-cam` (backdrop, drawings, effects) with `translate` + `scale` from its top-left corner;
 * the HP boxes live in `.pk-hud` and stay still. Also here: the freeze-frame on big hits (hit-stop).
 */
import type { Anchor } from './core';

/** How much the camera pushes in: on a super-effective hit, on a critical one, onto a Bestiole fainting. */
export const ZOOM = { strong: 1.05, crit: 1.08, faint: 1.05 };
/** How long the camera holds on the target after the hit (ms at normal speed). */
export const HOLD_MS = 160;

/** `translate` and `scale` of `.pk-cam` that zoom by `s` around the point (x, y). */
export function zoomAt(x: number, y: number, s: number): { translate: string; scale: string } {
  return { translate: `${round(x * (1 - s))}px ${round(y * (1 - s))}px`, scale: `${round(s, 4)}` };
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const IDENTITY = { translate: '0px 0px', scale: '1' };
/** Each stretch eases in and out (the animation itself runs linearly between keyframes). */
const EASE = 'cubic-bezier(.35, 0, .25, 1)';

/** Keyframe offsets must never go backwards: each one at least the one before. */
function settle(frames: Keyframe[]): Keyframe[] {
  let last = 0;
  return frames.map((f) => {
    const offset = Math.min(1, Math.max(last, (f.offset as number) ?? last));
    last = offset;
    return { ...f, offset, easing: EASE };
  });
}

export interface CameraPlan {
  user: Anchor;
  target: Anchor;
  /** When the attacker moves and when the hit lands, and the whole animation (ms at normal speed). */
  userAt: number;
  impact: number;
  total: number;
  crit: boolean;
  eff: number;
  /** 'hit': lean on the attacker then zoom on the target; 'self': only lean on the one using the move. */
  kind: 'hit' | 'self';
}

/** Keyframes of the camera for one move (offsets over `total`), or null when it stays still. */
export function cameraFrames(p: CameraPlan): Keyframe[] | null {
  if (p.kind === 'self' || (!p.crit && p.eff <= 1)) return null;
  const total = Math.max(p.total, 1);
  const at = (ms: number) => Math.min(1, Math.max(0, ms / total));
  const hit = zoomAt(p.target.x, p.target.y, p.crit ? ZOOM.crit : ZOOM.strong);
  const hitAt = at(p.impact);
  const holdTo = Math.min(0.97, Math.max(hitAt + 0.01, at(p.impact + HOLD_MS)));
  return settle([
    { ...IDENTITY, offset: 0 },
    // still until just before the hit, then a quick push onto the target
    { ...IDENTITY, offset: Math.max(0, hitAt - 0.06) },
    { ...hit, offset: hitAt },
    { ...hit, offset: holdTo },
    { ...IDENTITY, offset: 1 },
  ]);
}

/** A short push onto a drawing (a Bestiole fainting). */
export function focusFrames(a: Anchor): Keyframe[] {
  const z = zoomAt(a.x, a.y, ZOOM.faint);
  return settle([{ ...IDENTITY, offset: 0 }, { ...z, offset: 0.35 }, { ...z, offset: 0.75 }, { ...IDENTITY, offset: 1 }]);
}

/** The freeze-frame at the hit (ms at normal speed): the final blow, a critical hit, a super-effective one. */
export function hitStopMs(o: { crit?: boolean; eff?: number; finalBlow?: boolean }): number {
  if (o.finalBlow) return 180;
  if (o.crit) return 120;
  if ((o.eff ?? 1) > 1) return 80;
  return 0;
}

/**
 * The animation's own clock with a freeze-frame: real time `ms` (at normal speed) runs normally up to
 * `impact`, stands still for `stop` ms, then goes on where it stopped.
 */
export function stopClock(ms: number, impact: number, stop: number): number {
  if (stop <= 0 || ms <= impact) return ms;
  return ms < impact + stop ? impact : ms - stop;
}

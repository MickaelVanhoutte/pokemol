/**
 * The clock of the cut-scenes. Holding B (or X, Shift) while a scene plays makes its staging run three
 * times faster: people walking, waits, fades, camera moves, bubbles. Nothing is skipped: the text keeps
 * its own pace and still waits for a press, and a choice on screen stops the hurry.
 */
import { signal } from '@preact/signals';

export const FAST = 3;

/** Scene time and the speed it runs at since `last` (real ms). */
export interface ClockState {
  scene: number;
  last: number;
  speed: number;
}

/** Moves a clock to real time `t`: the time since the last reading runs at the speed it had then. */
export function advance(c: ClockState, t: number, speedNow: number): ClockState {
  return { scene: c.scene + Math.max(0, t - c.last) * c.speed, last: t, speed: speedNow };
}

const realNow = () => (typeof performance === 'undefined' ? Date.now() : performance.now());

let clock: ClockState = { scene: 0, last: realNow(), speed: 1 };
let held = false;
/** Is a scene playing where hurrying makes sense (set by the overworld: a script runs, no choice is open)? */
let gate: () => boolean = () => false;

/** B is held and a scene plays: the B button shows « ×3 ». */
export const sceneFast = signal(false);

export function setSceneGate(fn: () => boolean) {
  gate = fn;
}

/** Holding B (touch buttons send the same keys as the keyboard). */
export function setHurry(on: boolean) {
  held = on;
}

export function sceneSpeed(): number {
  return held && gate() ? FAST : 1;
}

/** Scene time in ms: like `performance.now()`, but running faster while the player hurries a scene. */
export function sceneNow(): number {
  const speed = sceneSpeed();
  clock = advance(clock, realNow(), speed);
  const fast = speed > 1;
  if (sceneFast.peek() !== fast) sceneFast.value = fast;
  return clock.scene;
}

/** Waits `ms` of scene time (shorter in real time while hurried); a timer, so it ends in a hidden page too. */
export function sceneWait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  const end = sceneNow() + ms;
  return new Promise((resolve) => {
    const tick = () => {
      const left = end - sceneNow();
      if (left <= 0) return resolve();
      setTimeout(tick, Math.min(50, Math.max(8, left / sceneSpeed())));
    };
    tick();
  });
}

const HURRY_KEYS = new Set(['x', 'X', 'Shift']);
if (typeof window !== 'undefined') {
  // registered first, in the capture phase: menus and text boxes stop these keys later on
  window.addEventListener('keydown', (e) => { if (HURRY_KEYS.has(e.key)) setHurry(true); }, true);
  window.addEventListener('keyup', (e) => { if (HURRY_KEYS.has(e.key)) setHurry(false); }, true);
  window.addEventListener('blur', () => setHurry(false));
}

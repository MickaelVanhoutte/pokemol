/** The credits roll (CreditsScreen): how fast it climbs, and where the strip is after `run` ms of rolling. */

/** Pixels a second. */
export const CREDITS_SPEED = 42;
/** Holding B. */
export const CREDITS_FAST = 3;

/** The strip starts just under the view and stops once its end has risen to the middle of it. */
export function creditsY(run: number, viewH: number, stripH: number): { y: number; end: boolean } {
  const start = viewH;
  const stop = viewH / 2 - stripH;
  const y = start - (run / 1000) * CREDITS_SPEED;
  return y <= stop ? { y: stop, end: true } : { y, end: false };
}

/** Timings and keys of the evolution scene (EvolutionView), kept apart so tests can read them. */

/** The swaps between the old drawing and the new one (ms), faster and faster. */
export const EVO_SWAPS = [520, 460, 400, 340, 300, 260, 220, 190, 160, 130, 110, 90, 80, 70, 60, 60, 50, 50];

/** The sparkles bursting out when it is done: their angle (degrees) and how far they fly (px). */
export const BURST: [number, number][] = Array.from({ length: 12 }, (_, i) => [i * 30 + (i % 2) * 12, 90 + (i % 3) * 32]);

/** A press that counts: not a key held down from before (a repeat), only B, X, Escape or Backspace. */
export const isStopKey = (e: { key: string; repeat: boolean }) => !e.repeat && ['x', 'X', 'Escape', 'Backspace'].includes(e.key);


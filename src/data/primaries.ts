/**
 * The colours of a drained map coming back one primary at a time, like paints mixing (the Lac des Couleurs and its
 * three springs): no spring, greys; one, the world in shades of its colour; two, in shades of their mix (red and
 * yellow make orange, yellow and blue green, red and blue violet); three, the colours almost back (the last step,
 * `Game.colourReturn`, gives them back fully).
 */
export type Primary = 'red' | 'yellow' | 'blue';

/** How a drained map is drawn over its colours: their hue replaced (`color`) or washed out (`saturation`) by `colour`, at `strength`. */
export interface DrainMix {
  op: 'color' | 'saturation';
  colour: string;
  strength: number;
}

export const GREY: DrainMix = { op: 'saturation', colour: '#808080', strength: 1 };

export const PRIMARY_COLOUR: Record<Primary, string> = { red: '#e0453a', yellow: '#f2c14e', blue: '#4a7fd6' };
const MIXED: Record<string, string> = { 'red+yellow': '#f08a3a', 'blue+yellow': '#5cae5a', 'blue+red': '#9a6ad6' };

export function mixPrimaries(freed: Primary[]): DrainMix {
  const set = [...new Set(freed)].sort();
  if (!set.length) return GREY;
  if (set.length === 1) return { op: 'color', colour: PRIMARY_COLOUR[set[0]], strength: 0.85 };
  if (set.length === 2) return { op: 'color', colour: MIXED[set.join('+')], strength: 0.7 };
  return { op: 'saturation', colour: '#808080', strength: 0.45 };
}

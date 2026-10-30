import type { Fair } from '../redraws/crayon.ts';
import { drawHypnobelier } from '../redraws/hypnobelier.ts';

/** Hypnobélier's fair copy, Psychic: its own drawing in felt-tip, the horns bigger and blazing, a third ring of glow. */
export default {
  id: '119', slug: 'hypnobelier', seed: 119119, size: [1100, 1100], tilt: -3,
  draw: (c) => drawHypnobelier(c, true),
} satisfies Fair;

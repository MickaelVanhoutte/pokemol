import type { Fair } from '../redraws/crayon.ts';
import { drawSablerette } from '../redraws/sablerette.ts';

/** Sablerette's fair copy, Rock/Ground: its own drawing in felt-tip, the frill wider and rimmed with bigger crystals. */
export default {
  id: '117', slug: 'sablerette', seed: 117117, size: [1100, 1100], tilt: -2,
  draw: (c) => drawSablerette(c, true),
} satisfies Fair;

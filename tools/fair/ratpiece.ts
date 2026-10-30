import type { Fair } from '../redraws/crayon.ts';
import { drawRatpiece } from '../redraws/ratpiece.ts';

/** Ratpiécé's fair copy, Normal/Steel: its own drawing in felt-tip, a patched cape flying, a feather in its thimble. */
export default {
  id: '120', slug: 'ratpiece', seed: 120120, size: [1000, 1000], tilt: -2,
  draw: (c) => drawRatpiece(c, true),
} satisfies Fair;

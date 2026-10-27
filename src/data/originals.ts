/**
 * The little artist's own drawings, kept as the originals the Bestioles were redrawn from
 * (public/originals, cut out of her photos by `npm run cards`). Shown in the credits and the museum.
 */
import { CREATURES } from './creatures';
import type { SpeciesDef } from './schema';

/** Species ids that have one of her drawings. */
export const ORIGINALS: string[] = Array.from({ length: 21 }, (_, i) => String(i + 1).padStart(3, '0'));

export const hasOriginal = (c: SpeciesDef) => ORIGINALS.includes(c.id);

export function originalUrl(c: SpeciesDef): string {
  return `${import.meta.env.BASE_URL}originals/${c.id}-${c.slug}.webp`;
}

/** Her drawings, in Bestiodex order. */
export const originals = () => CREATURES.filter(hasOriginal);

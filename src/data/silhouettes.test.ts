import { describe, expect, it } from 'vitest';
import { CREATURES } from './creatures';
import { FAIL, overlap } from '../../tools/redraws/silhouette';

/** An evolution changes its silhouette (docs/bestioles.md, tools/redraws/silhouette.ts): never a copy of the form before. */
const card = (id: string, slug: string) => new URL(`../../public/cards/${id}-${slug}.webp`, import.meta.url).pathname;

describe('evolutions change their silhouette', () => {
  for (const c of CREATURES) for (const e of c.evolutions ?? []) {
    const to = CREATURES.find((x) => x.id === e.to)!;
    it(`${c.slug} -> ${to.slug}`, async () => {
      expect(await overlap(card(c.id, c.slug), card(to.id, to.slug))).toBeLessThan(FAIL);
    });
  }
});

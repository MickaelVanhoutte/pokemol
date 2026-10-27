import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { creature } from './creatures';
import { ORIGINALS, originals } from './originals';

describe('her original drawings', () => {
  it('keeps each one next to its redrawn card and miniature', () => {
    expect(originals().length).toBe(ORIGINALS.length);
    for (const id of ORIGINALS) {
      const c = creature(id);
      expect(existsSync(`public/originals/${c.id}-${c.slug}.webp`), `${id} original`).toBe(true);
      expect(existsSync(`public/cards/${c.id}-${c.slug}.webp`), `${id} card`).toBe(true);
      expect(existsSync(`public/minis/${c.id}-${c.slug}.png`), `${id} mini`).toBe(true);
    }
  });
});

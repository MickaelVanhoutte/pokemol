import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CREATURES, creature, typesOf } from './creatures';
import { FAIR_COPY, canTransform } from './fairCopies';
import { move } from './moves';
import { FAIR_RIG_OF, MOTIONS } from './rigs';
import { talent } from './talents';
import type { Stats } from './schema';

/** The fair copies' rules (« mise au propre », docs/bestioles.md): one per fully grown Bestiole, drawn in felt-tip. */
const total = (b: Stats) => Object.values(b).reduce((a, x) => a + x, 0);

describe('fair copies', () => {
  it('has one for every fully grown Bestiole, and only for them', () => {
    const finals = CREATURES.filter(canTransform).map((c) => c.id).sort();
    expect(Object.keys(FAIR_COPY).sort()).toEqual(finals);
  });

  for (const [id, fc] of Object.entries(FAIR_COPY)) {
    const sp = creature(id);
    it(`${id} ${sp.slug}: +20 % but HP, a new type and its moves (or a new talent), its drawing`, () => {
      expect(fc.base.hp).toBe(sp.base.hp);
      for (const k of ['atk', 'def', 'spa', 'spd', 'spe'] as const) expect(fc.base[k], k).toBeGreaterThanOrEqual(sp.base[k]);
      expect(total(fc.base)).toBe(Math.round((total(sp.base) * 1.2) / 5) * 5);
      if (fc.talent) expect(() => talent(fc.talent!)).not.toThrow();
      if (fc.type2) {
        // one of its types kept, one new
        expect(typesOf(id)).toContain(fc.type ?? sp.type);
        expect(typesOf(id)).not.toContain(fc.type2);
        // and its family learns a move of that type by level 45 (it as this form, or an earlier form before it
        // evolves), or its new type would do nothing for it
        const hits = (lv: number, mv: string) => lv <= 45 && move(mv).type === fc.type2 && move(mv).power > 0;
        const fromOf = (to: string) => CREATURES.find((c) => c.evolutions?.some((e) => e.to === to));
        const evo = fromOf(id)?.evolutions?.find((e) => e.to === id);
        let learns = sp.learnset.some(([lv, mv]) => (lv === 0 || lv >= (evo?.level ?? 0)) && hits(lv, mv));
        for (let c = fromOf(id); c && !learns; c = fromOf(c.id)) learns = c.learnset.some(([lv, mv]) => hits(lv, mv));
        expect(learns, `${sp.slug} learns no ${fc.type2} move by level 45`).toBe(true);
      } else expect(fc.talent, 'a fair copy that keeps its types takes a new talent').toBeDefined();
      // drawn by `npm run fair`, moving in battle like the pencil ones
      const rig = FAIR_RIG_OF[id];
      expect(rig, 'drawn').toBeDefined();
      expect(rig.slug).toBe(sp.slug);
      const dir = new URL(`../../public/fair/${id}-${rig.slug}/`, import.meta.url);
      expect(existsSync(new URL('base.webp', dir)), 'base').toBe(true);
      for (const p of rig.parts) {
        expect(existsSync(new URL(`${p.name}.webp`, dir)), p.name).toBe(true);
        expect(MOTIONS, p.name).toContain(p.motion);
        expect(p.left >= 0 && p.top >= 0 && p.left + p.width <= 100.2 && p.top + p.height <= 100.2, `${p.name} box`).toBe(true);
      }
    });
  }
});

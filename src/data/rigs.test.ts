import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CREATURES, creature } from './creatures';
import { MOTIONS, RIG_OF, idleOf } from './rigs';

describe('battle rigs', () => {
  for (const [id, rig] of Object.entries(RIG_OF)) {
    it(`${id} ${rig.slug}: its pictures, boxes and pivots`, () => {
      expect(creature(id).slug).toBe(rig.slug);
      const dir = new URL(`../../public/rigs/${id}-${rig.slug}/`, import.meta.url);
      expect(existsSync(new URL('base.webp', dir)), 'base').toBe(true);
      expect(rig.parts.length).toBeGreaterThan(0);
      expect(new Set(rig.parts.map((p) => p.name)).size).toBe(rig.parts.length);
      for (const p of rig.parts) {
        expect(existsSync(new URL(`${p.name}.webp`, dir)), p.name).toBe(true);
        expect(MOTIONS, p.name).toContain(p.motion);
        // every piece lies on the drawing's sheet, and turns around a point on or next to it
        expect(p.left >= 0 && p.top >= 0 && p.left + p.width <= 100.2 && p.top + p.height <= 100.2, `${p.name} box`).toBe(true);
        expect(p.ox >= -25 && p.ox <= 125 && p.oy >= -25 && p.oy <= 125, `${p.name} pivot ${p.ox},${p.oy}`).toBe(true);
        if (p.motion === 'peek' || p.motion === 'throw') expect(p.to, `${p.name} goes somewhere`).toBeDefined();
      }
    });
  }
  it('lets every Bestiole breathe or hover while it waits', () => {
    for (const c of CREATURES) expect(['breathe', 'hover']).toContain(idleOf(c.id));
  });
});

import { describe, expect, it } from 'vitest';
import { CURVE_PATH, curve, forcedSteps } from './curve';

/**
 * The owner's rule (Oct 2026): on Normal, a player who fights every trainer on the way and the wild
 * Bestioles they can't avoid keeps up without grinding. Each act is checked once its routes have been
 * made longer: `CHECKED_UNTIL` moves forward with them.
 */
const CHECKED_UNTIL = 'atelierPlume';

describe('the level curve on Normal', () => {
  const { rows } = curve('normal');
  const last = rows.map((r) => r.map).lastIndexOf(CHECKED_UNTIL);
  const checked = rows.slice(0, last + 1);

  it('never puts a route trainer ahead of the team’s lead', () => {
    for (const r of checked.filter((x) => !x.leader)) expect(`${r.trainer} L${r.ace}`).toBe(`${r.trainer} L${Math.min(r.ace, r.starter)}`);
  });

  it('keeps each Atelier Master within one level of it', () => {
    for (const r of checked.filter((x) => x.leader)) expect(r.ace - r.starter, r.trainer).toBeLessThanOrEqual(1);
  });

  it('walks a real path: every map crossed links where it should', () => {
    for (const s of CURVE_PATH.filter((x) => x.from && x.to)) {
      expect(forcedSteps(s.map, s.from!, s.to!), `${s.from} → ${s.map} → ${s.to}`).toBeGreaterThanOrEqual(0);
    }
  });
});

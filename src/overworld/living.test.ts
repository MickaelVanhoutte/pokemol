import { describe, expect, it } from 'vitest';
import { dustPuff, grassBurst, MAX_PARTICLES, ripple, stepParticles } from './particles';
import { stepOut } from './doors';
import { AMBIENT_KINDS, AMBIENT_COUNT, speckAt } from './ambient';
import { DAY_TINT, EVENING_TINT, NIGHT_TINT, tintAt } from '../state/clock';
import { seeded } from '../ui/paper/pencilCanvas';

describe('particles', () => {
  it('blades fly up then fall, and everything fades out', () => {
    const r = seeded(3);
    let ps = grassBurst(32, 48, r);
    const y0 = ps[0].y;
    ps = stepParticles(ps, 60);
    expect(ps[0].y).toBeLessThan(y0);
    for (let i = 0; i < 30; i++) ps = stepParticles(ps, 60);
    expect(ps).toEqual([]);
  });

  it('dust and ripples last a moment, never more than the pool holds', () => {
    const r = seeded(5);
    let ps = [...dustPuff(0, 0, r), ripple(0, 0)];
    ps = stepParticles(ps, 300);
    expect(ps.length).toBeGreaterThan(0);
    const many = Array.from({ length: 30 }, () => grassBurst(0, 0, r)).flat();
    expect(stepParticles(many, 1).length).toBeLessThanOrEqual(MAX_PARTICLES);
  });
});

describe('doors', () => {
  const door = (x: number, y: number) => x === 5 && y === 4;
  it('coming out of a building starts in its doorway', () => {
    expect(stepOut({ x: 5, y: 5, facing: 'down' }, door)).toEqual({ x: 5, y: 4 });
    expect(stepOut({ x: 5, y: 5 }, door)).toEqual({ x: 5, y: 4 });
  });
  it('anywhere else, nothing changes', () => {
    expect(stepOut({ x: 6, y: 5, facing: 'down' }, door)).toBeNull();
    expect(stepOut({ x: 5, y: 5, facing: 'up' }, door)).toBeNull();
  });
});

describe('time of day', () => {
  it('is plain by day, warm in the evening, blue at night', () => {
    expect(tintAt(12)).toEqual(DAY_TINT);
    expect(tintAt(20)).toEqual(EVENING_TINT);
    expect(tintAt(2)).toEqual(NIGHT_TINT);
  });

  it('never jumps: five minutes change it only a little', () => {
    for (let m = 0; m < 24 * 60; m += 5) {
      const a = tintAt(m / 60), b = tintAt((m + 5) / 60);
      for (let i = 0; i < 3; i++) expect(Math.abs(a[i] - b[i])).toBeLessThanOrEqual(15);
    }
  });
});

describe('ambient air', () => {
  it('keeps its specks around the view', () => {
    for (const kind of AMBIENT_KINDS) {
      for (let i = 0; i < AMBIENT_COUNT[kind]; i++) {
        for (const t of [0, 3.7, 120]) {
          const s = speckAt(kind, i, t, 200, 300, 480, 160);
          expect(s.x).toBeGreaterThanOrEqual(-12);
          expect(s.x).toBeLessThanOrEqual(212);
          expect(s.y).toBeGreaterThanOrEqual(-12);
          expect(s.y).toBeLessThanOrEqual(312);
          expect(s.alpha).toBeGreaterThanOrEqual(-1e-9);
        }
      }
    }
  });
});

import { describe, expect, it } from 'vitest';
import { cameraFrames, focusFrames, hitStopMs, stopClock, zoomAt, ZOOM } from './camera';
import type { Anchor } from './core';

const anchor = (x: number, y: number): Anchor => ({ x, y, top: y - 40, bottom: y + 40, left: x - 40, right: x + 40, size: 80 });
const me = anchor(100, 300), foe = anchor(300, 120);
const plan = { user: me, target: foe, userAt: 0, impact: 500, total: 1000, crit: false, eff: 1, kind: 'hit' as const };

/** Where a point of the scene lands once the camera's keyframe is applied (origin top left). */
function apply(f: Keyframe, x: number, y: number): [number, number] {
  const [tx, ty] = String(f.translate).split(' ').map((v) => parseFloat(v));
  const s = parseFloat(String(f.scale));
  return [x * s + tx, y * s + ty];
}

describe('battle camera', () => {
  it('zooms around a point that stays where it is', () => {
    const f = zoomAt(250, 90, 1.12);
    const [x, y] = apply(f, 250, 90);
    expect(x).toBeCloseTo(250, 1);
    expect(y).toBeCloseTo(90, 1);
  });

  it('only zooms in, so the backdrop always covers the screen', () => {
    for (const f of cameraFrames(plan)!) {
      const s = parseFloat(String(f.scale));
      expect(s).toBeGreaterThanOrEqual(1);
      // the scene's corners land outside (or on) the screen's: (0, 0) and (400, 400)
      const [x0, y0] = apply(f, 0, 0), [x1, y1] = apply(f, 400, 400);
      expect(x0).toBeLessThanOrEqual(0.01);
      expect(y0).toBeLessThanOrEqual(0.01);
      expect(x1).toBeGreaterThanOrEqual(399.99);
      expect(y1).toBeGreaterThanOrEqual(399.99);
    }
  });

  it('starts and ends on the plain view, keyframes in order', () => {
    for (const frames of [cameraFrames(plan)!, cameraFrames({ ...plan, kind: 'self' })!, focusFrames(foe), cameraFrames({ ...plan, impact: 990 })!]) {
      expect(frames[0].scale).toBe('1');
      expect(frames[frames.length - 1].scale).toBe('1');
      const offsets = frames.map((f) => f.offset as number);
      expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
      expect(offsets[offsets.length - 1]).toBe(1);
    }
  });

  it('zooms on the target at the hit, more on a critical or super-effective one', () => {
    const peak = (p: typeof plan) => Math.max(...cameraFrames(p)!.map((f) => parseFloat(String(f.scale))));
    expect(peak(plan)).toBeCloseTo(ZOOM.hit);
    expect(peak({ ...plan, eff: 2 })).toBeCloseTo(ZOOM.strong);
    expect(peak({ ...plan, crit: true })).toBeCloseTo(ZOOM.crit);
    // the hit frame is centred on the target
    const hit = cameraFrames(plan)!.find((f) => parseFloat(String(f.scale)) === ZOOM.hit)!;
    const [x, y] = apply(hit, foe.x, foe.y);
    expect(x).toBeCloseTo(foe.x, 0);
    expect(y).toBeCloseTo(foe.y, 0);
  });

  it('a status move only leans on its user', () => {
    const peak = Math.max(...cameraFrames({ ...plan, kind: 'self' })!.map((f) => parseFloat(String(f.scale))));
    expect(peak).toBeCloseTo(ZOOM.lean);
  });
});

describe('freeze-frame', () => {
  it('lasts longest on the final blow', () => {
    expect(hitStopMs({})).toBe(0);
    expect(hitStopMs({ eff: 2 })).toBeGreaterThan(0);
    expect(hitStopMs({ crit: true })).toBeGreaterThan(hitStopMs({ eff: 2 }));
    expect(hitStopMs({ finalBlow: true })).toBeGreaterThan(hitStopMs({ crit: true }));
  });

  it('holds the animation’s clock at the hit, then goes on', () => {
    expect(stopClock(300, 500, 120)).toBe(300);
    expect(stopClock(560, 500, 120)).toBe(500);
    expect(stopClock(700, 500, 120)).toBe(580);
    expect(stopClock(700, 500, 0)).toBe(700);
  });
});

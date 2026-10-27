import { describe, expect, it } from 'vitest';
import { MOVES } from '../../../data/moves';
import { setCanvasFactory, Brush, type CanvasLike } from './brush';
import type { Anchor, Env } from './core';
import { MOVE_FX } from './recipes';

/** A 2D context that accepts every call and counts the drawing ones. */
function stubContext(count: { n: number }): CanvasRenderingContext2D {
  const props: Record<string | symbol, unknown> = {};
  return new Proxy(props, {
    get: (t, k) => (k in t ? t[k] : (..._: unknown[]) => { count.n++; }),
    set: (t, k, v) => { t[k] = v; return true; },
  }) as unknown as CanvasRenderingContext2D;
}

const count = { n: 0 };
setCanvasFactory((width, height) => ({ width, height, getContext: () => stubContext(count) }) as unknown as CanvasLike);

const anchor = (x: number, y: number, size: number): Anchor => ({ x, y, size, top: y - size / 2, bottom: y + size / 2, left: x - size / 2, right: x + size / 2 });
const envs: Env[] = [
  { w: 400, h: 420, user: anchor(120, 330, 170), target: anchor(300, 120, 110), userSide: 0, dir: 1, k: 1.3, seed: 7, crit: false, eff: 1 },
  { w: 400, h: 420, user: anchor(300, 120, 110), target: anchor(120, 330, 170), userSide: 1, dir: -1, k: 1.3, seed: 8, crit: true, eff: 2 },
];

describe('move animations', () => {
  it('only animates moves that exist', () => {
    const ids = new Set(MOVES.map((m) => m.id));
    for (const id of Object.keys(MOVE_FX)) expect(ids.has(id), id).toBe(true);
  });

  it('gives every move an animation, and two-turn moves their first turn', () => {
    for (const m of MOVES) {
      expect(MOVE_FX[m.id], `${m.id} has no animation in src/ui/battle/fx/recipes.ts`).toBeDefined();
      if (m.effects?.some((e) => e.kind === 'charge')) expect(MOVE_FX[m.id].charge, `${m.id}: first turn`).toBeDefined();
    }
  });

  it('draws every animation from start to end, in time', () => {
    for (const [id, recipe] of Object.entries(MOVE_FX)) {
      for (const part of [recipe, recipe.charge].filter((p) => !!p)) {
        for (const env of envs) {
          const layers = part.layers.map((f) => f(env));
          const total = Math.max(...layers.map((l) => l.start + l.dur));
          expect(total, `${id} lasts ${total} ms`).toBeLessThanOrEqual(1600);
          if (part === recipe) {
            const hit = layers.find((l) => l.impact !== undefined);
            if (hit) expect(hit.start + hit.impact!, `${id} impact`).toBeLessThanOrEqual(total);
          }
          count.n = 0;
          const ctx = stubContext(count);
          for (let f = 0; f <= 20; f++) {
            const ms = (f / 20) * total;
            const b = new Brush(ctx, env, f);
            for (const l of layers) {
              const t = (ms - l.start) / l.dur;
              if (t >= 0 && t <= 1) l.draw(b, t);
            }
          }
          expect(count.n, `${id} draws nothing`).toBeGreaterThan(0);
        }
      }
    }
  });
});

import { describe, expect, it } from 'vitest';
import { createMon } from './creature';
import { judge } from './judge';

const withIvs = (hp: number, atk: number, def: number, spa: number, spd: number, spe: number) =>
  createMon('001', 10, { rng: 1 }, { hp, atk, def, spa, spd, spe });

describe('IV judge', () => {
  it('rates the overall potential in four bands', () => {
    expect(judge(withIvs(15, 15, 15, 15, 15, 15)).potential).toBe(0);
    expect(judge(withIvs(16, 15, 15, 15, 15, 15)).potential).toBe(1);
    expect(judge(withIvs(25, 25, 25, 25, 25, 25)).potential).toBe(2);
    expect(judge(withIvs(31, 31, 31, 31, 31, 31))).toMatchObject({ total: 186, potential: 3 });
  });

  it('names every best stat and rates it', () => {
    expect(judge(withIvs(3, 31, 0, 31, 2, 1))).toMatchObject({ best: ['atk', 'spa'], bestRating: 3 });
    expect(judge(withIvs(15, 0, 0, 0, 0, 0))).toMatchObject({ best: ['hp'], bestRating: 0 });
    expect(judge(withIvs(0, 0, 0, 0, 0, 16)).bestRating).toBe(1);
    expect(judge(withIvs(0, 0, 30, 0, 0, 0)).bestRating).toBe(2);
  });
});

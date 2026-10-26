import { describe, expect, it } from 'vitest';
import { ivGrade } from './judge';
import { calcStat, createMon, statsOf } from './creature';
import { NATURES, nature, natureFromUid, natureTenths } from '../../data/natures';

describe('IV grades', () => {
  it('turns each IV into a letter from E to S', () => {
    expect([0, 5, 6, 11, 12, 17, 18, 23, 24, 29, 30, 31].map(ivGrade).join('')).toBe('EEDDCCBBAASS');
  });
});

describe('natures', () => {
  it('has 25 natures: 20 raise one stat and lower another, 5 change nothing', () => {
    expect(NATURES).toHaveLength(25);
    expect(new Set(NATURES.map((n) => n.id)).size).toBe(25);
    const moving = NATURES.filter((n) => n.up);
    expect(moving).toHaveLength(20);
    expect(moving.every((n) => n.down && n.down !== n.up)).toBe(true);
    expect(new Set(moving.map((n) => `${n.up}>${n.down}`)).size).toBe(20);
  });

  it('multiplies the raised stat by 1.1 and the lowered one by 0.9, never HP', () => {
    expect(calcStat('atk', 52, 31, 0, 50, 11)).toBe(Math.floor((Math.floor(((104 + 31) * 50) / 100) + 5) * 1.1));
    expect(calcStat('atk', 52, 31, 0, 50, 9)).toBe(Math.floor((Math.floor(((104 + 31) * 50) / 100) + 5) * 0.9));
    expect(natureTenths('reveuse', 'spa')).toBe(11);
    expect(natureTenths('reveuse', 'atk')).toBe(9);
    expect(natureTenths('reveuse', 'hp')).toBe(10);
    const m = createMon('001', 30, { rng: 4 });
    const neutral = statsOf({ ...m, nature: 'joyeuse' });
    const dreamy = statsOf({ ...m, nature: 'reveuse' });
    expect(dreamy.hp).toBe(neutral.hp);
    expect(dreamy.spa).toBeGreaterThan(neutral.spa);
    expect(dreamy.atk).toBeLessThan(neutral.atk);
    expect(dreamy.def).toBe(neutral.def);
  });

  it('gives every new Bestiole a nature, and old ones a fixed one', () => {
    const m = createMon('013', 5, { rng: 9 });
    expect(nature(m.nature).id).toBe(m.nature);
    expect(natureFromUid('abc-1-x')).toBe(natureFromUid('abc-1-x'));
  });
});

import { describe, expect, it } from 'vitest';
import { gapOf, isSolved, neighbours, push, shuffle, slide, solvedBoard } from './fresque';
import { deal, pickSpecies, prizeTier } from './memo';

/** Seeded numbers in [0, 1). */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

describe('fresque', () => {
  it('slides only a piece next to the gap', () => {
    const b = solvedBoard(3);
    expect(gapOf(b)).toBe(8);
    expect(slide(b, 0, 3)).toBeNull();
    const moved = slide(b, 7, 3)!;
    expect(gapOf(moved)).toBe(7);
    expect(isSolved(moved)).toBe(false);
    expect(isSolved(slide(moved, 8, 3)!)).toBe(true);
    expect(neighbours(4, 3).sort()).toEqual([1, 3, 5, 7]);
  });

  it('moves the piece facing the gap with the arrows', () => {
    const b = solvedBoard(3);
    expect(push(b, 'right', 3)).toEqual(slide(b, 7, 3));
    expect(push(b, 'down', 3)).toEqual(slide(b, 5, 3));
    expect(push(b, 'left', 3)).toBeNull();
  });

  it('shuffles into a mixed-up board that can be put back', () => {
    for (let seed = 1; seed < 40; seed++) {
      const b = shuffle(3, 45, rng(seed));
      expect(isSolved(b)).toBe(false);
      expect([...b].sort((x, y) => x - y)).toEqual(solvedBoard(3));
      // solvable: an even number of inversions with the gap counted by rows (odd width rule)
      const pieces = b.filter((p) => p !== 8);
      let inv = 0;
      for (let i = 0; i < pieces.length; i++) for (let j = i + 1; j < pieces.length; j++) if (pieces[i] > pieces[j]) inv++;
      expect(inv % 2).toBe(0);
    }
    expect(shuffle(4, 80, rng(3))).toHaveLength(16);
  });
});

describe('Mémo-Bestioles', () => {
  it('deals two of each drawing', () => {
    const sp = pickSpecies(['001', '002', '003', '004', '005', '006', '007', '008'], 6, rng(5));
    expect(new Set(sp).size).toBe(6);
    const cards = deal(sp, rng(9));
    expect(cards).toHaveLength(12);
    for (const s of sp) expect(cards.filter((c) => c === s)).toHaveLength(2);
  });

  it('gives a medal by the number of tries', () => {
    expect(prizeTier(6)).toBe('gold');
    expect(prizeTier(10)).toBe('gold');
    expect(prizeTier(11)).toBe('silver');
    expect(prizeTier(14)).toBe('silver');
    expect(prizeTier(15)).toBe('bronze');
  });
});

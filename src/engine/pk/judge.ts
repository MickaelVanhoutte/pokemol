import type { StatKey } from '../../data/schema';
import { STAT_KEYS, type Mon } from './creature';

export interface Verdict {
  /** Sum of the six IVs (0–186). */
  total: number;
  /** 0: decent (≤ 90), 1: above average (≤ 120), 2: relatively superior (≤ 150), 3: outstanding. */
  potential: 0 | 1 | 2 | 3;
  /** Stats sharing the highest IV. */
  best: StatKey[];
  /** That IV: 0 (0–15), 1 (16–25), 2 (26–30), 3 (31, can't be better). */
  bestRating: 0 | 1 | 2 | 3;
}

/** The IV judge: what a creature was born with, in the words of the GBA-era judges. */
export function judge(m: Mon): Verdict {
  const total = STAT_KEYS.reduce((n, k) => n + m.ivs[k], 0);
  const top = Math.max(...STAT_KEYS.map((k) => m.ivs[k]));
  return {
    total,
    potential: total <= 90 ? 0 : total <= 120 ? 1 : total <= 150 ? 2 : 3,
    best: STAT_KEYS.filter((k) => m.ivs[k] === top),
    bestRating: top <= 15 ? 0 : top <= 25 ? 1 : top <= 30 ? 2 : 3,
  };
}

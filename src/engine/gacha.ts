import { CREATURES } from '../data/creatures';
import { SUPPORT_CARDS } from '../data/supportCards';
import type { Rarity } from '../data/schema';
import { nextRandom, randomInt } from './rng';

export type Banner = 'creature' | 'support';

export const PULL_COST: Record<1 | 10, number> = { 1: 50, 10: 450 };
/** Pulls without the top rarity before it is guaranteed. */
export const PITY: Record<Banner, number> = { creature: 40, support: 20 };

const ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'holo'];
const WEIGHTS: Record<Banner, Record<Rarity, number>> = {
  creature: { common: 58, uncommon: 30, rare: 10, holo: 2 },
  support: { common: 60, uncommon: 30, rare: 10, holo: 0 },
};
const TOP: Record<Banner, Rarity> = { creature: 'holo', support: 'rare' };

function poolFor(banner: Banner, rarity: Rarity): string[] {
  const list = banner === 'creature' ? CREATURES : SUPPORT_CARDS.filter((c) => !c.id.endsWith('+'));
  return list.filter((c) => c.rarity === rarity).map((c) => c.id);
}

function pickOf(st: { rng: number }, banner: Banner, rarity: Rarity): { id: string; rarity: Rarity } {
  // fall back to the closest lower rarity that has cards
  for (let i = ORDER.indexOf(rarity); i >= 0; i--) {
    const pool = poolFor(banner, ORDER[i]);
    if (pool.length) return { id: pool[randomInt(st, pool.length)], rarity: ORDER[i] };
  }
  throw new Error('empty banner');
}

function rollRarity(st: { rng: number }, banner: Banner): Rarity {
  const w = WEIGHTS[banner];
  const total = ORDER.reduce((n, r) => n + w[r], 0);
  let x = nextRandom(st) * total;
  for (const r of ORDER) {
    x -= w[r];
    if (x < 0) return r;
  }
  return 'common';
}

export interface PullResult {
  cards: { id: string; rarity: Rarity }[];
  pity: number;
}

export function pull(st: { rng: number }, banner: Banner, count: 1 | 10, pity: number): PullResult {
  const cards: { id: string; rarity: Rarity }[] = [];
  const top = TOP[banner];
  for (let i = 0; i < count; i++) {
    pity++;
    let rarity = pity >= PITY[banner] ? top : rollRarity(st, banner);
    if (count === 10 && i === 9 && !cards.some((c) => ORDER.indexOf(c.rarity) >= 2) && ORDER.indexOf(rarity) < 2) rarity = 'rare';
    const card = pickOf(st, banner, rarity);
    if (card.rarity === top) pity = 0;
    cards.push(card);
  }
  return { cards, pity };
}

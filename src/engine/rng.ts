/** Small seeded PRNG (mulberry32). State is a plain uint32 so it can live inside saved/cloned state. */
export function nextRandom(state: { rng: number }): number {
  let t = (state.rng = (state.rng + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomInt(state: { rng: number }, n: number): number {
  return Math.floor(nextRandom(state) * n);
}

export function shuffle<T>(state: { rng: number }, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(state, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickWeighted<T>(state: { rng: number }, items: T[], weight: (t: T) => number): T {
  const total = items.reduce((s, i) => s + weight(i), 0);
  let r = nextRandom(state) * total;
  for (const i of items) {
    r -= weight(i);
    if (r < 0) return i;
  }
  return items[items.length - 1];
}

export function newSeed(): number {
  return (Math.random() * 4294967296) >>> 0;
}

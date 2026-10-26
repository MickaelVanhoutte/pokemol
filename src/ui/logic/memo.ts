/** Mémo-Bestioles: a memory game with pairs of drawings. */

/** Two of each species, mixed. `rnd` returns numbers in [0, 1). */
export function deal(species: string[], rnd: () => number): string[] {
  const cards = [...species, ...species];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/** `n` different species picked at random. */
export function pickSpecies(all: string[], n: number, rnd: () => number): string[] {
  const pool = [...all];
  const out: string[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return out;
}

/** Pairs on the table. */
export const MEMO_PAIRS = 6;

/** How well a game went: 10 tries or fewer for gold, 14 for silver (a perfect game takes 6). */
export function prizeTier(tries: number): 'gold' | 'silver' | 'bronze' {
  return tries <= 10 ? 'gold' : tries <= 14 ? 'silver' : 'bronze';
}

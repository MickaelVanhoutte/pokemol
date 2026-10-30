/**
 * What the Bestiole following you picks up on the way. Every 64 steps, when it holds nothing yet, it may find
 * something; the more it loves you, the more often, and the rarer what it finds. It shows a ! until you talk to it.
 */

/** Friendship tiers (0–255): shy, friendly, very close, five hearts. */
export const FIND_TIERS = [0, 120, 200, 230] as const;

/** Chance to find something at each 64-step roll, by tier (about every 1600, 800, 530, 400 steps). */
export const FIND_CHANCE = [0.04, 0.08, 0.12, 0.16];

/** Steps between two rolls. */
export const FIND_EVERY = 64;

const BISCUITS = ['biscuit-pv', 'biscuit-attaque', 'biscuit-defense', 'biscuit-atq-spe', 'biscuit-def-spe', 'biscuit-vitesse'];
const CRAYONS = ['crayon-rouge', 'crayon-bleu', 'crayon-vert', 'crayon-jaune', 'crayon-rose', 'crayon-violet', 'crayon-orange', 'crayon-ciel'];

/** Each tier adds its own finds to those of the tiers below: [item id, weight]. */
const BY_TIER: [string, number][][] = [
  [['baie-bleue', 3], ['baie-cerise', 3], ['baie-menthe', 2], ['potion', 3], ['crayon-ball', 3]],
  [['super-potion', 2], ['retouche', 2], ['super-crayon-ball', 2], ['baie-doree', 1], ['baie-peche', 1], ['spray', 1]],
  [['rappel', 1.5], ...BISCUITS.map((id): [string, number] => [id, 0.4]), ['baie-prisme', 1], ['sirop-attaque', 0.5], ['sirop-special', 0.5]],
  [...CRAYONS.map((id): [string, number] => [id, 0.25]), ['sucette-magique', 0.35]],
];

/** At each tier, how much the finds of each tier below still count: the common ones fade as rarer ones come. */
const FADE = [[1], [0.6, 1], [0.35, 0.8, 1], [0.2, 0.6, 1, 1]];

/**
 * Every item the follower can bring, in a fixed order: the save keeps the one it holds as its index + 1
 * (`flags.followerHas`), so a new find goes at the very end of the last tier.
 */
export const FOLLOWER_FINDS: string[] = BY_TIER.flat().map(([id]) => id);

/** A find from the two upper tiers: brought with a little more pride. */
export function rareFind(id: string): boolean {
  return BY_TIER.slice(2).some((finds) => finds.some(([f]) => f === id));
}

export function findTier(friendship: number): number {
  let t = 0;
  for (let i = 0; i < FIND_TIERS.length; i++) if (friendship >= FIND_TIERS[i]) t = i;
  return t;
}

/** The finds within reach at this friendship, with their weights. */
export function findPool(friendship: number): [string, number][] {
  const t = findTier(friendship);
  return BY_TIER.slice(0, t + 1).flatMap((finds, k) => finds.map(([id, w]): [string, number] => [id, w * FADE[t][k]]));
}

/** One roll of the walk: the item found (or null). `r1` decides whether, `r2` what (both in [0, 1)). */
export function rollFind(friendship: number, r1: number, r2: number): string | null {
  if (r1 >= FIND_CHANCE[findTier(friendship)]) return null;
  const pool = findPool(friendship);
  let x = r2 * pool.reduce((n, [, w]) => n + w, 0);
  for (const [id, w] of pool) if ((x -= w) < 0) return id;
  return pool[pool.length - 1][0];
}

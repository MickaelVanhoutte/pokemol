/**
 * Whether a step wakes a wild Bestiole, decided as FireRed does. A map's `rate` (21 on a route, 14 in a wood, 7 in
 * a cave, 2 on water) gives a chance of rate/100 a step; every battle is followed by a few calm steps; each step
 * without a Bestiole makes the next one a little likelier; and the first step onto other ground (from the path
 * into the grass) wakes nothing 4 times in 10.
 */

/** What carries over from one step to the next (not saved: a reload starts calm). */
export interface WildOdds {
  /** Steps on wild ground since the last battle. */
  steps: number;
  /** Grows with every roll that fails, until the next battle. */
  buff: number;
  /** The ground of the last step: a tile id, `water`, or '' off wild ground. */
  ground: string;
}

export const wildOdds = (): WildOdds => ({ steps: 0, buff: 0, ground: '' });

/** The calm after a battle: 6 steps on a route, 7 in a wood, 8 in a cave or on water. */
export const calmSteps = (rate: number) => (rate >= 80 ? 0 : rate < 10 ? 8 : 8 - Math.floor(rate / 10));

/** Every battle, wild or not, starts the calm again. */
export function calm(o: WildOdds) {
  o.steps = 0;
  o.buff = 0;
}

/** A failed roll (or a Bestiole the spray keeps away) makes the next likelier, unless a spray is on. */
export function missed(o: WildOdds, rate: number, repel = false) {
  o.buff = repel ? 0 : o.buff + rate;
}

/** The chance out of 1600 that a roll wakes one. */
const odds = (rate: number, buff: number, bike = false) => {
  const base = rate * 16;
  return Math.min(1600, (bike ? Math.floor((base * 80) / 100) : base) + Math.floor((buff * 16) / 200));
};

/**
 * One step, `ground` being '' off wild ground. True when a Bestiole comes out: the caller picks it, and calls
 * `missed` if the spray keeps it away.
 */
export function wildStep(o: WildOdds, rate: number, ground: string, opts: { bike?: boolean; repel?: boolean } = {}, rnd: () => number = Math.random): boolean {
  const before = o.ground;
  o.ground = ground;
  if (!ground) return false;
  // during the calm only 1 step in 20 gets a roll
  if (o.steps < calmSteps(rate)) {
    o.steps++;
    if (rnd() * 100 >= 5) return false;
  }
  if (before !== ground && rnd() * 100 >= 60) return false;
  if (Math.floor(rnd() * 1600) < odds(rate, o.buff, opts.bike)) return true;
  missed(o, rate, opts.repel);
  return false;
}

/** Steps between two wild battles on average, walking on the same ground all the way (for the level curve). */
export function meanSteps(rate: number): number {
  const calmN = calmSteps(rate);
  // the chance of each number of failed rolls so far, among the walks that met nothing yet
  let fails = [1];
  let mean = 0;
  for (let t = 1, left = 1; left > 1e-9 && t < 5000; t++) {
    const rolls = t <= calmN ? 0.05 : 1;
    const next = new Array<number>(fails.length + 1).fill(0);
    fails.forEach((p, j) => {
      if (!p) return;
      const hit = odds(rate, j * rate) / 1600;
      mean += t * p * rolls * hit;
      left -= p * rolls * hit;
      next[j] += p * (1 - rolls);
      next[j + 1] += p * rolls * (1 - hit);
    });
    fails = next;
  }
  return mean;
}

import { describe, expect, it } from 'vitest';
import { FIND_CHANCE, FOLLOWER_FINDS, findPool, findTier, rollFind } from './followerFinds';
import { ITEMS } from './items';

const share = (f: number, test: (id: string) => boolean) => {
  const pool = findPool(f);
  return pool.filter(([id]) => test(id)).reduce((n, [, w]) => n + w, 0) / pool.reduce((n, [, w]) => n + w, 0);
};

describe('follower finds', () => {
  it('only brings real items, each listed once', () => {
    for (const id of FOLLOWER_FINDS) expect(ITEMS.some((it) => it.id === id), id).toBe(true);
    expect(new Set(FOLLOWER_FINDS).size).toBe(FOLLOWER_FINDS.length);
  });

  it('finds more often as friendship grows', () => {
    expect([70, 150, 210, 240].map(findTier)).toEqual([0, 1, 2, 3]);
    for (let i = 1; i < FIND_CHANCE.length; i++) expect(FIND_CHANCE[i]).toBeGreaterThan(FIND_CHANCE[i - 1]);
    expect(rollFind(70, 0.05, 0)).toBeNull();
    expect(rollFind(240, 0.05, 0)).not.toBeNull();
  });

  it('keeps the rare finds for great friends', () => {
    const shy = findPool(70).map(([id]) => id);
    const best = findPool(255).map(([id]) => id);
    expect(shy).not.toContain('sucette-magique');
    expect(shy).not.toContain('rappel');
    expect(best).toContain('sucette-magique');
    expect(best.some((id) => id.startsWith('biscuit-'))).toBe(true);
    expect(best.some((id) => id.startsWith('crayon-') && id !== 'crayon-ball')).toBe(true);
    // the everyday finds give way to rarer ones
    const common = (id: string) => ['baie-bleue', 'baie-cerise', 'baie-menthe', 'potion', 'crayon-ball'].includes(id);
    expect(share(255, common)).toBeLessThan(share(150, common) / 2);
    // a Magic Lollipop stays a rare surprise, even at five hearts
    const n = 20000;
    let lollipops = 0;
    for (let i = 0; i < n; i++) if (rollFind(255, 0, i / n) === 'sucette-magique') lollipops++;
    expect(lollipops / n).toBeLessThan(0.03);
  });
});

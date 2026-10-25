import { describe, expect, it } from 'vitest';
import { PITY, pull } from './gacha';
import { generateMap } from './dungeon/run';
import { addXp, MAX_LEVEL } from './progression';

describe('gacha', () => {
  it('guarantees the top rarity at pity', () => {
    const st = { rng: 1 };
    let pity = 0;
    let sawHolo = false;
    for (let i = 0; i < PITY.creature; i++) {
      const r = pull(st, 'creature', 1, pity);
      pity = r.pity;
      if (r.cards[0].rarity === 'holo') sawHolo = true;
    }
    expect(sawHolo).toBe(true);
  });

  it('gives at least one rare in a 10-pull', () => {
    for (let seed = 1; seed < 200; seed++) {
      const r = pull({ rng: seed }, 'creature', 10, 0);
      expect(r.cards.some((c) => c.rarity === 'rare' || c.rarity === 'holo')).toBe(true);
      const s = pull({ rng: seed }, 'support', 10, 0);
      expect(s.cards.some((c) => c.rarity === 'rare')).toBe(true);
    }
  });

  it('roughly follows the rates', () => {
    const st = { rng: 7 };
    const counts: Record<string, number> = {};
    let pity = 0;
    for (let i = 0; i < 5000; i++) {
      const r = pull(st, 'creature', 1, pity);
      pity = r.pity;
      counts[r.cards[0].rarity] = (counts[r.cards[0].rarity] ?? 0) + 1;
    }
    expect(counts.common / 5000).toBeGreaterThan(0.45);
    expect(counts.holo / 5000).toBeLessThan(0.08);
  });
});

describe('dungeon map', () => {
  it('always connects every node to the boss', () => {
    for (let seed = 1; seed < 300; seed++) {
      const m = generateMap(seed, 7);
      const boss = m.nodes.find((n) => n.kind === 'boss')!;
      const reach = new Set<number>();
      const stack = m.nodes.filter((n) => n.row === 0).map((n) => n.id);
      while (stack.length) {
        const id = stack.pop()!;
        if (reach.has(id)) continue;
        reach.add(id);
        stack.push(...m.nodes[id].next);
      }
      expect(reach.has(boss.id)).toBe(true);
      expect(reach.size).toBe(m.nodes.length);
      for (const n of m.nodes) if (n.kind !== 'boss') expect(n.next.length).toBeGreaterThan(0);
    }
  });
});

describe('progression', () => {
  it('levels up and caps', () => {
    expect(addXp({ level: 1, xp: 0 }, 35).level).toBe(2);
    expect(addXp({ level: 1, xp: 0 }, 99999).level).toBe(MAX_LEVEL);
  });
});

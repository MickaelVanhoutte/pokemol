import { describe, expect, it } from 'vitest';
import { GUIDES } from './guides';
import { ITEMS } from './items';
import { MAPS } from './maps';

describe('Colour Guides', () => {
  it('are the seven colours of the rainbow, one tool each', () => {
    expect(GUIDES.map((g) => g.id)).toEqual(['rouge', 'orange', 'jaune', 'vert', 'bleu', 'indigo', 'violet']);
    expect(new Set(GUIDES.map((g) => g.tool)).size).toBe(7);
    for (const g of GUIDES) expect(ITEMS.find((it) => it.id === g.tool)?.kind, g.tool).toBe('key');
  });

  it('each waits on its own map, on a free tile', () => {
    for (const g of GUIDES) {
      const map = MAPS[g.map];
      expect(map, g.map).toBeDefined();
      const npc = map.npcs?.find((n) => n.id === `guide-${g.id}`);
      expect(npc, `${g.id} on ${g.map}`).toBeDefined();
      expect(npc!.showIf).toBe(`gift:${g.tool}`);
      expect(map.npcs!.filter((n) => n.x === g.home.x && n.y === g.home.y), `${g.id}'s tile`).toHaveLength(1);
    }
  });

  it('leaves no other fishing rod in the game', () => {
    expect(ITEMS.some((it) => it.id === 'bonne-canne' || it.id === 'super-canne')).toBe(false);
  });
});

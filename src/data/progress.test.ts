import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOKS } from './appearance';
import { BADGES } from './badges';
import { CREATURES } from './creatures';
import { ITEMS, ITEM_BY_ID } from './items';
import { MAPS } from './maps';
import { DEX_GOAL, TRACKS, collect, prizeFlag, trackState, tracksFor, waiting } from './progress';
import { TOWER_STOCK } from './postgame';
import { STOCK } from '../ui/screens/ShopScreen';
import { addItem, newGame } from '../state/game';

const rewards = TRACKS.flatMap((t) => t.steps.flatMap((m) => m.reward.map((r) => r.item)));
const start = () => newGame('Lou', DEFAULT_LOOKS.f, 'f', 'Feutre');

describe('Progress tracks', () => {
  it('give real items, with goals that grow along each track', () => {
    for (const t of TRACKS) {
      const ids = t.steps.map((m) => m.id);
      expect(new Set(ids).size, t.id).toBe(ids.length);
      for (let i = 1; i < t.steps.length; i++) expect(t.steps[i].goal, `${t.id} ${ids[i]}`).toBeGreaterThan(t.steps[i - 1].goal);
      for (const m of t.steps) {
        expect(m.reward.length, `${t.id} ${m.id}`).toBeGreaterThan(0);
        for (const r of m.reward) {
          expect(ITEM_BY_ID[r.item], r.item).toBeDefined();
          expect(r.n).toBeGreaterThan(0);
        }
      }
    }
  });

  it('can all be reached', () => {
    const placed = new Set(Object.values(MAPS).flatMap((m) => (m.npcs ?? []).map((n) => n.trainer).filter(Boolean)));
    const last = (id: string) => TRACKS.find((t) => t.id === id)!.steps.at(-1)!.goal;
    expect(last('dresseurs')).toBeLessThanOrEqual(placed.size - 20);
    expect(last('dex')).toBe(DEX_GOAL);
    expect(DEX_GOAL).toBe(CREATURES.length);
    expect(last('aventure')).toBe(BADGES.length + 1);
    expect(last('revanches')).toBe(BADGES.length);
  });

  it('are where held items come from now that no shop sells them', () => {
    for (const it of ITEMS.filter((i) => i.kind === 'hold')) expect(STOCK[it.id], it.id).toBeUndefined();
    const once = ['plume-vive', 'loupe', 'couronne-carton', 'clochette', 'ruban-tenace', 'casque-pointes', 'bandeau-tetu', 'lunettes-tetues',
      'echarpe-tetue', 'bille-ardente', 'tablier-peintre', 'crayon-ciel', 'crayon-marron', 'crayon-ocre', 'crayon-lilas'];
    for (const id of once) expect(rewards, id).toContain(id);
    // and the tower exchanges every one of the old shop items for more copies
    for (const id of once.slice(0, 11)) expect(TOWER_STOCK[id], id).toBeGreaterThan(0);
  });

  it('hand out the four last stencils', () => {
    for (const n of [21, 22, 23, 24]) expect(rewards).toContain(`pochoir-${n}`);
  });
});

describe('collecting a reward', () => {
  it('needs the milestone, gives its items once, then moves to the next one', () => {
    const d = start();
    const dex = TRACKS.find((t) => t.id === 'dex')!;
    expect(collect(d, 'dex', addItem)).toBeNull();
    d.dex.caught = CREATURES.slice(0, 12).map((c) => c.id);
    expect(waiting(d)).toBe(2);
    const balls = d.bag['crayon-ball'] ?? 0;
    expect(collect(d, 'dex', addItem)?.goal).toBe(5);
    expect(d.bag['crayon-ball']).toBe(balls + 5);
    expect(d.flags[prizeFlag('dex', '5')]).toBe(1);
    expect(trackState(d, dex)).toMatchObject({ count: 12, ready: true, done: 1 });
    expect(collect(d, 'dex', addItem)?.goal).toBe(10);
    expect(collect(d, 'dex', addItem)).toBeNull();
    expect(trackState(d, dex)).toMatchObject({ ready: false, done: 2, next: { goal: 20 } });
    expect(waiting(d)).toBe(0);
  });

  it('counts the end of the story after the eight badges', () => {
    const d = start();
    d.badges = BADGES.map((b) => b.id);
    const adv = TRACKS.find((t) => t.id === 'aventure')!;
    expect(adv.count(d)).toBe(8);
    d.flags.ending = 1;
    expect(adv.count(d)).toBe(9);
    // an old save catches up: every milestone it passed waits on the card
    expect(waiting(d)).toBe(9);
    for (let i = 0; i < 9; i++) collect(d, 'aventure', addItem);
    expect(d.bag['pochoir-22']).toBe(1);
    expect(trackState(d, adv).next).toBeNull();
  });

  it('keeps the post-game tracks for after the story', () => {
    const d = start();
    d.hallOfFame = [{} as never];
    expect(tracksFor(d).some((t) => t.post)).toBe(false);
    expect(waiting(d)).toBe(0);
    expect(collect(d, 'concours', addItem)).toBeNull();
    d.flags.ending = 1;
    expect(tracksFor(d)).toHaveLength(TRACKS.length);
    expect(collect(d, 'concours', addItem)?.reward[0].item).toBe('pochoir-24');
  });
});

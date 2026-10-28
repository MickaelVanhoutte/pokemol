import { describe, expect, it } from 'vitest';
import { createMon } from '../../engine/pk/creature';
import { move } from '../../data/moves';
import { weakSpotSlots } from './weakSpots';

const knowing = (species: string, ids: string[]) => {
  const m = createMon(species, 20, { rng: 1 });
  m.moves = ids.map((id) => ({ id, pp: move(id).pp }));
  return m;
};

describe('weak spots marked on the moves', () => {
  // Braisou (fire): Flammèche hits a plant, Lueur Brûlante is a status move, Griffe is neutral
  const me = knowing('002', ['griffe', 'flammeche', 'lueur-brulante', 'bulles']);
  const foe = createMon('001', 20, { rng: 2 });

  it('marks the super-effective attacking moves against a foe met before', () => {
    expect(weakSpotSlots(me, foe, ['001'], 'normal')).toEqual([1]);
    expect(weakSpotSlots(me, foe, ['001'], 'easy')).toEqual([1]);
  });

  it('marks nothing for a foe never met, or on Hard', () => {
    expect(weakSpotSlots(me, foe, [], 'normal')).toEqual([]);
    expect(weakSpotSlots(me, foe, ['003'], 'easy')).toEqual([]);
    expect(weakSpotSlots(me, foe, ['001'], 'hard')).toEqual([]);
  });

  it('follows the foe: fire does little to water, water hits fire', () => {
    expect(weakSpotSlots(me, createMon('003', 20, { rng: 3 }), ['003'], 'normal')).toEqual([]);
    expect(weakSpotSlots(knowing('003', ['bulles']), createMon('002', 20, { rng: 4 }), ['002'], 'normal')).toEqual([0]);
  });
});

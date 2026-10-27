import { describe, expect, it } from 'vitest';
import { act, createBattle, type BattleEvent, type Step } from '../../../engine/pk/battle';
import { createMon, type Mon } from '../../../engine/pk/creature';
import { moveOutcome } from './outcome';

const L = (s: string) => ({ fr: s, en: s });
const mon = (species: string, level: number, moves: string[]): Mon => {
  const m = createMon(species, level, { rng: 5 }, { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 });
  m.talent = 0;
  m.nature = 'joyeuse';
  m.moves = moves.map((id) => ({ id, pp: 20 }));
  return m;
};
const turn = (me: Mon, foe: Mon, seed = 11): Step => {
  const st = createBattle({ kind: 'trainer', seed, player: { name: L('a'), party: [me], isAI: false }, enemy: { name: L('b'), party: [foe], isAI: true } }).state;
  return act(st, { type: 'move', slot: 0 }, { type: 'move', slot: 0 });
};
const mine = (events: BattleEvent[]) => moveOutcome(events, events.findIndex((e) => e.t === 'move' && e.side === 0));

describe('move outcome (when the animation plays)', () => {
  it('lands a plain hit', () => {
    const o = mine(turn(mon('002', 20, ['flammeche']), mon('013', 20, ['grondement'])).events);
    expect(o).toMatchObject({ lands: true, hits: 1, charge: false });
  });

  it('counts the hits of a multi-hit move', () => {
    const o = mine(turn(mon('029', 30, ['rafale-de-poings']), mon('008', 40, ['grondement'])).events);
    expect(o.lands).toBe(true);
    expect(o.hits).toBeGreaterThanOrEqual(2);
  });

  it('shows nothing against a protected target', () => {
    const o = mine(turn(mon('002', 20, ['flammeche']), mon('013', 20, ['bouclier-papier'])).events);
    expect(o.lands).toBe(false);
  });

  it('shows nothing against an immune target', () => {
    const o = mine(turn(mon('019', 20, ['petite-etincelle']), mon('031', 20, ['grondement'])).events);
    expect(o.lands).toBe(false);
  });

  it('spots the first turn of a two-turn move', () => {
    const o = mine(turn(mon('031', 20, ['galerie']), mon('013', 20, ['grondement'])).events);
    expect(o).toMatchObject({ charge: true, lands: false });
  });

  it('misses a target that went underground', () => {
    // the foe is much faster: it digs before the player's move
    const o = mine(turn(mon('002', 10, ['flammeche']), mon('041', 60, ['galerie'])).events);
    expect(o.lands).toBe(false);
  });

  it('lands a status move, and not one that fails', () => {
    expect(mine(turn(mon('004', 20, ['frisson']), mon('013', 20, ['grondement'])).events).lands).toBe(true);
    const foe = mon('013', 20, ['grondement']);
    foe.status = 'paralyze';
    expect(mine(turn(mon('004', 20, ['frisson']), foe).events).lands).toBe(false);
  });
});

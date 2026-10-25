import { describe, expect, it } from 'vitest';
import { CREATURES } from '../../data/creatures';
import { SUPPORT_CARDS } from '../../data/supportCards';
import { L } from '../../i18n';
import { aiStep } from './ai';
import { activeOf, applyAction, captureChance, createBattle, HAND_MAX, IllegalAction, START_HAND } from './engine';
import type { Action, BattleSetup, BattleState, TeamMember } from './types';

function setup(player: TeamMember[], enemy: TeamMember[], opts: Partial<BattleSetup> = {}, decks: [string[], string[]] = [[], []]): BattleSetup {
  return {
    kind: 'trainer',
    seed: 42,
    player: { name: L('Moi', 'Me'), team: player, deck: decks[0], isAI: false },
    enemy: { name: L('Eux', 'Them'), team: enemy, deck: decks[1], isAI: true },
    ...opts,
  };
}

function act(st: BattleState, ...actions: Action[]) {
  for (const a of actions) st = applyAction(st, a).state;
  return st;
}

/** Forces the side whose turn it is to have `n` energy on its active, bypassing the once-per-turn rule. */
function giveEnergy(st: BattleState, side: 0 | 1, n: number): BattleState {
  const next = structuredClone(st);
  activeOf(next.sides[side]).energy = n;
  return next;
}

describe('setup', () => {
  it('starts with the player holding the card of the turn', () => {
    const deck = Array(10).fill('potion');
    const { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '002', level: 1 }], {}, [deck, deck]));
    expect(state.turn).toBe(0);
    expect(state.sides[0].hand).toHaveLength(START_HAND + 1);
    expect(state.sides[1].hand).toHaveLength(START_HAND);
    expect(activeOf(state.sides[0]).maxHp).toBe(60);
  });

  it('levels add HP and damage', () => {
    const { state } = createBattle(setup([{ defId: '009', level: 7 }], [{ defId: '002', level: 1 }]));
    const f = activeOf(state.sides[0]);
    expect(f.maxHp).toBe(50 + 6 * 5);
    expect(f.dmgBonus).toBe(20);
  });
});

describe('energy and attacks', () => {
  it('allows one energy per turn', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '002', level: 1 }]));
    state = act(state, { type: 'attachEnergy', fighter: 0 });
    expect(() => applyAction(state, { type: 'attachEnergy', fighter: 0 })).toThrow(IllegalAction);
  });

  it('needs enough energy to attack', () => {
    const { state } = createBattle(setup([{ defId: '002', level: 1 }], [{ defId: '001', level: 1 }]));
    expect(() => applyAction(state, { type: 'attack', attack: 0 })).toThrow(IllegalAction);
  });

  it('applies weakness ×2', () => {
    let { state } = createBattle(setup([{ defId: '002', level: 1 }], [{ defId: '001', level: 1 }]));
    state = act(state, { type: 'attachEnergy', fighter: 0 }, { type: 'attack', attack: 0 });
    expect(activeOf(state.sides[1]).hp).toBe(60 - 40);
    expect(state.turn).toBe(1);
  });

  it('applies resistance −20', () => {
    let { state } = createBattle(setup([{ defId: '003', level: 1 }], [{ defId: '001', level: 1 }]));
    state = giveEnergy(state, 0, 2);
    const r = applyAction(state, { type: 'attack', attack: 1 }); // Carapace-tambour 20 vs resist eau
    expect(activeOf(r.state.sides[1]).hp).toBe(60);
  });

  it('protect reduces the next hit', () => {
    let { state } = createBattle(setup([{ defId: '003', level: 1 }], [{ defId: '002', level: 1 }]));
    state = giveEnergy(state, 0, 2);
    state = act(state, { type: 'attack', attack: 1 }); // Clapotin protects 20
    state = giveEnergy(state, 1, 1);
    state = act(state, { type: 'attack', attack: 0 }); // Braisou Flammèche 20 vs water, protected
    expect(activeOf(state.sides[0]).hp).toBe(60);
  });

  it('knocks out and wins', () => {
    let { state } = createBattle(setup([{ defId: '011', level: 1 }], [{ defId: '006', level: 1 }], { kind: 'wild' }));
    state = giveEnergy(state, 0, 3);
    const r = applyAction(state, { type: 'attack', attack: 1 }); // 60 vs 50 HP
    expect(r.state.result).toBe('win');
    expect(r.events.some((e) => e.t === 'ko')).toBe(true);
  });

  it('asks the player to pick a new active after a KO', () => {
    let { state } = createBattle(setup([{ defId: '006', level: 1 }, { defId: '001', level: 1 }], [{ defId: '011', level: 1 }]));
    state = act(state, { type: 'endTurn' });
    state = giveEnergy(state, 1, 3);
    state = act(state, { type: 'attack', attack: 1 });
    expect(state.sides[0].mustChooseActive).toBe(true);
    expect(() => applyAction(state, { type: 'endTurn' })).toThrow(IllegalAction);
    state = act(state, { type: 'chooseActive', fighter: 1 });
    expect(state.sides[0].active).toBe(1);
    expect(state.turn).toBe(0);
  });
});

describe('statuses and effects', () => {
  it('sleep prevents attacking', () => {
    let { state } = createBattle(setup([{ defId: '005', level: 1 }], [{ defId: '002', level: 1 }]));
    state = giveEnergy(state, 0, 2);
    state = act(state, { type: 'attack', attack: 1 }); // Berceuse
    // Braisou might wake on the start-of-turn flip; if it is still asleep it cannot attack
    const foe = activeOf(state.sides[1]);
    if (foe.status.includes('sleep')) {
      const s2 = giveEnergy(state, 1, 3);
      expect(() => applyAction(s2, { type: 'attack', attack: 0 })).toThrow(IllegalAction);
    }
  });

  it('Bouh ! makes the defender drop a card', () => {
    const deck = Array(10).fill('potion');
    let { state } = createBattle(setup([{ defId: '009', level: 1 }], [{ defId: '002', level: 1 }], {}, [deck, deck]));
    // both sides pass once so the opponent keeps an unused card
    state = act(state, { type: 'endTurn' }, { type: 'endTurn' });
    expect(state.sides[1].hand).toHaveLength(1);
    state = giveEnergy(state, 0, 1);
    const r = applyAction(state, { type: 'attack', attack: 0 });
    expect(r.events.some((e) => e.t === 'discard' && e.side === 1)).toBe(true);
    // the opponent then draws its card of the turn
    expect(r.state.sides[1].hand).toHaveLength(1);
  });

  it('lucky coin forces the favorable side', () => {
    let { state } = createBattle(setup([{ defId: '004', level: 1 }], [{ defId: '008', level: 1 }], {}, [['piece', 'piece', 'piece', 'piece', 'piece'], []]));
    state = act(state, { type: 'playCard', hand: 0 });
    state = giveEnergy(state, 0, 1);
    const r = applyAction(state, { type: 'attack', attack: 0 }); // Zap-zap: 2 flips, first is lucky heads
    const coins = r.events.filter((e) => e.t === 'coin');
    expect(coins[0]).toMatchObject({ heads: true, lucky: true });
  });

  it('only one trainer card per turn', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '002', level: 1 }], {}, [Array(10).fill('professeur'), []]));
    state = act(state, { type: 'playCard', hand: 0 });
    expect(() => applyAction(state, { type: 'playCard', hand: 0 })).toThrow(IllegalAction);
  });

  it('potion heals the chosen creature', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1, hp: 20 }], [{ defId: '002', level: 1 }], {}, [Array(10).fill('potion'), []]));
    state = act(state, { type: 'playCard', hand: 0, target: 0 });
    expect(activeOf(state.sides[0]).hp).toBe(50);
  });

  it('retreat pays energy', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1 }, { defId: '003', level: 1 }], [{ defId: '002', level: 1 }]));
    state = act(state, { type: 'attachEnergy', fighter: 0 }, { type: 'retreat', to: 1 });
    expect(state.sides[0].active).toBe(1);
    expect(state.sides[0].fighters[0].energy).toBe(0);
  });
});

describe('card of the turn', () => {
  const deck = ['potion', 'pile', 'gomme', 'crayon', 'bouclier', 'echange', 'potion', 'pile', 'gomme', 'crayon'];

  it('keeps unused cards but never holds more than HAND_MAX', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '002', level: 1 }], {}, [deck, deck]));
    for (let i = 0; i < 6; i++) state = act(state, { type: 'endTurn' });
    expect(state.sides[0].hand).toHaveLength(HAND_MAX);
    expect(state.sides[1].hand).toHaveLength(HAND_MAX);
    expect(state.sides[0].deck).toHaveLength(deck.length - HAND_MAX);
  });

  it('swapping a card costs the turn energy', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '002', level: 1 }], {}, [deck, deck]));
    const first = state.sides[0].hand[0];
    const r = applyAction(state, { type: 'swapCard', hand: 0 });
    expect(r.state.sides[0].hand).toHaveLength(1);
    expect(r.state.sides[0].discard).toContain(first);
    expect(r.state.sides[0].energyAttached).toBe(true);
    expect(() => applyAction(r.state, { type: 'attachEnergy', fighter: 0 })).toThrow(IllegalAction);
    expect(() => applyAction(r.state, { type: 'swapCard', hand: 0 })).toThrow(IllegalAction);
  });

  it('cannot swap after attaching energy', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '002', level: 1 }], {}, [deck, deck]));
    state = act(state, { type: 'attachEnergy', fighter: 0 });
    expect(() => applyAction(state, { type: 'swapCard', hand: 0 })).toThrow(IllegalAction);
  });

  it('Prof. Fusain+ gives the turn energy back', () => {
    let { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '002', level: 1 }], {}, [Array(10).fill('professeur+'), deck]));
    state = act(state, { type: 'attachEnergy', fighter: 0 }, { type: 'playCard', hand: 0 });
    expect(state.sides[0].energyAttached).toBe(false);
    expect(state.sides[0].hand).toHaveLength(HAND_MAX);
    state = act(state, { type: 'attachEnergy', fighter: 0 });
    expect(activeOf(state.sides[0]).energy).toBe(2);
  });
});

describe('capture', () => {
  it('is more likely when the wild creature is hurt', () => {
    const full = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '004', level: 1 }], { kind: 'wild' })).state;
    const hurt = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '004', level: 1, hp: 10 }], { kind: 'wild' })).state;
    expect(captureChance(hurt)).toBeGreaterThan(captureChance(full));
    expect(captureChance(full)).toBeGreaterThan(0);
    expect(captureChance(hurt)).toBeLessThanOrEqual(0.95);
  });

  it('is only allowed in wild battles', () => {
    const { state } = createBattle(setup([{ defId: '001', level: 1 }], [{ defId: '004', level: 1 }]));
    expect(() => applyAction(state, { type: 'capture' })).toThrow(IllegalAction);
  });
});

describe('AI', () => {
  it('plays full battles to the end with only legal moves', () => {
    const ids = CREATURES.map((c) => c.id);
    const supports = SUPPORT_CARDS.map((s) => s.id);
    for (let seed = 1; seed <= 150; seed++) {
      const pick = (n: number, k: number) => Array.from({ length: n }, (_, i) => ids[(seed * 7 + i * 3 + k) % ids.length]);
      const deck = (k: number) => Array.from({ length: 12 }, (_, i) => supports[(seed * 5 + i * 7 + k) % supports.length]);
      let { state } = createBattle({
        kind: seed % 5 === 0 ? 'wild' : 'trainer',
        seed,
        player: { name: L('A', 'A'), team: pick(1 + (seed % 4), 0).map((defId) => ({ defId, level: 1 + (seed % 10) })), deck: deck(0), isAI: false },
        enemy: { name: L('B', 'B'), team: pick(seed % 5 === 0 ? 1 : 1 + ((seed + 1) % 4), 5).map((defId) => ({ defId, level: 1 + ((seed + 3) % 10) })), deck: deck(3), isAI: true },
      });
      let steps = 0;
      while (!state.result && steps < 600) {
        const action: Action = state.sides[0].mustChooseActive
          ? { type: 'chooseActive', fighter: state.sides[0].fighters.findIndex((f) => !f.ko) }
          : aiStep(state);
        state = applyAction(state, action).state;
        steps++;
      }
      expect(state.result, `seed ${seed}`).not.toBeNull();
    }
  });
});

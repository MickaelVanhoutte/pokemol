import { describe, expect, it } from 'vitest';
import { ACTIVITIES, REAL_MAX, catchBoost, glowingSpots, moneyBoost, pips, realLevel, shinyChance, wakesAtHome, xpBoost } from './realLife';
import { act, createBattle, type BattleState } from '../engine/pk/battle';
import { SHINY_CHANCE, createMon } from '../engine/pk/creature';
import { L } from '../i18n';

const flags = (lv: number) => Object.fromEntries(ACTIVITIES.map((a) => [`reel:${a.id}`, lv]));

describe('days in the real house', () => {
  it('grow four gentle bonuses, five levels each', () => {
    expect(ACTIVITIES.map((a) => a.id)).toEqual(['dessin', 'fenetre', 'livre', 'parents']);
    expect(catchBoost({})).toBe(1);
    expect(catchBoost(flags(5))).toBeCloseTo(1.15);
    expect(shinyChance({})).toBe(SHINY_CHANCE);
    expect(shinyChance(flags(5))).toBeCloseTo(0.03);
    expect(xpBoost(flags(5))).toBeCloseTo(1.2);
    expect(moneyBoost(flags(5))).toBeCloseTo(1.25);
    // capped, and shown as five dots
    expect(realLevel({ 'reel:livre': 9 }, 'livre')).toBe(REAL_MAX);
    expect(pips(2)).toBe('●●○○○');
    for (const a of ACTIVITIES) expect(a.amount(0) < a.amount(REAL_MAX), a.id).toBe(true);
  });

  it('wake the player at home once a real day, after the ending, while something can still grow', () => {
    const after = { ending: 1 };
    expect(wakesAtHome({}, 100)).toBe(false);
    // games that ended before `reveil:dodo` existed wake up at home too
    expect(wakesAtHome(after, 100)).toBe(true);
    expect(wakesAtHome({ ...after, 'reel:jour': 100 }, 100)).toBe(false);
    expect(wakesAtHome({ ...after, 'reel:jour': 100 }, 101)).toBe(true);
    expect(wakesAtHome({ ...after, ...flags(5) }, 101)).toBe(false);
  });
});

describe('the bonuses in battle', () => {
  const side = (party: ReturnType<typeof createMon>[], isAI: boolean) => ({ name: L('x', 'x'), party, isAI });

  it('drawing practice catches more', () => {
    const throws = (boost: number) => {
      let caught = 0;
      for (let seed = 1; seed <= 400; seed++) {
        const st = createBattle({ kind: 'wild', seed, player: side([createMon('002', 30, { rng: 1 })], false), enemy: side([createMon('064', 30, { rng: 2 })], true), boosts: { catch: boost } }).state;
        if (act(st, { type: 'ball', item: 'crayon-ball' }, { type: 'move', slot: 0 }).state.result === 'capture') caught++;
      }
      return caught;
    };
    expect(throws(1.15)).toBeGreaterThan(throws(1));
  });

  it('reading gives more experience', () => {
    const xp = (boost: number) => {
      const st: BattleState = createBattle({ kind: 'wild', seed: 3, player: side([createMon('002', 40, { rng: 1 })], false), enemy: side([{ ...createMon('013', 20, { rng: 2 }), hp: 1 }], true), boosts: { xp: boost } }).state;
      const me = st.sides[0].party[0];
      return act(st, { type: 'move', slot: 0 }, { type: 'move', slot: 0 }).state.sides[0].party[0].xp - me.xp;
    };
    expect(xp(1.2)).toBeGreaterThan(xp(1));
    expect(xp(1.2) / xp(1)).toBeCloseTo(1.2, 1);
  });
});

describe('the spots of the house', () => {
  const room = { interact: [{ x: 7, y: 1, script: 'desk' }, { x: 2, y: 0, script: 'fenetre' }, { x: 1, y: 3, script: 'litReel' }], npcs: [{ x: 4, y: 3, script: 'mamanReelle' }, { x: 6, y: 3, script: 'chat' }] };

  it('glow during a day there until the day’s thing is done, where a level can still grow', () => {
    expect(glowingSpots(room, {})).toEqual([]);
    expect(glowingSpots(room, { 'reel:visite': 1 })).toEqual([{ x: 7, y: 1 }, { x: 2, y: 0 }, { x: 4, y: 3 }]);
    expect(glowingSpots(room, { 'reel:visite': 1, 'reel:fenetre': 5 })).toEqual([{ x: 7, y: 1 }, { x: 4, y: 3 }]);
    expect(glowingSpots(room, { 'reel:visite': 1, 'reel:fait': 1 })).toEqual([]);
  });
});

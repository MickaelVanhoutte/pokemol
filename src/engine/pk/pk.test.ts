import { describe, expect, it } from 'vitest';
import { CREATURES, creature } from '../../data/creatures';
import { MOVES } from '../../data/moves';
import { ITEM_BY_ID } from '../../data/items';
import { TRAINERS, partyOf } from '../../data/trainers';
import { BADGES } from '../../data/badges';
import { TYPES, effectiveness } from '../../data/types';
import { L } from '../../i18n';
import { aiChoose } from './ai';
import { act, activeMon, catchChance, computeDamage, createBattle, effectiveStat, IllegalAction, itemUsable, usableSlots, type Action, type BattleState } from './battle';
import { addXp, calcStat, createMon, evolutionOf, evolve, gainEvs, levelFactor, maxHp, movesAt, statsOf, xpAt, type Mon } from './creature';

const IV0 = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const mon = (species: string, level: number, seed = 1, patch: Partial<Mon> = {}) => ({ ...createMon(species, level, { rng: seed }, IV0), ...patch });

function battle(player: Mon[], enemy: Mon[], kind: 'wild' | 'trainer' = 'trainer', seed = 5) {
  return createBattle({
    kind, seed,
    player: { name: L('Moi', 'Me'), party: player, isAI: false },
    enemy: { name: L('Eux', 'Them'), party: enemy, isAI: true },
  }).state;
}

const slotOf = (m: Mon, id: string) => m.moves.findIndex((s) => s.id === id);

describe('data', () => {
  it('every learnset move exists and every species is complete', () => {
    const ids = new Set(MOVES.map((m) => m.id));
    for (const c of CREATURES) {
      for (const [, mv] of c.learnset) expect(ids.has(mv), `${c.id} ${mv}`).toBe(true);
      expect(c.learnset.some(([l]) => l === 1)).toBe(true);
    }
  });

  it('every held item exists (wild creatures and trainers)', () => {
    for (const c of CREATURES) if (c.wildItem) expect(ITEM_BY_ID[c.wildItem.id], `${c.id} ${c.wildItem.id}`).toBeDefined();
    for (const t of Object.values(TRAINERS)) for (const m of t.party) if (m.item) expect(ITEM_BY_ID[m.item], `${t.id} ${m.item}`).toBeDefined();
    expect(partyOf([{ species: '001', level: 5, item: 'gouter' }], 1)[0].item).toBe('gouter');
  });

  it('stencils teach real moves, and each one fits someone', () => {
    const stencils = Object.values(ITEM_BY_ID).filter((i) => i.kind === 'stencil');
    expect(stencils).toHaveLength(20);
    for (const st of stencils) {
      expect(MOVES.some((m) => m.id === st.move), st.id).toBe(true);
      expect(CREATURES.some((c) => c.stencils.includes(st.id)), `nobody learns ${st.id}`).toBe(true);
    }
    for (const c of CREATURES) for (const id of c.stencils) expect(ITEM_BY_ID[id]?.kind, `${c.id} ${id}`).toBe('stencil');
    for (const b of BADGES) expect(ITEM_BY_ID[b.stencil ?? '']?.kind, b.id).toBe('stencil');
  });

  it('type chart', () => {
    expect(effectiveness('feu', 'plante')).toBe(2);
    expect(effectiveness('eau', 'feu')).toBe(2);
    expect(effectiveness('plante', 'eau')).toBe(2);
    expect(effectiveness('normal', 'spectre')).toBe(0);
    expect(effectiveness('spectre', 'normal')).toBe(0);
    expect(effectiveness('feu', 'eau')).toBe(0.5);
    expect(effectiveness('fee', 'combat')).toBe(2);
  });
});

describe('creatures', () => {
  it('computes Gen 3 stats', () => {
    expect(calcStat('hp', 50, 0, 0, 5)).toBe(20);
    expect(calcStat('atk', 52, 31, 0, 50)).toBe(Math.floor(((104 + 31) * 50) / 100) + 5);
    // 4 effort points = 1 point at level 100
    expect(calcStat('atk', 52, 31, 252, 50)).toBe(Math.floor(((104 + 31 + 63) * 50) / 100) + 5);
    expect(maxHp(mon('001', 5))).toBe(20);
  });

  it('knows the last four level-up moves', () => {
    expect(movesAt('009', 13)).toEqual(['langue-fantome', 'coup-en-douce', 'regard-hypnotique', 'grimace']);
    expect(movesAt('001', 1)).toEqual(['griffe', 'grondement']);
    expect(movesAt('001', 5)).toEqual(['griffe', 'grondement', 'coup-de-liane']);
  });

  it('levels up, learns moves and keeps missing HP', () => {
    const m = mon('001', 7);
    m.hp -= 5;
    const before = maxHp(m) - m.hp;
    const ups = addXp(m, xpAt(8) - m.xp);
    expect(m.level).toBe(8);
    expect(ups[0].learned).toEqual(['graine-gourmande']);
    expect(maxHp(m) - m.hp).toBe(before);
  });

  it('asks before replacing a move when four are known', () => {
    const m = mon('009', 13);
    expect(m.moves).toHaveLength(4);
    const ups = addXp(m, xpAt(18) - m.xp);
    expect(ups.flatMap((u) => u.pending)).toContain('cauchemar');
    expect(m.moves).toHaveLength(4);
  });

  it('gains capped effort points and keeps missing HP', () => {
    const m = mon('001', 50);
    m.hp -= 10;
    gainEvs(m, '005'); // Chantouille gives 2 HP points
    expect(m.evs.hp).toBe(2);
    m.evs.hp = 254;
    gainEvs(m, '005');
    expect(m.evs.hp).toBe(255);
    m.evs = { hp: 255, atk: 255, def: 0, spa: 0, spd: 0, spe: 0 };
    gainEvs(m, '011'); // 3 Sp. Atk points, but the 510 total is reached
    expect(m.evs.spa).toBe(0);
    const fresh = mon('001', 50);
    fresh.hp -= 10;
    const hp = maxHp(fresh);
    for (let i = 0; i < 4; i++) gainEvs(fresh, '005');
    expect(maxHp(fresh)).toBe(hp + 1); // 8 points = +2 at level 100, +1 at level 50
    expect(maxHp(fresh) - fresh.hp).toBe(10);
  });

  it('evolves at the right level', () => {
    const m = mon('009', 16);
    expect(evolutionOf(m)).toBe('010');
    evolve(m, '010');
    expect(m.species).toBe('010');
    expect(evolutionOf(mon('009', 15))).toBeNull();
  });
});

describe('battle', () => {
  it('damage stays within the formula range', () => {
    const st = battle([mon('002', 10)], [mon('001', 10)]);
    const fire = MOVES.find((m) => m.id === 'flammeche')!;
    for (let i = 0; i < 50; i++) {
      const { dmg, eff } = computeDamage({ rng: i }, st.sides[0], st.sides[1], fire, 40, false);
      expect(eff).toBe(2);
      expect(dmg).toBeGreaterThan(0);
      expect(dmg).toBeLessThan(40);
    }
  });

  it('a move hurts the foe and costs PP', () => {
    const me = mon('002', 10);
    const st = battle([me], [mon('001', 10)]);
    const slot = slotOf(me, 'flammeche');
    const r = act(st, { type: 'move', slot }, aiChoose(st));
    expect(activeMon(r.state.sides[1]).hp).toBeLessThan(maxHp(activeMon(r.state.sides[1])));
    expect(activeMon(r.state.sides[0]).moves[slot].pp).toBe(activeMon(st.sides[0]).moves[slot].pp - 1);
  });

  it('normal moves do nothing to ghosts', () => {
    const me = mon('008', 10);
    const st = battle([me], [mon('009', 10)]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'bousculade') }, { type: 'move', slot: 0 });
    expect(r.events.some((e) => e.t === 'noEffect')).toBe(true);
  });

  it('knocking out the last foe wins and gives XP', () => {
    const me = mon('002', 20);
    const foe = mon('001', 3);
    const st = battle([me], [foe]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'flammeche') }, { type: 'move', slot: 0 });
    expect(r.state.result).toBe('win');
    expect(r.events.some((e) => e.t === 'xp')).toBe(true);
    expect(activeMon(r.state.sides[0]).xp).toBeGreaterThan(me.xp);
    expect(activeMon(r.state.sides[0]).evs.spa).toBe(1);
  });

  it('asks for a replacement after a faint', () => {
    const weak = mon('001', 3);
    const st = battle([weak, mon('003', 10)], [mon('002', 25)]);
    const r = act(st, { type: 'move', slot: 0 }, { type: 'move', slot: slotOf(st.sides[1].party[0], 'flammeche') });
    expect(r.state.needSwitch).toBe(true);
    expect(() => act(r.state, { type: 'move', slot: 0 }, { type: 'move', slot: 0 })).toThrow(IllegalAction);
    const r2 = act(r.state, { type: 'replace', to: 1 }, { type: 'move', slot: 0 });
    expect(r2.state.sides[0].active).toBe(1);
  });

  it('wild creatures are easier to catch when weak or asleep', () => {
    const full = mon('004', 5);
    const weak = { ...mon('004', 5), hp: 1 };
    const sleepy = { ...weak, status: 'sleep' as const };
    expect(catchChance(weak, 1).p).toBeGreaterThan(catchChance(full, 1).p);
    expect(catchChance(sleepy, 1).p).toBeGreaterThanOrEqual(catchChance(weak, 1).p);
    expect(catchChance(mon('008', 20), 1).p).toBeLessThan(catchChance(full, 1).p);
  });

  it('cannot run from or catch in trainer battles', () => {
    const st = battle([mon('001', 5)], [mon('002', 5)]);
    const r = act(st, { type: 'run' }, { type: 'move', slot: 0 });
    expect(r.events.some((e) => e.t === 'cantRun')).toBe(true);
    expect(r.state.result).toBeNull();
    const r2 = act(st, { type: 'ball', item: 'crayon-ball' }, { type: 'move', slot: 0 });
    expect(r2.events.some((e) => e.t === 'blocked')).toBe(true);
  });

  it('lets balls go through a vision (the dream legendaries before the ending)', () => {
    const foe = { ...mon('071', 30), hp: 1, status: 'sleep' as const };
    const st = createBattle({
      kind: 'wild', seed: 3, noCatch: true,
      player: { name: L('A', 'A'), party: [mon('001', 30)], isAI: false },
      enemy: { name: L('B', 'B'), party: [foe], isAI: true },
    }).state;
    for (let i = 0; i < 5; i++) {
      const r = act(st, { type: 'ball', item: 'super-crayon-ball' }, { type: 'move', slot: 0 });
      expect(r.events.some((e) => e.t === 'blocked' && e.reflet)).toBe(true);
      expect(r.state.result).not.toBe('capture');
    }
  });

  it('uses Struggle only when no PP is left', () => {
    const me = mon('001', 5);
    me.moves.forEach((s) => (s.pp = 0));
    const st = battle([me], [mon('002', 5)]);
    expect(() => act(battle([mon('001', 5)], [mon('002', 5)]), { type: 'move', slot: -1 }, { type: 'move', slot: 0 })).toThrow(IllegalAction);
    const r = act(st, { type: 'move', slot: -1 }, { type: 'move', slot: 0 });
    expect(r.events.some((e) => e.t === 'move' && e.side === 0 && e.move === 'lutte')).toBe(true);
  });

  it('potions heal the chosen creature and use the turn', () => {
    const me = mon('001', 10);
    me.hp = 5;
    const st = battle([me], [mon('002', 5)]);
    const r = act(st, { type: 'item', item: 'potion', target: 0 }, { type: 'move', slot: 0 });
    expect(r.events[0]).toMatchObject({ t: 'useItem', amount: 20 });
  });

  it('learn prompts block the battle until answered', () => {
    const me = mon('009', 17);
    me.xp = 18 ** 3 - 1;
    const st = battle([me], [mon('004', 3)]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'langue-fantome') }, { type: 'move', slot: 0 });
    expect(r.state.learnQueue[0]).toMatchObject({ move: 'cauchemar' });
    const r2 = act(r.state, { type: 'learn', forget: 0 }, { type: 'move', slot: 0 });
    expect(activeMon(r2.state.sides[0]).moves[0].id).toBe('cauchemar');
    expect(r2.state.learnQueue).toHaveLength(0);
  });

  it('a held berry restores HP once, at half HP or less', () => {
    const me = mon('003', 20, 1, { item: 'baie-doree' });
    const foe = mon('002', 30);
    const st = battle([me], [foe]);
    let cur = st;
    let ate = 0;
    for (let t = 0; t < 6 && !cur.result && !cur.needSwitch; t++) {
      const r = act(cur, { type: 'move', slot: 0 }, { type: 'move', slot: slotOf(foe, 'flammeche') });
      ate += r.events.filter((e) => e.t === 'berry').length;
      cur = r.state;
    }
    expect(ate).toBe(1);
    expect(cur.sides[0].party[0].item).toBeNull();
  });

  it('status berries cure their status right away, on both sides', () => {
    const me = mon('009', 13);
    const foe = mon('002', 13, 1, { item: 'baie-reveil' });
    const st = battle([me], [foe]);
    // Regard hypnotique always puts the foe to sleep when it hits
    let r = act(st, { type: 'move', slot: slotOf(me, 'regard-hypnotique') }, { type: 'move', slot: 0 });
    for (let seed = 6; !r.events.some((e) => e.t === 'status') && seed < 40; seed++) {
      r = act({ ...st, rng: seed }, { type: 'move', slot: slotOf(me, 'regard-hypnotique') }, { type: 'move', slot: 0 });
    }
    expect(r.events.find((e) => e.t === 'berry')).toMatchObject({ side: 1, cured: 'sleep' });
    expect(r.state.sides[1].party[0].status).toBeNull();
  });

  it('a creature that comes in poisoned eats its berry at once', () => {
    const me = mon('001', 10, 1, { status: 'poison', item: 'baie-peche' });
    const st = battle([me], [mon('002', 5)]);
    expect(st.sides[0].party[0].status).toBeNull();
    expect(st.sides[0].party[0].item).toBeNull();
  });

  it('the snack restores 1/16 of max HP at the end of each turn', () => {
    const me = mon('008', 29, 1, { item: 'gouter' });
    me.hp = 20;
    const st = battle([me], [mon('006', 30)]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'grondement') }, { type: 'move', slot: slotOf(st.sides[1].party[0], 'chanson-douce') });
    const left = r.events.find((e) => e.t === 'regen');
    expect(left).toMatchObject({ side: 0, amount: Math.floor(maxHp(me) / 16) });
  });

  /** XP a level `earner` Bestiole gets for beating a wild Lunelle (013) at L3. */
  /** A wild Bestiole gives ×1.5, as much as a trainer's (met as rarely as in FireRed). */
  const wildXp = (base: number) => Math.floor(base * 1.5);
  const lunelleXp = (earner: number) => Math.floor(wildXp(Math.floor((creature('013').baseExp * 3) / 5)) * levelFactor(3, earner));

  it('the Tracing Paper shares XP with a creature that did not fight (Gen 3 halves)', () => {
    const fighter = mon('002', 20);
    const benched = mon('001', 5, 1, { item: 'papier-calque' });
    const foe = mon('013', 3);
    const st = battle([fighter, benched], [foe], 'wild');
    const r = act(st, { type: 'move', slot: slotOf(fighter, 'flammeche') }, { type: 'move', slot: 0 });
    const xp = r.events.filter((e) => e.t === 'xp');
    expect(xp).toEqual([{ t: 'xp', idx: 0, amount: Math.floor(lunelleXp(20) / 2) }, { t: 'xp', idx: 1, amount: Math.floor(lunelleXp(5) / 2) }]);
    expect(r.state.sides[0].party[1].evs.spe).toBe(1);
    // without it, the fighter gets everything
    const solo = act(battle([fighter, mon('001', 5)], [foe], 'wild'), { type: 'move', slot: slotOf(fighter, 'flammeche') }, { type: 'move', slot: 0 });
    expect(solo.events.filter((e) => e.t === 'xp')).toEqual([{ t: 'xp', idx: 0, amount: lunelleXp(20) }]);
  });

  it('a Bestiole received in a trade gets ×1.5 XP (Gen 3)', () => {
    const traded = mon('002', 20);
    traded.ot = 'Hugo';
    const r = act(battle([traded], [mon('013', 3)], 'wild'), { type: 'move', slot: slotOf(traded, 'flammeche') }, { type: 'move', slot: 0 });
    expect(r.events.filter((e) => e.t === 'xp')).toEqual([{ t: 'xp', idx: 0, amount: Math.floor(lunelleXp(20) * 1.5) }]);
  });

  it('Gen 5 XP: baseExp × level / 5 at equal levels, more when behind, less when ahead', () => {
    expect(levelFactor(12, 12)).toBe(1);
    expect(levelFactor(10, 5)).toBeCloseTo(1.58, 1);
    expect(levelFactor(10, 15)).toBeCloseTo(0.67, 1);
    const beat = (lv: number) => act(battle([mon('002', lv)], [mon('013', 10, 1, { hp: 1 })], 'wild'), { type: 'move', slot: 0 }, { type: 'move', slot: 0 }).events.find((e) => e.t === 'xp');
    expect(beat(10)).toMatchObject({ amount: wildXp(Math.floor((creature('013').baseExp * 10) / 5)) });
  });

  it('catching a Bestiole gives XP and effort points, as beating it would', () => {
    const me = mon('002', 8);
    me.xp = xpAt(9) - 1;
    const wild = mon('062', 4, 1, { status: 'sleep', hp: 1 });
    const r = act(battle([me], [wild], 'wild'), { type: 'ball', item: 'crayon-ball' }, { type: 'move', slot: 0 });
    expect(r.state.result).toBe('capture');
    const xp = r.events.find((e) => e.t === 'xp');
    expect(xp).toMatchObject({ idx: 0, amount: Math.floor(wildXp(Math.floor((creature('062').baseExp * 4) / 5)) * levelFactor(4, 8)) });
    expect(r.events.some((e) => e.t === 'levelUp')).toBe(true);
    expect(r.state.sides[0].party[0].evs.atk).toBe(1);
    // the XP comes after the ball, the end of the battle after the XP
    const order = r.events.map((e) => e.t);
    expect(order.indexOf('ball')).toBeLessThan(order.indexOf('xp'));
    expect(order.indexOf('xp')).toBeLessThan(order.indexOf('end'));
  });

  it('berries can be eaten from the bag in battle', () => {
    const me = mon('001', 10, 1, { status: 'burn' });
    const st = battle([me], [mon('002', 5)]);
    expect(itemUsable(st, 'baie-cerise', 0)).toBe(false);
    expect(itemUsable(st, 'baie-givree', 0)).toBe(true);
    const r = act(st, { type: 'item', item: 'baie-givree', target: 0 }, { type: 'move', slot: 0 });
    expect(r.state.sides[0].party[0].status === 'burn').toBe(false);
  });

  it('syrups raise a stat of the creature fighting, one stage each', () => {
    const me = mon('002', 10);
    const st = battle([me, mon('001', 10)], [mon('003', 10)]);
    expect(itemUsable(st, 'sirop-attaque', 1)).toBe(false);
    expect(itemUsable(st, 'sirop-attaque', 0)).toBe(true);
    const r = act(st, { type: 'item', item: 'sirop-attaque', target: 0 }, { type: 'move', slot: 0 });
    expect(r.events.find((e) => e.t === 'stage')).toMatchObject({ side: 0, stat: 'atk', delta: 1 });
    expect(r.state.sides[0].vol.stages.atk).toBe(1);
    const maxed = structuredClone(st);
    maxed.sides[0].vol.stages.spe = 6;
    expect(itemUsable(maxed, 'sirop-vitesse', 0)).toBe(false);
  });

  it('the Pencil Sharpener doubles the critical-hit chance until withdrawn', () => {
    const st = battle([mon('002', 10)], [mon('001', 10)]);
    const fire = MOVES.find((m) => m.id === 'flammeche')!;
    const crits = (s: BattleState) => {
      let n = 0;
      for (let i = 0; i < 4000; i++) if (computeDamage({ rng: i * 7919 }, s.sides[0], s.sides[1], fire, 40).crit) n++;
      return n / 4000;
    };
    const r = act(st, { type: 'item', item: 'taille-crayon', target: 0 }, { type: 'move', slot: 0 });
    expect(r.state.sides[0].vol.focus).toBe(true);
    expect(itemUsable(r.state, 'taille-crayon', 0)).toBe(false);
    expect(crits(st)).toBeLessThan(0.09);
    expect(crits(r.state)).toBeGreaterThan(0.1);
  });

  it('the Protective Varnish blocks the foe’s stat drops for 5 turns, not your own', () => {
    const me = mon('003', 15);
    const foe = mon('009', 15);
    const st = battle([me], [foe]);
    expect(slotOf(foe, 'grimace')).toBeGreaterThanOrEqual(0);
    let r = act(st, { type: 'item', item: 'vernis', target: 0 }, { type: 'move', slot: slotOf(foe, 'grimace') });
    expect(r.events.some((e) => e.t === 'guarded' && e.side === 0)).toBe(true);
    expect(r.state.sides[0].guard).toBe(4);
    expect(r.state.sides[0].vol.stages.spe).toBe(0);
    let cur = r.state;
    for (let t = 0; t < 4; t++) {
      r = act(cur, { type: 'move', slot: slotOf(me, 'carapace-tambour') >= 0 ? slotOf(me, 'carapace-tambour') : 0 }, { type: 'move', slot: slotOf(foe, 'grimace') });
      cur = r.state;
    }
    expect(cur.sides[0].guard).toBe(0);
    expect(r.events.some((e) => e.t === 'guard' && !e.on)).toBe(true);
  });

  it('coloured pencils add 20% to moves of their type only', () => {
    const fire = MOVES.find((m) => m.id === 'flammeche')!;
    const bubble = MOVES.find((m) => m.id === 'bulles')!;
    const avg = (item: string | null, mv: typeof fire) => {
      const st = battle([mon('002', 30, 1, { item })], [mon('008', 30)]);
      let n = 0;
      for (let i = 0; i < 300; i++) n += computeDamage({ rng: i * 977 }, st.sides[0], st.sides[1], mv, mv.power, false).dmg;
      return n / 300;
    };
    expect(avg('crayon-rouge', fire) / avg(null, fire)).toBeGreaterThan(1.12);
    expect(avg('crayon-rouge', bubble)).toBeCloseTo(avg(null, bubble), 5);
  });

  it('Stubborn items boost a stat and lock the first move used', () => {
    const me = mon('002', 20, 1, { item: 'bandeau-tetu' });
    const st = battle([me], [mon('008', 30)]);
    expect(effectiveStat(st.sides[0], 'atk')).toBe(Math.floor(statsOf(me).atk * 1.5));
    const slot = slotOf(me, 'flammeche');
    const r = act(st, { type: 'move', slot }, { type: 'move', slot: 0 });
    expect(r.state.sides[0].vol.lock).toBe('flammeche');
    expect(usableSlots(activeMon(r.state.sides[0]), r.state.sides[0].vol)).toEqual([slot]);
    const other = r.state.sides[0].party[0].moves.findIndex((m) => m.id !== 'flammeche');
    expect(() => act(r.state, { type: 'move', slot: other }, { type: 'move', slot: 0 })).toThrow(IllegalAction);
    const scarf = battle([mon('002', 20, 1, { item: 'echarpe-tetue' })], [mon('008', 30)]);
    expect(effectiveStat(scarf.sides[0], 'spe')).toBe(Math.floor(statsOf(scarf.sides[0].party[0]).spe * 1.5));
  });

  it('Painter’s Apron: Sp. Def ×1.5 and no status moves', () => {
    const me = mon('001', 10, 1, { item: 'tablier-peintre' }); // Griffe, Grondement (status), Coup de liane, Griffe-pousse
    const st = battle([me], [mon('002', 10)]);
    expect(usableSlots(me)).not.toContain(slotOf(me, 'grondement'));
    expect(effectiveStat(st.sides[0], 'spd')).toBe(Math.floor(statsOf(me).spd * 1.5));
  });

  it('the Fierce Marble hits harder and costs 1/10 of max HP per attack', () => {
    const me = mon('002', 20, 1, { item: 'bille-ardente' });
    const st = battle([me], [mon('008', 40, 1, { moves: [{ id: 'grondement', pp: 40 }] })]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'flammeche') }, { type: 'move', slot: 0 });
    expect(r.events.find((e) => e.t === 'itemHurt')).toMatchObject({ side: 0, item: 'bille-ardente', amount: Math.floor(maxHp(me) / 10) });
  });

  it('the Spiky Helmet hurts physical attackers, not special ones', () => {
    const foe = mon('008', 30, 1, { item: 'casque-pointes' });
    const me = mon('002', 20); // Pas-de-loup is physical, Flammèche special
    const st = battle([me], [foe]);
    const phys = act(st, { type: 'move', slot: slotOf(me, 'pas-de-loup') }, { type: 'move', slot: slotOf(foe, 'grondement') });
    expect(phys.events.find((e) => e.t === 'itemHurt')).toMatchObject({ side: 0, item: 'casque-pointes', amount: Math.floor(maxHp(me) / 6) });
    const spec = act(st, { type: 'move', slot: slotOf(me, 'flammeche') }, { type: 'move', slot: slotOf(foe, 'grondement') });
    expect(spec.events.some((e) => e.t === 'itemHurt')).toBe(false);
  });

  it('the Steadfast Ribbon keeps 1 HP from full health, once', () => {
    const foe = mon('012', 3, 1, { item: 'ruban-tenace' });
    const st = battle([mon('002', 30)], [foe], 'wild');
    const r = act(st, { type: 'move', slot: slotOf(st.sides[0].party[0], 'tourbillon-braises') }, { type: 'move', slot: 0 });
    expect(r.events.some((e) => e.t === 'hangOn')).toBe(true);
    expect(r.state.sides[1].party[0].hp).toBe(1);
    expect(r.state.sides[1].party[0].item).toBeNull();
  });

  it('the Swift Quill sometimes lets the slower one move first', () => {
    let first = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const slow = mon('008', 20, 1, { item: 'plume-vive' }); // Ronflon is very slow
      const st = battle([slow], [mon('004', 20)], 'trainer', seed);
      const r = act(st, { type: 'move', slot: 0 }, { type: 'move', slot: 0 });
      const moves = r.events.filter((e) => e.t === 'move');
      if (moves[0]?.t === 'move' && moves[0].side === 0) first++;
    }
    expect(first).toBeGreaterThan(40);
    expect(first).toBeLessThan(130);
  });

  it('the Drafter’s Loupe raises the critical-hit chance', () => {
    const fire = MOVES.find((m) => m.id === 'flammeche')!;
    const st = battle([mon('002', 10, 1, { item: 'loupe' })], [mon('001', 10)]);
    let n = 0;
    for (let i = 0; i < 4000; i++) if (computeDamage({ rng: i * 7919 }, st.sides[0], st.sides[1], fire, 40).crit) n++;
    expect(n / 4000).toBeGreaterThan(0.1);
  });

  it('the Greedy Bell restores 1/8 of the damage dealt', () => {
    const me = mon('002', 20, 1, { item: 'clochette' });
    me.hp = 10;
    const st = battle([me], [mon('008', 40, 1, { moves: [{ id: 'grondement', pp: 40 }] })]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'flammeche') }, { type: 'move', slot: slotOf(st.sides[1].party[0], 'grondement') });
    const dmg = r.events.find((e) => e.t === 'damage' && e.side === 1);
    const bell = r.events.find((e) => e.t === 'itemHeal');
    expect(bell).toMatchObject({ side: 0, amount: Math.max(1, Math.floor((dmg as { amount: number }).amount / 8)) });
  });

  it('every type has a coloured pencil and every held item has an effect', () => {
    const boosters = Object.values(ITEM_BY_ID).filter((i) => i.hold === 'typeBoost').map((i) => i.type);
    for (const t of Object.keys(TYPES)) expect(boosters, t).toContain(t);
    for (const i of Object.values(ITEM_BY_ID)) if (i.kind === 'hold') expect(i.hold, i.id).toBeDefined();
  });

  it('AI vs AI battles always end', () => {
    const ids = CREATURES.map((c) => c.id);
    for (let seed = 1; seed <= 200; seed++) {
      const held = ['baie-bleue', 'baie-doree', 'baie-prisme', 'baie-menthe', 'gouter', 'papier-calque', 'bandeau-tetu', 'echarpe-tetue',
        'lunettes-tetues', 'bille-ardente', 'tablier-peintre', 'casque-pointes', 'ruban-tenace', 'plume-vive', 'loupe', 'couronne-carton', 'clochette', 'crayon-rouge', null];
      const party = (k: number, n: number) => Array.from({ length: n }, (_, i) => ({
        ...createMon(ids[(seed * 3 + i * 5 + k) % ids.length], 3 + ((seed + i) % 30), { rng: seed * 31 + i + k }),
        item: held[(seed + i + k) % held.length],
      }));
      let st: BattleState = battle(party(0, 1 + (seed % 4)), party(7, 1 + ((seed + 2) % 4)), seed % 3 ? 'trainer' : 'wild', seed);
      let turns = 0;
      while (!st.result && turns++ < 400) {
        let a: Action;
        if (st.learnQueue.length) a = { type: 'learn', forget: seed % 2 ? 0 : null };
        else if (st.needSwitch) a = { type: 'replace', to: st.sides[0].party.findIndex((m) => m.hp > 0) };
        else {
          const slots = usableSlots(activeMon(st.sides[0]), st.sides[0].vol);
          a = { type: 'move', slot: slots.length ? slots[turns % slots.length] : -1 };
        }
        st = act(st, a, aiChoose(st)).state;
      }
      expect(st.result, `seed ${seed}`).not.toBeNull();
    }
  });
});

import { describe, expect, it } from 'vitest';
import { createMon, SHINY_CHANCE } from '../engine/pk/creature';
import { monLabel } from '../data/creatures';
import { partyOf } from '../data/trainers';
import { ITEM_BY_ID } from '../data/items';
import { BOX_COUNT, BOX_SIZE } from '../save/schema';
import { addMon, allMons, blackoutLoss, migrate, spareBox } from './game';

function v4Save(boxCount: number) {
  const st = { rng: 7 };
  return {
    version: 4, createdAt: 1, playMs: 0,
    player: { name: 'Lou', avatar: 0, gender: 'f', map: 'route1', x: 3, y: 4, facing: 'down' },
    rivalName: 'Feutre', respawn: { map: 'maison', x: 4, y: 5 }, flags: { intro: 1 },
    party: [createMon('001', 12, st)], box: Array.from({ length: boxCount }, () => createMon('013', 5, st)),
    bag: {}, money: 500, dex: { seen: ['001'], caught: ['001'] }, badges: [], stats: { battles: 3, captures: 1 },
  };
}

describe('PC boxes', () => {
  it('spreads an old single box over the new boxes, 30 per box', () => {
    const s = migrate(v4Save(45))!;
    expect(s.boxes).toHaveLength(BOX_COUNT);
    expect(s.boxes[0]).toHaveLength(BOX_SIZE);
    expect(s.boxes[1]).toHaveLength(15);
    expect((s as unknown as { box?: unknown }).box).toBeUndefined();
    expect(allMons(s)).toHaveLength(46);
  });

  it('stores in the first box with room once the party is full', () => {
    const s = migrate(v4Save(BOX_SIZE))!;
    const st = { rng: 3 };
    while (s.party.length < 6) addMon(s, createMon('004', 5, st));
    expect(addMon(s, createMon('005', 5, st))).toBe('box');
    expect(s.boxes[1]).toHaveLength(1);
  });

  it('adds a box when the PC gets nearly full, and never more than needed', () => {
    const s = migrate(v4Save(0))!;
    const st = { rng: 5 };
    // seven full boxes and an empty one: still a box's worth of room
    for (let b = 0; b < 7; b++) s.boxes[b] = Array.from({ length: BOX_SIZE }, () => createMon('013', 5, st));
    spareBox(s);
    expect(s.boxes).toHaveLength(BOX_COUNT);
    s.boxes[7].push(createMon('013', 5, st));
    spareBox(s);
    expect(s.boxes).toHaveLength(BOX_COUNT + 1);
    // a capture with a full party lands in the eighth box; the ninth stays free
    while (s.party.length < 6) addMon(s, createMon('004', 5, st));
    expect(addMon(s, createMon('005', 5, st))).toBe('box');
    expect(s.boxes[7]).toHaveLength(2);
    expect(s.boxes).toHaveLength(BOX_COUNT + 1);
  });

  it('costs what FireRed charges for a blackout, never more than the purse', () => {
    const s = migrate(v4Save(0))!;
    s.money = 10000;
    s.party = [createMon('001', 20, { rng: 1 }), createMon('002', 12, { rng: 2 })];
    s.badges = ['pastel', 'plume'];
    expect(blackoutLoss(s)).toBe(20 * 4 * 6);
    s.badges = Array.from({ length: 12 }, (_, i) => `b${i}`);
    expect(blackoutLoss(s)).toBe(20 * 4 * 30);
    s.money = 300;
    expect(blackoutLoss(s)).toBe(300);
  });

  it('notes where and how a creature was met', () => {
    const s = migrate(v4Save(0))!;
    const m = createMon('012', 3, { rng: 1 });
    addMon(s, m, 'caught', 'route1');
    expect(m.met).toEqual({ level: 3, map: 'route1', how: 'caught' });
    expect(s.party[0].met).toBeUndefined();
  });
});

describe('nicknames and sparkly Bestioles', () => {
  it('shows the nickname, or the species name', () => {
    const m = createMon('013', 5, { rng: 2 });
    expect(monLabel(m)).toBe('Piafou');
    expect(monLabel({ ...m, nickname: 'Pioupiou' })).toBe('Pioupiou');
  });

  it('makes about 1 Bestiole in 100 sparkly, never a trainer’s', () => {
    const st = { rng: 99 };
    const n = 20000;
    let shiny = 0;
    for (let i = 0; i < n; i++) if (createMon('004', 5, st).shiny) shiny++;
    expect(Math.abs(shiny / n - SHINY_CHANCE)).toBeLessThan(0.004);
    for (let seed = 0; seed < 300; seed++) expect(partyOf([{ species: '004', level: 5 }], seed)[0].shiny).toBe(false);
  });

  it('has the field items', () => {
    expect(ITEM_BY_ID.spray.field).toBe('repel');
    expect(ITEM_BY_ID['fil-ariane'].field).toBe('escape');
  });
});

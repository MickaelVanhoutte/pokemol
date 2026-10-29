import { describe, expect, it } from 'vitest';
import { ADMIN_LINES, BORD_REMATCHES, REPENT_GIFTS, RETIRED, rematchesWon, repentLine, repentLook, repentant } from './afterStory';
import { BADGES } from './badges';
import { ITEM_BY_ID } from './items';
import { MAPS } from './maps';
import { TRAINERS } from './trainers';
import { applyPatches } from '../overworld/patches';
import { LOOKS } from '../overworld/sprites';
import { migrate } from '../state/game';
import { CREATURES } from './creatures';
import { onSale } from '../ui/screens/ShopScreen';
import { machineRoll } from '../ui/screens/MachineScreen';
import type { NpcDef } from '../overworld/mapTypes';

const placed = new Set(Object.values(MAPS).flatMap((m) => (m.npcs ?? []).map((n) => n.trainer).filter(Boolean)));
const town = (id: string) => [...(MAPS[id].npcs ?? []), ...((MAPS[id] as { residents?: NpcDef[] }).residents ?? [])];
const leaders = BADGES.map((b) => Object.values(TRAINERS).find((t) => t.badge === b.id)!.id);
const SKETCH = /[Yng]/;

describe('Team Gomme after the ending', () => {
  it('stops battling and colours in its uniforms', () => {
    expect(repentant('r4gomme', true)).toBe(true);
    expect(repentant('r4gomme', false)).toBe(false);
    expect(repentant(leaders[0], true)).toBe(false);
    const look = repentLook('r4gomme', LOOKS.gomme);
    expect(look.shirt).not.toBe(LOOKS.gomme.shirt);
    expect(look.hat).toBe(LOOKS.gomme.hat);
    expect(look.gang).toBe('grunt');
  });

  it('speaks with lines of its own, and gives back erasers', () => {
    for (const id of Object.keys(ADMIN_LINES)) {
      expect(placed.has(id), id).toBe(true);
      expect(repentLine(id)).toBe(ADMIN_LINES[id]);
    }
    expect(repentLine('r4gomme')).toHaveLength(1);
    for (const [id, gift] of Object.entries(REPENT_GIFTS)) {
      expect(TRAINERS[id]?.grey && placed.has(id), id).toBe(true);
      expect(ITEM_BY_ID[gift.item]?.kind, gift.item).toBe('effort');
    }
    for (const id of RETIRED) expect(TRAINERS[id]?.grey, id).toBe(true);
  });
});

describe('residents after the ending', () => {
  it('have something new to say in every town, and some a present', () => {
    for (const id of ['bourg', 'ville', 'plume', 'port', 'feutre', 'braise', 'paillette', 'gouache', 'encre']) {
      const after = town(id).filter((n) => n.afterStory);
      expect(after.length, id).toBeGreaterThanOrEqual(2);
      expect(after.filter((n) => n.afterStory!.gift), id).toHaveLength(1);
      for (const n of after) {
        expect(n.afterStory!.text.length).toBeGreaterThan(0);
        if (n.afterStory!.gift) expect(ITEM_BY_ID[n.afterStory!.gift.item], n.id).toBeDefined();
      }
    }
  });
});

describe('the colours coming back', () => {
  const rows = (map: string, flags: Record<string, number>) => applyPatches(MAPS[map].rows, MAPS[map].patches, (f) => !!flags[f]);

  it('follow the path of the Blank Road at the ending, then colour it all after the Grand Concours', () => {
    const before = rows('routeBlanche', {});
    expect(before.slice(0, 7).every((r) => r.slice(9, 11) !== '::')).toBe(true);
    const path = rows('routeBlanche', { ending: 1 });
    expect(path.every((r) => r.slice(9, 11) === '::' || r.slice(9, 11) === 'TT')).toBe(true);
    expect(path.some((r) => SKETCH.test(r))).toBe(true);
    const all = rows('routeBlanche', { ending: 1, champion: 1 });
    expect(all.some((r) => SKETCH.test(r))).toBe(false);
    expect(MAPS.routeBlanche.recolour).toMatchObject({ if: 'champion', border: 'tree' });
  });

  it('reach the Edge of the Page after rematches with the Atelier Masters', () => {
    const flags: Record<string, number> = { ending: 1 };
    for (const id of leaders.slice(0, BORD_REMATCHES - 1)) flags[`rematch:${id}`] = 1;
    expect(rematchesWon(flags)).toBe(BORD_REMATCHES - 1);
    expect(rows('bordPage', flags).some((r) => /[nY]/.test(r))).toBe(true);
    const all = rows('bordPage', { ...flags, 'couleurs:bord': 1 });
    expect(all.some((r) => /[nY]/.test(r))).toBe(false);
    // the edge itself stays: the margin, and the erased border round the exits
    expect(all.slice(1, 13).every((r) => r[0] === '|' && r[15] === 'e')).toBe(true);
  });

  it('are given to games that already won those rematches', () => {
    const flags: Record<string, number> = { ending: 1 };
    for (const id of leaders.slice(0, BORD_REMATCHES)) flags[`rematch:${id}`] = 1;
    const fresh = migrate(JSON.parse(JSON.stringify({ version: 5, flags, party: [], boxes: [], bag: {}, badges: [], dex: { seen: [], caught: [] }, player: { name: 'Lou', map: 'bourg', x: 1, y: 1, facing: 'down', avatar: 0 }, money: 0, playMs: 0, steps: 0, createdAt: 1, stats: { battles: 0, captures: 0 } })));
    expect(fresh?.flags['couleurs:bord']).toBe(1);
  });
});

describe('the Bestioles met only after the story', () => {
  const late = CREATURES.filter((c) => c.afterStory).map((c) => c.id);

  it('are four, and wait for their flags in the wild', () => {
    expect(late).toEqual(['108', '109', '110', '111']);
    for (const m of Object.values(MAPS)) {
      for (const row of m.encounters?.table ?? []) if (late.includes(row.id)) expect(row.if, `${m.id} ${row.id}`).toBeDefined();
    }
    const where = (id: string) => Object.values(MAPS).filter((m) => m.encounters?.table.some((r) => r.id === id)).map((m) => m.id);
    expect(where('110')).toContain('routeBlanche');
    expect(where('108')).toContain('routeBlanche');
    expect(where('111')).toEqual(['bordPage']);
  });

  it('never come out of the Tombola before the ending', () => {
    for (let seed = 1; seed < 400; seed++) expect(late, String(seed)).not.toContain(machineRoll(seed, 30).species);
    const after = new Set(Array.from({ length: 2000 }, (_, i) => machineRoll(i + 1, 30, true).species));
    expect(late.some((id) => after.has(id))).toBe(true);
  });

  it('sell the Magic Ice Pencil once the story is over, for Floconnet to grow up', () => {
    const all = { badges: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flags: {} };
    expect(onSale('crayon-magique-glace', all)).toBe(false);
    expect(onSale('crayon-magique-glace', { ...all, flags: { ending: 1 } })).toBe(true);
  });
});

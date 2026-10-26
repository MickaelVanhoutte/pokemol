import { describe, expect, it } from 'vitest';
import { createMon } from '../engine/pk/creature';
import { SAVE_VERSION } from '../save/schema';
import { migrate } from './game';

/** A creature as saved by version 3 (no effort points, no held item, no nature). */
function oldMon(species: string, level: number) {
  const { evs: _evs, item: _item, nature: _nature, ...m } = createMon(species, level, { rng: 3 });
  return m;
}

function v3Save(flags: Record<string, number> = {}) {
  return {
    version: 3, createdAt: 1, playMs: 0,
    player: { name: 'Lou', avatar: 0, gender: 'f', map: 'ville', x: 3, y: 4, facing: 'down' },
    rivalName: 'Feutre', respawn: { map: 'maison', x: 4, y: 5 }, flags,
    party: [oldMon('001', 12)], box: [oldMon('004', 7)], bag: { potion: 2 }, money: 500,
    dex: { seen: ['001', '004'], caught: ['001', '004'] }, badges: [], stats: { battles: 3, captures: 1 },
  };
}

describe('save migration', () => {
  it('upgrades a version 3 save without losing anything', () => {
    const s = migrate(v3Save({ intro: 1 }))!;
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.party[0].evs).toEqual({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
    expect(s.party[0].item).toBeNull();
    expect(s.boxes[0][0].evs.hp).toBe(0);
    expect(s.party[0].level).toBe(12);
    expect(s.bag.potion).toBe(2);
    expect(s.bag.carte).toBe(1);
    const beforeIntro = v3Save();
    beforeIntro.party = [];
    expect(migrate(beforeIntro)!.bag.carte).toBeUndefined();
  });

  it('still upgrades version 2 saves (creatures wait in the PC)', () => {
    const s = migrate({
      version: 2, createdAt: 1, playMs: 10, player: { name: 'Lou', avatar: 1 },
      party: [oldMon('002', 9)], box: [], bag: {}, money: 100, dex: { seen: ['002'], caught: ['002'] }, stats: { battles: 1, captures: 0 },
    })!;
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.boxes[0][0].species).toBe('002');
    expect(s.boxes[0][0].item).toBeNull();
  });

  it('hands out the stencils of badges won before stencils existed', () => {
    const raw = v3Save({ intro: 1 });
    raw.badges = ['pastel', 'plume'] as never[];
    const s = migrate(raw)!;
    expect(s.bag['pochoir-01']).toBe(1);
    expect(s.bag['pochoir-02']).toBe(1);
    expect(s.bag['pochoir-03']).toBeUndefined();
  });

  it('unsticks a story cut short during an after-battle scene', () => {
    const raw = v3Save({ intro: 1, rival1: 1, 'tr:gomme2': 1, 'tr:mireille': 1, 'tr:gaspard': 1, 'badge:gaspard': 0 });
    raw.badges = ['plume'] as never[];
    const s = migrate(raw)!;
    expect(s.flags['a1.bois']).toBe(1);
    expect(s.badges).toEqual(['pastel', 'plume']);
    expect(s.flags['badge:pastel']).toBe(1);
    expect(s.flags['a2.feutre']).toBeUndefined();
  });

  it('finishes the lab scene if the app closed during the first battle', () => {
    const raw = v3Save({ intro: 1 });
    const s = migrate(raw)!;
    expect(s.flags.rival1).toBe(1);
    expect(s.flags.dex).toBe(1);
    const noStarter = v3Save({ intro: 1 });
    noStarter.party = [];
    expect(migrate(noStarter)!.flags.rival1).toBeUndefined();
  });

  it('refuses unknown data', () => {
    expect(migrate({ version: 1 })).toBeNull();
    expect(migrate('nope')).toBeNull();
  });
});

describe('natures and running shoes in older saves', () => {
  it('gives older Bestioles a fixed nature', () => {
    const raw = v3Save({ intro: 1 });
    const a = migrate(structuredClone(raw))!;
    const b = migrate(structuredClone(raw))!;
    expect(a.party[0].nature).toBeTruthy();
    expect(a.party[0].nature).toBe(b.party[0].nature);
  });

  it('hands the Zip Sneakers to players already past Bourg-Gribouille', () => {
    const away = migrate(v3Save({ intro: 1, rival1: 1 }))!;
    expect(away.bag.baskets).toBe(1);
    expect(away.flags.shoes).toBe(1);
    const atHome = migrate({ ...v3Save({ intro: 1, rival1: 1 }), player: { ...v3Save().player, map: 'bourg' } })!;
    expect(atHome.bag.baskets).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { createMon } from '../engine/pk/creature';
import { SAVE_VERSION } from '../save/schema';
import { migrate } from './game';
import { OLD_AVATARS } from '../data/appearance';

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

  it('gives the Feutre d’Or to a game already past Ville-Feutre, and drops a fair copy left on a Bestiole', () => {
    const past = v3Save({ intro: 1, 'a2.feutre': 1 });
    (past.party[0] as { fair?: boolean }).fair = true;
    const s = migrate(past)!;
    expect(s.bag['feutre-or']).toBe(1);
    expect(s.flags['gift:feutre-or']).toBe(1);
    expect(s.party[0].fair).toBeUndefined();
    expect(migrate(v3Save({ intro: 1 }))!.bag['feutre-or']).toBeUndefined();
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

  it('gives saves made before the look picker their old portrait', () => {
    const save = v3Save();
    save.player.avatar = 1;
    const s = migrate(save)!;
    expect(s.player.look).toEqual(OLD_AVATARS[1]);
    // a look already chosen stays
    const again = migrate({ ...s, player: { ...s.player, look: { ...OLD_AVATARS[1], hair: 'couettes' } } })!;
    expect(again.player.look?.hair).toBe('couettes');
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

describe('several games on one device', async () => {
  // a small in-memory localStorage for node
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
  const { DEFAULT_LOOKS } = await import('../data/appearance');
  const { deleteSave, hasSave, loadSave, newGame, peekSlot, persist, savedSlots, slot } = await import('./game');
  const { prefs, setPref } = await import('./prefs');

  it('keeps each game in its own slot, game 1 where the single save always was', () => {
    store.clear();
    slot.value = 1;
    setPref('difficulty', 'normal');
    newGame('Papa', DEFAULT_LOOKS.m, 'm', 'Feutre');
    persist();
    slot.value = 2;
    setPref('difficulty', 'easy');
    newGame('Lili', DEFAULT_LOOKS.f, 'f', 'Crayon');
    persist();
    expect(store.has('atelier-bestioles.save')).toBe(true);
    expect(store.has('atelier-bestioles.save.2')).toBe(true);
    expect(savedSlots()).toEqual([1, 2]);
    expect(peekSlot(1)?.player.name).toBe('Papa');
    expect(peekSlot(3)).toBeNull();
    expect(hasSave()).toBe(true);
  });

  it('plays each game at its own difficulty', () => {
    loadSave(1);
    expect(prefs.value.difficulty).toBe('normal');
    loadSave(2);
    expect(prefs.value.difficulty).toBe('easy');
    expect(slot.value).toBe(2);
  });

  it('deletes only the slot asked for', () => {
    deleteSave(1);
    expect(savedSlots()).toEqual([2]);
    expect(peekSlot(2)?.player.name).toBe('Lili');
  });

  it('keeps the player’s own Bestiole with its game only, and its design survives a reload', async () => {
    const { CUSTOM_ID, creature } = await import('../data/creatures');
    const { update } = await import('./game');
    store.clear();
    slot.value = 1;
    newGame('Papa', DEFAULT_LOOKS.m, 'm', 'Feutre');
    persist();
    slot.value = 2;
    newGame('Lili', DEFAULT_LOOKS.f, 'f', 'Crayon');
    update((x) => {
      x.atelier = {
        name: 'Gribouillon', kind: 'Rigolote', type: 'feu', base: { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 },
        talent: 'regard-noir', moves: ['flammeche'], art: 'data:image/webp;base64,AAAA', mini: 'data:image/png;base64,AAAA',
      };
    });
    persist();
    expect(creature(CUSTOM_ID).name.fr).toBe('Gribouillon');
    loadSave(1);
    expect(() => creature(CUSTOM_ID)).toThrow();
    loadSave(2);
    expect(creature(CUSTOM_ID).learnset).toEqual([[1, 'flammeche']]);
  });
});

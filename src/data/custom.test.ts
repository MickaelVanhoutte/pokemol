import { afterEach, describe, expect, it } from 'vitest';
import { L } from '../i18n';
import { CUSTOM_ID, creature, dexCount } from './creatures';
import {
  CUSTOM_TALENTS, STAT_PRESETS, STAT_TOTAL, customMovePool, customSpecies, designProblems, isSignature, joinLevel,
  registerCustom, statTotal, validDesign, type CustomDesign,
} from './custom';
import { fairCopyOf } from './fairCopies';
import { MOVES, move } from './moves';
import { talent } from './talents';
import { TYPES } from './types';
import type { TypeId } from './schema';
import { act, createBattle } from '../engine/pk/battle';
import { createMon } from '../engine/pk/creature';
import { drawnBox, fillArea, miniOfDrawing, MINI_W, MINI_H } from '../art/drawn';

const ALL = Object.keys(TYPES) as TypeId[];
const design = (patch: Partial<CustomDesign> = {}): CustomDesign => ({
  name: 'Gribouillon', kind: 'Rigolote', type: 'feu', type2: 'vol',
  base: { hp: 80, atk: 100, def: 70, spa: 60, spd: 70, spe: 100 },
  talent: 'regard-noir', moves: ['flammeche', 'coup-d-ailes', 'griffe', 'grondement'],
  art: 'data:image/webp;base64,AAAA', mini: 'data:image/png;base64,AAAA', ...patch,
});

afterEach(() => registerCustom());

describe('the player’s own Bestiole (Atelier des Brouillons)', () => {
  it('offers moves of its types and Normal only, below 100 power, never another family’s own', () => {
    for (const a of ALL) {
      for (const b of [undefined, ...ALL.filter((t) => t !== a)]) {
        const types = b ? [a, b] : [a];
        const pool = customMovePool(types);
        for (const id of pool) {
          const mv = move(id);
          expect([...types, 'normal'], id).toContain(mv.type);
          expect(mv.power, id).toBeLessThan(100);
          expect(isSignature(id), id).toBe(false);
        }
        // a valid design can always be made: an attacking move of each of its types
        for (const t of types) expect(pool.some((id) => move(id).type === t && move(id).cat !== 'status'), `${types}`).toBe(true);
      }
    }
  });

  it('keeps the signature moves and the strongest ones out', () => {
    const pool = customMovePool(ALL);
    for (const id of ['ronflement', 'craque-poing', 'grand-defile', 'rayon-de-soleil', 'lame-de-pierre', 'gros-poing', 'reve-vitrail', 'lutte']) {
      expect(pool, id).not.toContain(id);
    }
    expect(MOVES.filter((m) => pool.includes(m.id)).length).toBeGreaterThan(60);
  });

  it('only offers common talents: no immunities, double same-type bonus or always-on boosts', () => {
    const banned = new Set(['absorb', 'adaptability', 'allStab', 'parentalBond', 'fullHpGuard', 'sleepTank', 'nightBoost', 'ignoreImmunity']);
    for (const id of CUSTOM_TALENTS) expect(banned.has(talent(id).effect.kind), id).toBe(false);
  });

  it('accepts a design inside the limits and says what is missing otherwise', () => {
    expect(designProblems(design())).toEqual([]);
    for (const p of STAT_PRESETS) expect(statTotal(p.base), JSON.stringify(p.name)).toBe(STAT_TOTAL);
    const bad: Partial<CustomDesign>[] = [
      { base: { hp: 80, atk: 100, def: 70, spa: 60, spd: 70, spe: 95 } },
      { base: { hp: 25, atk: 100, def: 70, spa: 60, spd: 125, spe: 100 } },
      { base: { hp: 135, atk: 100, def: 70, spa: 60, spd: 15, spe: 100 } },
      { moves: ['flammeche', 'coup-d-ailes', 'griffe', 'grondement', 'bousculade'] },
      { moves: ['lame-de-pierre'] },
      { moves: ['griffe', 'grondement'] },
      { talent: 'trait-assure' },
      { type2: 'feu' },
      { name: '  ' },
      { art: '' },
    ];
    for (const b of bad) expect(validDesign(design(b)), JSON.stringify(b)).toBe(false);
  });

  it('becomes a species while its game is played, and fights', () => {
    expect(() => creature(CUSTOM_ID)).toThrow();
    registerCustom(design());
    const sp = creature(CUSTOM_ID);
    expect(sp.faces).toBe('left');
    expect(sp.evolutions).toBeUndefined();
    expect(sp.stencils).toContain('pochoir-19');
    const me = createMon(CUSTOM_ID, 40, { rng: 3 });
    expect(me.moves.map((m) => m.id)).toEqual(['flammeche', 'coup-d-ailes', 'griffe', 'grondement']);
    const st = createBattle({ kind: 'trainer', seed: 5, player: { name: L('a', 'a'), party: [me], isAI: false }, enemy: { name: L('b', 'b'), party: [createMon('001', 40, { rng: 4 })], isAI: true } });
    const step = act(st.state, { type: 'move', slot: 0 }, { type: 'move', slot: 0 });
    expect(step.events.length).toBeGreaterThan(0);
    registerCustom();
    expect(() => creature(CUSTOM_ID)).toThrow();
  });

  it('still loads a design saved under older rules', () => {
    registerCustom(design({ moves: ['flammeche', 'not-a-move'], talent: 'not-a-talent' }));
    expect(creature(CUSTOM_ID).learnset).toEqual([[1, 'flammeche']]);
    expect(creature(CUSTOM_ID).talents).toEqual([CUSTOM_TALENTS[0]]);
  });

  it('goes over its drawing in felt-tip: HP kept, a fifth more in all', () => {
    registerCustom(design());
    const fc = fairCopyOf(CUSTOM_ID)!;
    const base = customSpecies(design()).base;
    expect(fc.base.hp).toBe(base.hp);
    expect(statTotal(fc.base)).toBe(Math.round((STAT_TOTAL * 1.2) / 5) * 5);
    for (const k of ['atk', 'def', 'spa', 'spd', 'spe'] as const) expect(fc.base[k]).toBeGreaterThanOrEqual(base[k]);
  });

  it('never completes the Bestiodex, and joins near the team’s level', () => {
    registerCustom(design());
    expect(dexCount(['001', CUSTOM_ID, '002', 'nope'])).toBe(2);
    expect(joinLevel([12, 20])).toBe(35);
    expect(joinLevel([44, 50, 31])).toBe(48);
  });
});

describe('the drawing’s miniature', () => {
  it('finds what was drawn, and nothing on an empty sheet', () => {
    const blank = { data: new Uint8ClampedArray(40 * 40 * 4), width: 40, height: 40 };
    expect(drawnBox(blank)).toBeNull();
    blank.data[(10 * 40 + 20) * 4 + 3] = 255;
    expect(drawnBox(blank, 2)).toEqual({ x: 18, y: 8, w: 5, h: 5 });
  });

  it('keeps thin pencil lines and fills what they enclose', () => {
    // a thin ring, 2 px wide, on a 200 px sheet: an average would wash it away
    const n = 200, img = { data: new Uint8ClampedArray(n * n * 4), width: n, height: n };
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const r = Math.hypot(x - 100, y - 100);
        if (r > 80 && r < 82) img.data.set([200, 60, 60, 255], (y * n + x) * 4);
      }
    }
    const mini = miniOfDrawing(img);
    expect(mini.width).toBeLessThanOrEqual(MINI_W + 2);
    expect(mini.height).toBeLessThanOrEqual(MINI_H + 2);
    const centre = ((mini.height >> 1) * mini.width + (mini.width >> 1)) * 4;
    expect(mini.data[centre + 3]).toBe(255);
  });
});

describe('the fill pencil', () => {
  // a square outline 4 px thick with a 4 px gap in it, on a 100 px sheet
  const sheet = (gapped: boolean) => {
    const n = 100, img = { data: new Uint8ClampedArray(n * n * 4), width: n, height: n };
    for (let y = 20; y < 80; y++) {
      for (let x = 20; x < 80; x++) {
        const edge = x < 24 || x >= 76 || y < 24 || y >= 76;
        const hole = gapped && y < 24 && x >= 48 && x < 52;
        if (edge && !hole) img.data.set([30, 30, 40, 255], (y * n + x) * 4);
      }
    }
    return img;
  };

  it('colours what the lines enclose, and a little under them', () => {
    const area = fillArea(sheet(false), 50, 50)!;
    expect(area[50 * 100 + 50]).toBe(1);
    expect(area[25 * 100 + 50]).toBe(1);
    expect(area[10 * 100 + 10]).toBe(0);
  });

  it('closes the small gaps of a hand-drawn line', () => {
    expect(fillArea(sheet(true), 50, 50)).not.toBeNull();
  });

  it('refuses an open shape instead of colouring the whole page', () => {
    expect(fillArea(sheet(false), 5, 5)).toBeNull();
  });
});

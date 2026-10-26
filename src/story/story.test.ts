import { describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// the story only needs the controller's registry and helpers; the canvas game is never created in tests
vi.mock('../audio/sfx', () => ({ sfx: new Proxy({}, { get: () => () => undefined }) }));

const { MAPS } = await import('../data/maps');
const { TRAINERS } = await import('../data/trainers');
const { scripts } = await import('../overworld/controller');
await import('./index');

const dir = new URL('.', import.meta.url).pathname;
const source = [
  ...readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).map((f) => readFileSync(join(dir, f), 'utf8')),
  readFileSync(join(dir, '../overworld/controller.ts'), 'utf8'),
].join('\n');

/** Flags some code sets: setFlag('x'), d.flags.x = …, d.flags['x'] = …, plus trainer wins and badges. */
function flagIsSet(name: string): boolean {
  if (name.startsWith('tr:') && TRAINERS[name.slice(3)]) return true;
  if (Object.values(TRAINERS).some((t) => t.storyFlag === name)) return true;
  if (name.startsWith('badge:')) return Object.values(TRAINERS).some((t) => t.badge === name.slice(6));
  if (name.startsWith('visit:')) return MAPS[name.slice(6)]?.onEnter === 'visitTown';
  if (name.startsWith('rematch:')) return !!TRAINERS[name.slice(8)]?.badge && source.includes('setFlag(`rematch:${id}`)');
  if (name.startsWith('gc:')) return source.includes('setFlag(`gc:${n}`)');
  // puzzles: set by the generic code from the map data
  if (name.startsWith('fresque:')) return Object.values(MAPS).some((m) => m.fresques?.some((f) => `fresque:${f.id}` === name)) && source.includes('setFlag(`fresque:${f.id}`)');
  if (name.startsWith('puzzle:')) return Object.values(MAPS).some((m) => m.puzzles?.some((pz) => pz.flag === name)) && source.includes('solvedPuzzles(');
  if (name.startsWith('hole:')) {
    const [, map, at] = name.split(':');
    const [x, y] = at.split(',').map(Number);
    return !!MAPS[map]?.holes?.some((h) => h.x === x && h.y === y) && source.includes('holeFlag(def.id, x, y)');
  }
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`setFlag\\(\\s*'${esc}'|flags\\.${esc}\\s*=|flags\\['${esc}'\\]\\s*=`).test(source);
}

describe('story wiring', () => {
  for (const map of Object.values(MAPS)) {
    it(`${map.id}: every script it references exists`, () => {
      const ids = [
        ...(map.npcs ?? []).map((n) => n.script),
        ...(map.triggers ?? []).map((t) => t.script),
        ...(map.interact ?? []).map((i) => i.script),
        ...(map.buildings ?? []).map((b) => b.script),
        map.onEnter,
      ].filter(Boolean) as string[];
      for (const id of ids) expect(scripts[id], id).toBeTypeOf('function');
    });
    it(`${map.id}: every flag it waits for is set somewhere`, () => {
      const flags = [
        ...(map.npcs ?? []).flatMap((n) => [n.showIf, n.hideIf]),
        ...(map.triggers ?? []).flatMap((t) => [t.if, t.unless]),
        ...(map.patches ?? []).flatMap((p) => [p.if, p.unless]),
        ...(map.obstacles ?? []).flatMap((o) => [o.showIf, o.hideIf]),
        ...(map.items ?? []).map((p) => p.showIf),
        map.tintUnless,
      ].filter(Boolean) as string[];
      // flags of later acts (a2., a3.…) are allowed to be set by content not written yet
      for (const f of flags.filter((x) => !/^a[2-9]\./.test(x))) expect(flagIsSet(f), f).toBe(true);
    });
  }
  it('runs after-battle scripts that exist', () => {
    for (const t of Object.values(TRAINERS)) if (t.afterScript) expect(scripts[t.afterScript], t.afterScript).toBeTypeOf('function');
  });
});

const { OBJECTIVES, currentObjective } = await import('./objective');
const { WORLD } = await import('../data/worldmap');
const { CREATURES } = await import('../data/creatures');
const { newGame } = await import('../state/game');

describe('next objective (Town Map)', () => {
  const fresh = () => newGame('Lou', 0, 'f', 'Feutre');
  it('a new game starts with the first step', () => expect(currentObjective(fresh())?.id).toBe(OBJECTIVES[0].id));
  it('every target is a place on the map', () => {
    for (const o of OBJECTIVES) expect(WORLD[o.target], `${o.id} → ${o.target}`).toBeDefined();
  });
  it('every flag a step waits for is set by the story', () => {
    for (const o of OBJECTIVES) for (const f of o.flags) expect(flagIsSet(f), `${o.id}: ${f}`).toBe(true);
  });
  it('advances one step at a time until everything is done', () => {
    const s = fresh();
    for (const o of OBJECTIVES) {
      expect(currentObjective(s)?.id).toBe(o.id);
      for (const f of o.flags) s.flags[f] = 1;
      if (o.id === 'dex') s.dex.caught = CREATURES.map((c) => c.id);
      expect(o.done(s), o.id).toBe(true);
    }
    expect(currentObjective(s)).toBeNull();
  });
  it('keeps texts short enough for one line or two', () => {
    for (const o of OBJECTIVES) for (const t of [o.text.fr, o.text.en]) {
      expect(t.replace(/\{(rival|name)\}/g, 'X'.repeat(10)).replace(/\{\w\}/g, '99').length, t).toBeLessThanOrEqual(56);
    }
    expect(new Set(OBJECTIVES.map((o) => o.id)).size).toBe(OBJECTIVES.length);
  });
});

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
  if (name.startsWith('tr:')) return !!TRAINERS[name.slice(3)];
  if (name.startsWith('badge:')) return Object.values(TRAINERS).some((t) => t.badge === name.slice(6));
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
      ].filter(Boolean) as string[];
      // flags of later acts (a2., a3.…) are allowed to be set by content not written yet
      for (const f of flags.filter((x) => !/^a[2-9]\./.test(x))) expect(flagIsSet(f), f).toBe(true);
    });
  }
  it('runs after-battle scripts that exist', () => {
    for (const t of Object.values(TRAINERS)) if (t.afterScript) expect(scripts[t.afterScript], t.afterScript).toBeTypeOf('function');
  });
});

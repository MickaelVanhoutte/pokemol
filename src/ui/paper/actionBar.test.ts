import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The menu rule (ActionBar, src/ui/paper/index.tsx): leaving a screen is « ◀ Retour », always at the bottom left,
 * the main action at the bottom right. Read from the sources, so a new screen can't put its own back button
 * somewhere else or call it something else.
 */
const UI = join(__dirname, '..');
const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : p.endsWith('.tsx') ? [p] : [];
});
const sources = files(UI).map((p) => ({ p: p.slice(UI.length + 1), s: readFileSync(p, 'utf8') }));

describe('menus: one place and one word to go back', () => {
  it('back buttons (pbtn--b) come from the ActionBar, apart from the battle panel and stopping an evolution', () => {
    const allowed = ['abar__back', 'bpanel__back', 'evo__stop'];
    const stray = sources.flatMap(({ p, s }) => [...s.matchAll(/class="pbtn pbtn--b ?([^"]*)"/g)]
      .filter((m) => !allowed.some((a) => m[1].includes(a)))
      .map((m) => `${p}: ${m[0]}`));
    expect(stray).toEqual([]);
  });

  it('no screen names its way out something else than « Retour »', () => {
    const words = /L\('(Sortir|Éteindre|Partir|Quitter|Fermer)', '[^']*'\)/;
    const found = sources.filter(({ s }) => words.test(s)).map(({ p, s }) => `${p}: ${s.match(words)![0]}`);
    expect(found).toEqual([]);
  });

  it('a Frame takes no back label and no footer of its own', () => {
    const odd = sources.filter(({ s }) => /<Frame[^>]*\b(backLabel|foot)=/.test(s)).map(({ p }) => p);
    expect(odd).toEqual([]);
  });
});

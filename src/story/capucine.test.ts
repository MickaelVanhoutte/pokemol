import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOOKS } from '../data/appearance';

// Capucine (Ville-Pastel): after giving Pandoudou, one Magic Pencil for each set of its forms she draws, as the
// shops start selling them. Played on a stand-in for the canvas game, every line answered at once.
vi.mock('../audio/sfx', () => ({ sfx: new Proxy({}, { get: () => () => undefined }) }));

const fake = vi.hoisted(() => ({ answers: [] as number[] }));
vi.mock('../overworld/controller', async (orig) => ({
  ...(await orig<typeof import('../overworld/controller')>()),
  getGame: () => ({ map: { def: { id: 'ville' } }, player: { x: 0, y: 0 } }),
}));

const { effect } = await import('@preact/signals');
const { closeDialog, dialog } = await import('../overworld/dialog');
const { scripts } = await import('../overworld/controller');
const { newGame, save } = await import('../state/game');
await import('./index');

const asked: string[][] = [];
effect(() => {
  const d = dialog.value;
  if (!d) return;
  if (d.choices) asked.push(d.choices);
  queueMicrotask(() => closeDialog(d.choices ? fake.answers.shift() ?? 0 : 0));
});

const BADGES = ['pastel', 'plume', 'aquarelle', 'fluo', 'braise', 'paillette', 'gouache', 'encre'];
function start(badges: number, flags: Record<string, number> = {}) {
  const d = newGame('Lou', DEFAULT_LOOKS.f, 'f', 'Feutre');
  d.badges = BADGES.slice(0, badges);
  Object.assign(d.flags, { 'gift:touffou': 1 }, flags);
  save.value = d;
  asked.length = 0;
}
const pencils = () => Object.keys(save.value!.bag).filter((k) => k.startsWith('crayon-magique-') && save.value!.bag[k]);

describe('Capucine’s magic pencils', () => {
  beforeEach(() => start(4));

  it('gives one of the first three at 4 badges, then nothing more until the next set', async () => {
    fake.answers = [1];
    await scripts.touffouGift();
    expect(asked[0]).toHaveLength(3);
    expect(pencils()).toEqual(['crayon-magique-feu']);
    await scripts.touffouGift();
    expect(pencils()).toHaveLength(1);
  });

  it('gives a Grass or Fairy pencil at 5 badges, a Psychic or Dark one at 6, and Ice after the ending', async () => {
    start(6, { 'gift:crayonMagique': 1 });
    fake.answers = [1, 1];
    await scripts.touffouGift();
    expect(asked[0]).toHaveLength(2);
    expect(pencils()).toEqual(['crayon-magique-fee']);
    await scripts.touffouGift();
    expect(pencils()).toContain('crayon-magique-tenebres');
    await scripts.touffouGift();
    expect(pencils()).toHaveLength(2);
    save.value!.flags.ending = 1;
    await scripts.touffouGift();
    expect(pencils()).toContain('crayon-magique-glace');
    expect(save.value!.flags['gift:crayonMagiqueGlace']).toBe(1);
  });

  it('a game reaching 5 badges without the first gift gets the first set first', async () => {
    start(5);
    await scripts.touffouGift();
    expect(asked[0]).toHaveLength(3);
    await scripts.touffouGift();
    expect(asked[1]).toHaveLength(2);
  });
});

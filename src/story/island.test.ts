import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOOKS } from '../data/appearance';

// The Bestiodex's reward: the Prof tells about the hidden island, the ferryman takes you there, the Great Inkwell
// waits over its lake. Scripts played on a stand-in for the canvas game, every line answered at once.
vi.mock('../audio/sfx', () => ({ sfx: new Proxy({}, { get: () => () => undefined }) }));

const fake = vi.hoisted(() => ({
  map: 'port',
  warps: [] as string[],
  battle: 'capture' as string,
  answers: [] as number[],
}));
vi.mock('../overworld/controller', async (orig) => ({
  ...(await orig<typeof import('../overworld/controller')>()),
  getGame: () => ({ map: { def: { id: fake.map } }, fadeTo: async () => undefined, player: { x: 0, y: 0 } }),
  warpTo: async (to: { map: string }) => void fake.warps.push(to.map),
  wait: async () => undefined,
  shake: async () => undefined,
  wildBattle: async () => fake.battle,
}));

const { effect } = await import('@preact/signals');
const { dialog } = await import('../overworld/dialog');
const { scripts } = await import('../overworld/controller');
const { CREATURES, DEX_GOAL } = await import('../data/creatures');
const { newGame, save } = await import('../state/game');
await import('./index');

const said: string[] = [];
const asked: string[][] = [];
effect(() => {
  const d = dialog.value;
  if (!d) return;
  said.push(d.text);
  if (d.choices) asked.push(d.choices);
  queueMicrotask(() => d.resolve(d.choices ? fake.answers.shift() ?? 0 : 0));
});

function start(flags: Record<string, number> = {}, complete = true) {
  const d = newGame('Lou', DEFAULT_LOOKS.f, 'f', 'Feutre');
  d.dex.caught = CREATURES.filter((c) => complete || c.id !== '108').filter((c) => c.id !== '112').map((c) => c.id);
  Object.assign(d.flags, { ending: 1, 'a3.note': 1 }, flags);
  save.value = d;
  said.length = 0;
  asked.length = 0;
  fake.warps = [];
  fake.map = 'port';
}
const text = () => said.join('\n');

describe('the Bestiodex complete opens a hidden island', () => {
  beforeEach(() => start());

  it('counts every species but its reward', () => {
    expect(DEX_GOAL).toBe(CREATURES.length - 1);
    expect(CREATURES.find((c) => c.id === '112')?.dexReward).toBe(true);
  });

  it('the Prof gives the diploma and tells about the island; a game that had the diploma hears about it too', async () => {
    await scripts.prof();
    expect(text()).toContain('Diplôme du Bestiodex');
    expect(text()).toContain('une île qu’on ne voit que quand on a tout dessiné');
    expect(save.value!.flags.ilePage).toBe(1);
    start({ dexDiploma: 1 });
    await scripts.prof();
    expect(text()).not.toContain('Diplôme du Bestiodex');
    expect(text()).toContain('Va demander au passeur');
  });

  it('waits for a complete Bestiodex', async () => {
    start({}, false);
    await scripts.prof();
    expect(save.value!.flags.ilePage).toBeUndefined();
  });

  it('the ferryman offers it once the Prof told about it, and brings you back', async () => {
    await scripts.passeur();
    expect(asked[0]).toHaveLength(2);
    expect(fake.warps).toEqual(['phareIle']);
    start({ ilePage: 1 });
    fake.answers = [1];
    await scripts.passeur();
    expect(asked[0]).toHaveLength(3);
    expect(fake.warps).toEqual(['ilePage']);
    fake.map = 'ilePage';
    await scripts.passeur();
    expect(fake.warps.at(-1)).toBe('port');
  });
});

describe('the Great Inkwell', () => {
  it('waits over its lake: caught, it is gone for good', async () => {
    start({ ilePage: 1 });
    await scripts.ilePageEnter();
    expect(save.value!.flags['away:baleincre']).toBe(0);
    expect(save.value!.flags['ile:visite']).toBe(1);
    fake.battle = 'capture';
    await scripts.baleincre();
    expect(text()).toContain('Le Grand Encrier');
    expect(save.value!.flags['static:baleincre']).toBe(1);
    expect(save.value!.flags['away:baleincre']).toBe(1);
  });

  it('knocked out, it comes back after a night', async () => {
    start({ ilePage: 1 });
    fake.battle = 'win';
    await scripts.baleincre();
    expect(save.value!.flags['away:baleincre']).toBe(1);
    save.value!.flags.nuits = (save.value!.flags.nuits ?? 0) + 1;
    await scripts.ilePageEnter();
    expect(save.value!.flags['away:baleincre']).toBe(0);
  });
});

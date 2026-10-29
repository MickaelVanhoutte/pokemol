import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOOKS } from '../data/appearance';

// A day in the real house: the Inn's night ends at home once a real day, one activity grows its level, the bed
// takes the player back to the Inn. Scripts played on a stand-in for the canvas game, every line answered at once.
vi.mock('../audio/sfx', () => ({ sfx: new Proxy({}, { get: () => () => undefined }) }));

const fake = vi.hoisted(() => ({ warps: [] as string[], answers: [] as number[] }));
vi.mock('../overworld/controller', async (orig) => ({
  ...(await orig<typeof import('../overworld/controller')>()),
  getGame: () => ({ map: { def: { id: 'centre' } }, fadeTo: async () => undefined, player: { x: 0, y: 0 } }),
  warpTo: async (to: { map: string }) => void fake.warps.push(to.map),
  wait: async () => undefined,
  dayPhase: () => 'day',
}));

const { effect } = await import('@preact/signals');
const { dialog } = await import('../overworld/dialog');
const { pictureOverlay, scripts } = await import('../overworld/controller');
const { localDay } = await import('../overworld/berries');
const { newGame, save } = await import('../state/game');
await import('./index');

const said: string[] = [];
effect(() => {
  const d = dialog.value;
  if (!d) return;
  // the space before ! ? : ; is non-breaking in French
  said.push(d.text.replace(/[\u00a0\u202f]/g, ' '));
  queueMicrotask(() => d.resolve(d.choices ? fake.answers.shift() ?? 0 : 0));
});
effect(() => {
  const p = pictureOverlay.value;
  if (!p) return;
  queueMicrotask(() => {
    pictureOverlay.value = null;
    p.resolve();
  });
});

function start(flags: Record<string, number> = {}) {
  const d = newGame('Lou', DEFAULT_LOOKS.f, 'f', 'Feutre');
  Object.assign(d.flags, { ending: 1, 'reveil:dodo': 1, 'reveil:bisou': 1 }, flags);
  d.player.returnTo = { map: 'ville', x: 10, y: 10, facing: 'down' };
  save.value = d;
  said.length = 0;
  fake.warps = [];
  fake.answers = [];
}
const f = () => save.value!.flags;

describe('a day in the real house', () => {
  beforeEach(() => start());

  it('starts with the first night at an Inn of the real day', async () => {
    await scripts.innBed();
    expect(fake.warps).toEqual(['chambre']);
    expect(f()).toMatchObject({ 'reel:visite': 1, 'reel:jour': localDay(), 'reel:fait': 0 });
    expect(said.join('\n')).toContain('Tu es dans ta vraie chambre');
    // the Inn is where the dream takes the player back
    expect(save.value!.respawn.map).toBe('centre');
    // a second night the same day stays in Papeterre
    f()['reel:visite'] = 0;
    fake.warps = [];
    await scripts.innBed();
    expect(fake.warps).toEqual([]);
  });

  it('lets the player do one thing, which grows its level, then sends them back to the Inn', async () => {
    await scripts.innBed();
    said.length = 0;
    await scripts.desk();
    expect(said[0]).toContain('S’entraîner au dessin ? Dessin ○○○○○ → capture +3 %.');
    expect(f()['reel:dessin']).toBe(1);
    expect(f()['reel:fait']).toBe(1);
    expect(said.join('\n')).toContain('Dessin ●○○○○ ! Dans Papeterre : capture +3 %.');
    // nothing else today
    said.length = 0;
    await scripts.livresReel();
    expect(f()['reel:livre']).toBeUndefined();
    expect(said.join('\n')).toContain('Tu as déjà fait quelque chose aujourd’hui');
    // back to bed, back to the Inn of the town it was in
    fake.warps = [];
    await scripts.litReel();
    expect(fake.warps).toEqual(['centre']);
    expect(f()['reel:visite']).toBe(0);
    expect(save.value!.player.returnTo?.map).toBe('ville');
  });

  it('counts saying no as nothing done', async () => {
    await scripts.innBed();
    fake.answers = [1];
    await scripts.mamanReelle();
    expect(f()['reel:parents']).toBeUndefined();
    expect(f()['reel:fait']).toBe(0);
    await scripts.mamanReelle();
    expect(f()['reel:parents']).toBe(1);
  });

  it('keeps a level at its best, and stops waking up once all four are', async () => {
    start({ 'reel:fenetre': 5 });
    await scripts.innBed();
    said.length = 0;
    await scripts.fenetre();
    expect(f()['reel:fenetre']).toBe(5);
    expect(f()['reel:fait']).toBe(0);
    expect(said.join('\n')).toContain('Ton imagination déborde');
    start({ 'reel:dessin': 5, 'reel:fenetre': 5, 'reel:livre': 5, 'reel:parents': 5 });
    await scripts.innBed();
    expect(fake.warps).toEqual([]);
  });

  it('stays in the house when the game is loaded there, and goes home after the very first ending visit', async () => {
    start({ 'reel:visite': 1 });
    await scripts.ending();
    expect(fake.warps).toEqual([]);
    start();
    await scripts.ending();
    expect(fake.warps).toEqual(['maison']);
  });
});

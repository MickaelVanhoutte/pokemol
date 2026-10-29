import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOOKS } from '../data/appearance';

// Later scenes that remember a choice, and what the ending leaves behind: the scripts are played with every
// line and picture answered at once, on a stand-in for the canvas game.
vi.mock('../audio/sfx', () => ({ sfx: new Proxy({}, { get: () => () => undefined }) }));

type FakeActor = { id: string; x: number; y: number; dir: string; mini?: unknown };
const game = vi.hoisted(() => ({
  player: { id: 'player', x: 4, y: 4, dir: 'up' } as FakeActor,
  follower: null as null | { x: number; y: number; dir: string; img: unknown },
  npcs: [] as FakeActor[],
  followerShown() { return !!this.follower; },
  blocked: () => false,
  spawn(id: string, _look: unknown, x: number, y: number, dir: string): FakeActor {
    const a = { id, x, y, dir };
    this.npcs.push(a);
    return a;
  },
  walk: async () => undefined,
  faceToward: () => undefined,
  remove(id: string) { this.npcs = this.npcs.filter((n) => n.id !== id); },
  npc(id: string) { return this.npcs.find((n) => n.id === id); },
}));
vi.mock('../overworld/controller', async (orig) => ({
  ...(await orig<typeof import('../overworld/controller')>()),
  getGame: () => game,
  bubble: async () => undefined,
}));

const { effect } = await import('@preact/signals');
const { dialog } = await import('../overworld/dialog');
const { pictureOverlay, scripts } = await import('../overworld/controller');
const { TRAINERS } = await import('../data/trainers');
const { createMon } = await import('../engine/pk/creature');
const { newGame, save } = await import('../state/game');
const { COCONFUS, cocoonRemembers } = await import('./choices');
await import('./index');

const said: string[] = [];
const pictures: { src: string; caption: string }[] = [];
effect(() => {
  const d = dialog.value;
  if (!d) return;
  said.push(d.text);
  queueMicrotask(() => d.resolve(0));
});
effect(() => {
  const p = pictureOverlay.value;
  if (!p) return;
  pictures.push({ src: p.src, caption: p.caption });
  queueMicrotask(() => {
    pictureOverlay.value = null;
    p.resolve();
  });
});

function start(flags: Record<string, number> = {}, party: string[] = []) {
  const d = newGame('Lou', DEFAULT_LOOKS.f, 'f', 'Feutre');
  d.party = party.map((s, i) => createMon(s, 40, { rng: i + 1 }));
  Object.assign(d.flags, flags);
  save.value = d;
  said.length = 0;
  pictures.length = 0;
  game.follower = null;
  game.npcs = [];
}
const text = () => said.join('\n');

describe('Coconfus remembers Route 1 at the Eraser Factory', () => {
  beforeEach(() => start());

  it('holds out the cheek you wiped, or touches the mark you told it to keep', async () => {
    start({ 'choix:tache': 1, 'choix:tache:a': 1 }, ['001', COCONFUS]);
    await cocoonRemembers();
    expect(text()).toContain('Tu l’essuies doucement');
    start({ 'choix:tache': 2, 'choix:tache:b': 1 }, ['001', COCONFUS]);
    await cocoonRemembers();
    expect(text()).toContain('elle lui va toujours aussi bien');
    expect(said).toHaveLength(2);
  });

  it('still comes to a save that never met it on Route 1', async () => {
    start({}, [COCONFUS]);
    await cocoonRemembers();
    expect(text()).toContain('jusqu’à ce qu’il arrête de trembler');
  });

  it('is the follower itself when it leads the team, and the follower comes back after', async () => {
    start({ 'choix:tache:b': 1 }, [COCONFUS]);
    const f = { x: 4, y: 5, dir: 'up', img: 'mini' };
    game.follower = f;
    const seen: (FakeActor | undefined)[] = [];
    const spawn = game.spawn.bind(game);
    game.spawn = (...args: Parameters<typeof spawn>) => {
      const a = spawn(...args);
      seen.push(a);
      expect(game.follower).toBeNull();
      return a;
    };
    await cocoonRemembers();
    game.spawn = spawn;
    expect(seen[0]).toMatchObject({ x: 4, y: 5, mini: 'mini' });
    expect(game.follower).toBe(f);
    expect(game.npcs).toHaveLength(0);
  });

  it('stays quiet when Coconfus is not in the party', async () => {
    start({ 'choix:tache:a': 1 }, ['001']);
    await cocoonRemembers();
    expect(said).toHaveLength(0);
  });
});

describe('the fortress admins remember what you did with their damage', () => {
  it('runs after the battles with Rature and Buvard', () => {
    expect(TRAINERS.rature3.afterScript).toBe('ratureTraits');
    expect(TRAINERS.buvard2.afterScript).toBe('buvardFresque');
  });

  it('Rature: Ville-Feutre coloured over his lines, or kept them for hopscotch (choice 4)', async () => {
    start({ 'choix:feutre': 1, 'choix:feutre:a': 1 });
    await scripts.ratureTraits();
    expect(text()).toContain('recolorié par-dessus mes traits');
    start({ 'choix:feutre': 2, 'choix:feutre:b': 1 });
    await scripts.ratureTraits();
    expect(text()).toContain('marelle');
  });

  it('Buvard: the blot painted over with more stars, or turned into a moon (choice 6)', async () => {
    start({ 'choix:encre': 1, 'choix:encre:a': 1 });
    await scripts.buvardFresque();
    expect(text()).toContain('encore plus d’étoiles');
    start({ 'choix:encre': 2, 'choix:encre:b': 1 });
    await scripts.buvardFresque();
    expect(text()).toContain('Ma tache est devenue une lune');
  });

  it('say nothing more to a save that skipped those choices', async () => {
    start();
    await scripts.ratureTraits();
    await scripts.buvardFresque();
    expect(said).toHaveLength(0);
  });
});

describe('the margin of the real sketchbook (choice 7)', () => {
  it('shows the drafts of the hamlet, coloured in or left unfinished', async () => {
    start({ ending: 1, 'choix:hameau': 1, 'choix:hameau:a': 1 });
    await scripts.desk();
    expect(said[1]).toContain('mains toutes neuves');
    start({ ending: 1, 'choix:hameau': 2, 'choix:hameau:b': 1 });
    await scripts.desk();
    expect(said[1]).toContain('une seule oreille');
  });

  it('keeps the desk as it was for a save without that choice', async () => {
    start({ ending: 1 });
    await scripts.desk();
    expect(said).toHaveLength(1);
  });
});

describe('after the ending, the Prof photographs what Coconfus became', () => {
  it('takes its picture once, and the photo hangs on the lab wall', async () => {
    for (const [fin, into, line] of [[1, '071', 'vitrail'], [2, '072', 'brillent comme des étoiles']] as const) {
      start({ ending: 1, fin }, ['001', into]);
      await scripts.prof();
      expect(pictures).toHaveLength(1);
      expect(pictures[0].src).toContain(`/cards/${into}-`);
      expect(pictures[0].caption).toContain('Photo du Prof. Fusain');
      expect(text()).toContain(line);
      expect(save.value!.flags['prof:photo']).toBe(1);
      // both endings get the same scene: three lines and one photo
      expect(said).toHaveLength(3);
      said.length = 0;
      pictures.length = 0;
      await scripts.prof();
      expect(pictures).toHaveLength(0);
      await scripts.labPhoto();
      expect(pictures[0].src).toContain(`/cards/${into}-`);
    }
  });

  it('asks for it when it is in the PC', async () => {
    start({ ending: 1, fin: 2 }, ['001']);
    save.value!.boxes[0].push(createMon('072', 45, { rng: 9 }));
    await scripts.prof();
    expect(said[0]).toContain('Amène-le-moi');
    expect(pictures).toHaveLength(0);
    expect(save.value!.flags['prof:photo']).toBeUndefined();
  });

  it('waits for the ending, and for an ending that chose a form', async () => {
    start({ ending: 1 }, ['001', '071']);
    await scripts.prof();
    expect(pictures).toHaveLength(0);
    start({}, ['001', '071']);
    await scripts.labPhoto();
    expect(pictures).toHaveLength(0);
  });
});

/**
 * The choices along the story that lead to one ending or the other (docs/story.md, "The two endings").
 * Each is a doubt the player answers: touch the drawing up to make it better (1, the Libellune ending)
 * or keep it as it is, imperfect and unique (2, the Noctaile ending). The answer to the Great Eraser
 * counts double; a tie (a save that missed some choices) goes to that last answer.
 */
import { L, type LText } from '../i18n';
import type { Mon } from '../engine/pk/creature';
import type { Dir, SaveData } from '../save/schema';
import { DIRS, TILE, type Actor } from '../overworld/game';
import { isWater, tile } from '../overworld/tiles';
import { LOOKS, type Look } from '../overworld/sprites';
import { ask, bubble, getGame, giveMon, offerNickname, say, setFlag } from '../overworld/controller';
import { allMons, save } from '../state/game';

/** The story's choices, in the order you meet them; 'final' is the answer to the Great Eraser. */
export const CHOICES = ['tache', 'musee', 'pont', 'feutre', 'rival', 'encre', 'hameau'] as const;
export type ChoiceId = (typeof CHOICES)[number] | 'final';
/** Touch it up and do better: Libellune. */
export const RETOUCHE = 1;
/** Keep it as it is: Noctaile. */
export const GARDE = 2;
export type Way = typeof RETOUCHE | typeof GARDE;

export const COCONFUS = '073';

const answer = (flags: SaveData['flags'], id: ChoiceId): Way | 0 => {
  const v = flags[`choix:${id}`];
  return v === RETOUCHE || v === GARDE ? v : 0;
};

/** Votes for each ending so far: one per story choice, two for the final answer. */
export function tally(flags: SaveData['flags']): { a: number; b: number } {
  let a = 0, b = 0;
  for (const id of [...CHOICES, 'final', 'final'] as ChoiceId[]) {
    const v = answer(flags, id);
    if (v === RETOUCHE) a++;
    else if (v === GARDE) b++;
  }
  return { a, b };
}

/** The ending the choices lead to: the majority, or the final answer on a tie. */
export function endingOf(flags: SaveData['flags']): Way {
  const { a, b } = tally(flags);
  if (a !== b) return a > b ? RETOUCHE : GARDE;
  return answer(flags, 'final') || RETOUCHE;
}

/** Coconfus wherever it is: the party, a PC box or the daycare. */
export function findCoconfus(d: SaveData): Mon | undefined {
  return allMons(d).find((m) => m.species === COCONFUS) ?? d.daycare?.slots.find((s) => s.mon.species === COCONFUS)?.mon;
}

const inParty = () => !!save.value?.party.some((m) => m.species === COCONFUS);

/** How Coconfus reacts to an answer (when it is there to see it). */
export async function cocoonReacts(way: Way) {
  await say(way === RETOUCHE
    ? L('Coconfus frissonne. Une petite lueur rose traverse son cocon…', 'Muddlecoon shivers. A little pink glow runs through its cocoon…')
    : L('Coconfus frissonne. Une jolie spirale se dessine sur son cocon, comme un motif…', 'Muddlecoon shivers. A pretty spiral draws itself on its cocoon, like a pattern…'));
}

/**
 * Asks one of the story's choices: `a` touches it up, `b` keeps it as it is. Sets `choix:<id>` (1 or 2,
 * counted by `tally`) and `choix:<id>:a` or `:b` for the maps that show its consequence.
 */
export async function choose(id: ChoiceId, question: LText, a: LText, b: LText, speaker?: LText, react = inParty()): Promise<Way> {
  const way: Way = (await ask(question, [a, b], speaker)) === 0 ? RETOUCHE : GARDE;
  setFlag(`choix:${id}`, way);
  setFlag(`choix:${id}:${way === RETOUCHE ? 'a' : 'b'}`);
  if (react) await cocoonReacts(way);
  return way;
}

/**
 * Rubbed pale at the Eraser Factory, Coconfus (when it is in the party) huddles up against you, and remembers
 * Route 1 (the first choice): it holds out the cheek you wiped, or touches the eraser mark you told it to keep.
 * When it is the follower, it is the follower that comes.
 */
export async function cocoonRemembers() {
  const d = save.value;
  if (!d || !inParty()) return;
  const g = getGame();
  const lead = d.party.find((m) => !m.egg && m.hp > 0);
  const f = g.followerShown() && lead?.species === COCONFUS ? g.follower : null;
  let a: Actor;
  if (f) {
    g.follower = null;
    a = g.spawn('coconUsine', LOOKS.kid, f.x, f.y, f.dir, COCONFUS);
    a.mini = f.img;
  } else {
    a = await comeUp('coconUsine', LOOKS.kid, COCONFUS);
  }
  // beside you rather than right behind, so its little heart doesn't hide your face
  const { x, y } = g.player;
  const side = [-1, 1].find((dx) => a.x === x && a.y === y + 1 && !g.blocked(x + dx, y + 1) && !g.blocked(x + dx, y));
  if (side) await g.walk(a, [side < 0 ? 'left' : 'right', 'up'], 200);
  g.faceToward(a, g.player);
  g.faceToward(g.player, a);
  await say(L('Coconfus se serre contre toi, tout pâle. Il tremble.', 'Muddlecoon huddles up against you, all pale. It’s trembling.'));
  if (d.flags['choix:tache:a']) await say(L('Il te tend sa joue, comme sur le Chemin des Crayons. Tu l’essuies doucement… même s’il n’y a plus rien à essuyer.', 'It holds out its cheek, like on Crayon Road. You wipe it gently… even though there’s nothing left to wipe.'));
  else if (d.flags['choix:tache:b']) await say(L('Il touche sa trace de gomme, toute pâle elle aussi, et il te regarde. Tu lui souris : elle lui va toujours aussi bien.', 'It touches its eraser mark, all pale too, and looks at you. You smile at it: it still suits it just as well.'));
  else await say(L('Tu le serres contre toi, jusqu’à ce qu’il arrête de trembler.', 'You hold it close until it stops trembling.'));
  await bubble(a.id, '♥', 900);
  if (f) {
    // back to its place behind you, where it becomes the follower again
    if (side) await g.walk(a, ['down', side < 0 ? 'right' : 'left'], 200);
    g.remove(a.id);
    g.follower = f;
  } else {
    await goAway(a);
  }
}

/** Coconfus comes up to you (when it is on the map) and joins the team. */
export async function coconfusJoins(level: number, actor?: Actor) {
  const g = getGame();
  if (actor) {
    for (let i = 0; i < 4 && Math.abs(actor.x - g.player.x) + Math.abs(actor.y - g.player.y) > 1; i++) {
      const dx = g.player.x - actor.x, dy = g.player.y - actor.y;
      await g.walk(actor, [Math.abs(dy) >= Math.abs(dx) ? (dy > 0 ? 'down' : 'up') : dx > 0 ? 'right' : 'left'], 200);
    }
    g.faceToward(actor, g.player);
    g.faceToward(g.player, actor);
  }
  const full = (save.value?.party.length ?? 0) >= 6;
  const m = giveMon(COCONFUS, level);
  setFlag('gift:coconfus');
  if (actor) g.remove(actor.id);
  await say(full
    ? L('Coconfus rejoint ton équipe ! Il est envoyé dans le PC.', 'Muddlecoon joined your team! It was sent to the PC.')
    : L('Coconfus rejoint ton équipe !', 'Muddlecoon joined your team!'));
  await offerNickname(m.uid);
}

/** The tiles on screen around the player now, as the camera frames them (`Game.render`). */
function onScreen(): (x: number, y: number) => boolean {
  const g = getGame(), p = g.player;
  const mapW = g.map.w * TILE, mapH = g.map.h * TILE;
  const camX = mapW <= g.viewW ? (mapW - g.viewW) / 2 : Math.min(Math.max(p.x * TILE + 8 - g.viewW / 2, 0), mapW - g.viewW);
  const camY = mapH <= g.viewH ? (mapH - g.viewH) / 2 : Math.min(Math.max(p.y * TILE + 8 - g.viewH / 2, 0), mapH - g.viewH);
  const x0 = Math.floor(camX / TILE), x1 = Math.floor((camX + g.viewW - 1) / TILE);
  const y0 = Math.floor(camY / TILE), y1 = Math.floor((camY + g.viewH - 1) / TILE);
  return (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

/** A tile someone can walk along in a cut-scene: no tree, wall, water, ledge, obstacle, item or other actor. */
function walkable(x: number, y: number, who?: Actor): boolean {
  const g = getGame();
  if (g.blocked(x, y, who)) return false;
  const t = g.tileAt(x, y);
  return !isWater(t) && !tile(t).ledge;
}

/**
 * The shortest walk (as steps) between `from` and the nearest tile `goal` accepts, around trees and walls, or null.
 * A warp tile is never crossed, only reached when it is the goal (a door someone leaves by).
 */
function pathTo(from: { x: number; y: number }, goal: (x: number, y: number) => boolean, who?: Actor, max = 60): Dir[] | null {
  const g = getGame(), w = g.map.w;
  const prev = new Map<number, [number, Dir]>([[from.y * w + from.x, [-1, 'up']]]);
  let ring = [[from.x, from.y]];
  for (let d = 0; d < max && ring.length; d++) {
    const next: number[][] = [];
    for (const [x, y] of ring) {
      for (const dir of ['up', 'down', 'left', 'right'] as Dir[]) {
        const [dx, dy] = DIRS[dir];
        const nx = x + dx, ny = y + dy, k = ny * w + nx;
        if (!g.inside(nx, ny) || prev.has(k)) continue;
        const warp = g.map.warps.has(k);
        if (warp ? !goal(nx, ny) || g.blocked(nx, ny, who) : !walkable(nx, ny, who)) continue;
        prev.set(k, [y * w + x, dir]);
        if (goal(nx, ny)) {
          const steps: Dir[] = [];
          for (let c = k; prev.get(c)![0] >= 0; c = prev.get(c)![0]) steps.unshift(prev.get(c)![1]);
          return steps;
        }
        if (!warp) next.push([nx, ny]);
      }
    }
    ring = next;
  }
  return null;
}

const BACK: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const isDoor = (x: number, y: number) => { const g = getGame(); return g.map.warps.has(y * g.map.w + x); };

/**
 * Someone comes up to the player for a cut-scene: they start off screen (or at the door, in a room that fits the
 * screen) and walk in around the trees to the tile beside the player. Never popping up in view.
 */
export async function comeUp(id: string, look: Look, mon?: string, ms = 190): Promise<Actor> {
  const g = getGame(), p = g.player;
  const seen = onScreen();
  // the walk from the player out to the nearest unseen tile, played backwards
  const out = pathTo(p, (x, y) => !seen(x, y), p) ?? pathTo(p, isDoor, p);
  if (out && out.length >= 2) {
    let x = p.x, y = p.y;
    for (const d of out) { x += DIRS[d][0]; y += DIRS[d][1]; }
    const back = out.slice(1).reverse().map((d) => BACK[d]);
    const a = g.spawn(id, look, x, y, back[0] ?? BACK[out[0]], mon);
    await g.walk(a, back, ms);
    g.faceToward(a, p);
    g.faceToward(p, a);
    return a;
  }
  // nowhere to come from (a tiny room): beside the player
  const [dx, dy] = ([[0, 1], [0, -1], [-1, 0], [1, 0]] as const).find(([a, b]) => !g.blocked(p.x + a, p.y + b)) ?? [0, 1];
  const a = g.spawn(id, look, p.x + dx, p.y + dy, 'up', mon);
  g.faceToward(a, p);
  g.faceToward(p, a);
  return a;
}

/**
 * The end of a cut-scene: someone walks off around the trees until they are off screen (or out by the door, in a
 * room that fits the screen), and only then is gone. `route` says which way they would rather go (towards the
 * Atelier, up the road): the nearest unseen tile that way, unless it is much further.
 */
export async function goAway(a: Actor, route: Dir[] = []) {
  const g = getGame();
  const seen = onScreen();
  const pref = route[0];
  const toward = pref
    ? pathTo(a, (x, y) => !seen(x, y) && (pref === 'up' ? y < a.y : pref === 'down' ? y > a.y : pref === 'left' ? x < a.x : x > a.x), a)
    : null;
  const any = pathTo(a, (x, y) => !seen(x, y), a);
  const steps = (toward && (!any || toward.length <= any.length + 10) ? toward : any) ?? pathTo(a, isDoor, a);
  if (steps) await g.walk(a, steps, 180);
  g.remove(a.id);
}

/** Walks `a` around the trees to (x, y). False when there is no way there. */
export async function walkTo(a: Actor, x: number, y: number, ms = 180): Promise<boolean> {
  if (a.x === x && a.y === y) return true;
  const steps = pathTo(a, (tx, ty) => tx === x && ty === y, a);
  if (steps) await getGame().walk(a, steps, ms);
  return !!steps;
}

/** An actor already on the map leaves the scene the same way: off screen, then gone. */
export const walkOff = (id: string, route: Dir[] = []) => {
  const a = getGame().npc(id);
  return a ? goAway(a, route) : Promise.resolve();
};

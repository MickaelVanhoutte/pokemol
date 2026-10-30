/**
 * The choices along the story that lead to one ending or the other (docs/story.md, "The two endings").
 * Each is a doubt the player answers: touch the drawing up to make it better (1, the Libellune ending)
 * or keep it as it is, imperfect and unique (2, the Noctaile ending). The answer to the Great Eraser
 * counts double; a tie (a save that missed some choices) goes to that last answer.
 */
import { L, type LText } from '../i18n';
import type { Mon } from '../engine/pk/creature';
import type { Dir, SaveData } from '../save/schema';
import { DIRS, type Actor } from '../overworld/game';
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
  g.remove(a.id);
  if (f) g.follower = f;
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

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
/** The way each actor brought on by `comeUp` walked in, so that it leaves the same way. */
const cameFrom = new WeakMap<Actor, Dir>();

/** How many free tiles in a row from (x, y) towards `dir`, up to `max` (an actor never stops on a warp). */
function freeRun(x: number, y: number, dir: Dir, max: number, who?: Actor): number {
  const g = getGame();
  const [dx, dy] = DIRS[dir];
  let n = 0;
  while (n < max) {
    const tx = x + (n + 1) * dx, ty = y + (n + 1) * dy;
    if (g.blocked(tx, ty, who) || g.map?.warps.has(ty * g.map.w + tx)) break;
    n++;
  }
  return n;
}

/**
 * Someone comes up to the player for a cut-scene: they walk in from a few tiles away (the longest free way, up to
 * five tiles, below first), or appear right beside the player when there is no room.
 */
export async function comeUp(id: string, look: Look, mon?: string): Promise<Actor> {
  const g = getGame();
  const { x, y } = g.player;
  const ways = (['down', 'up', 'left', 'right'] as const).map((d) => ({ d, n: freeRun(x, y, d, 5) })).filter((w) => w.n >= 2);
  const best = ways.sort((a, b) => b.n - a.n)[0];
  if (best) {
    const [dx, dy] = DIRS[best.d];
    const toward = OPPOSITE[best.d];
    const a = g.spawn(id, look, x + best.n * dx, y + best.n * dy, toward, mon);
    cameFrom.set(a, best.d);
    await g.walk(a, Array(best.n - 1).fill(toward), 200);
    g.faceToward(g.player, a);
    return a;
  }
  const [dx, dy] = ([[0, 1], [0, -1], [-1, 0], [1, 0]] as const).find(([a, b]) => !g.blocked(x + a, y + b)) ?? [0, 1];
  const a = g.spawn(id, look, x + dx, y + dy, 'up', mon);
  g.faceToward(a, g.player);
  g.faceToward(g.player, a);
  return a;
}

/**
 * The end of a cut-scene: someone walks off and is gone, never vanishing on the spot. They take `route` first
 * (steps that are blocked are skipped), then keep going the same way (or the way they came, or any free way)
 * until eight steps out.
 */
export async function goAway(a: Actor, route: Dir[] = []) {
  const g = getGame();
  let steps = 0;
  for (const d of route) {
    if (freeRun(a.x, a.y, d, 1, a) < 1) continue;
    await g.walk(a, [d], 180);
    steps++;
  }
  const last = route.length ? route[route.length - 1] : undefined;
  const ways = [last, cameFrom.get(a), 'down', 'up', 'left', 'right'].filter((d): d is Dir => !!d);
  const away = ways.find((d) => freeRun(a.x, a.y, d, 1, a) > 0);
  if (away) {
    const n = freeRun(a.x, a.y, away, 8 - steps, a);
    if (n) await g.walk(a, Array(n).fill(away), 180);
  }
  g.remove(a.id);
}

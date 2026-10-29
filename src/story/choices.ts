/**
 * The choices along the story that lead to one ending or the other (docs/story.md, "The two endings").
 * Each is a doubt the player answers: touch the drawing up to make it better (1, the Libellune ending)
 * or keep it as it is, imperfect and unique (2, the Noctaile ending). The answer to the Great Eraser
 * counts double; a tie (a save that missed some choices) goes to that last answer.
 */
import { L, type LText } from '../i18n';
import type { Mon } from '../engine/pk/creature';
import type { SaveData } from '../save/schema';
import type { Actor } from '../overworld/game';
import type { Look } from '../overworld/sprites';
import { ask, getGame, giveMon, offerNickname, say, setFlag } from '../overworld/controller';
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

/**
 * Someone comes up to the player for a cut-scene: spawned two free tiles away (below first) and walking one
 * step closer, or right beside the player when there is no room.
 */
export async function comeUp(id: string, look: Look, mon?: string): Promise<Actor> {
  const g = getGame();
  const { x, y } = g.player;
  for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]] as const) {
    if (g.blocked(x + dx, y + dy) || g.blocked(x + 2 * dx, y + 2 * dy)) continue;
    const a = g.spawn(id, look, x + 2 * dx, y + 2 * dy, dy > 0 ? 'up' : dy < 0 ? 'down' : dx > 0 ? 'left' : 'right', mon);
    await g.walk(a, [dy > 0 ? 'up' : dy < 0 ? 'down' : dx > 0 ? 'left' : 'right'], 200);
    g.faceToward(g.player, a);
    return a;
  }
  const [dx, dy] = ([[0, 1], [0, -1], [-1, 0], [1, 0]] as const).find(([a, b]) => !g.blocked(x + a, y + b)) ?? [0, 1];
  const a = g.spawn(id, look, x + dx, y + dy, 'up', mon);
  g.faceToward(a, g.player);
  g.faceToward(g.player, a);
  return a;
}

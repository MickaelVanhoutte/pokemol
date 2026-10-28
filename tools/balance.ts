/**
 * Balance check: simulated trainer battles along the story, AI against AI.
 *
 *   npm run balance                 # normal difficulty, 300 fights per row
 *   npm run balance -- hard 100     # another difficulty / fewer fights
 *
 * The player side is played by the trainer AI looking at a mirrored state; it uses no items,
 * so real players (with potions) do a bit better. Each row prints the win rate for each starter
 * (Minousse 001, Braisou 002, Clapotin 003) with a typical team for that point of the story.
 * Team make-up changes the numbers a lot, so compare runs before and after a change rather than
 * chasing exact values. Targets on Normal: Act 1 route trainers mostly won by the starter alone,
 * leaders roughly 40–90% with a team, the last fights of the game harder. The Grand Concours rows
 * (post-game) use a level 58 team: each Grand Maître mostly won, the champion around 60–80%.
 * From Zélie on the player has the Feutre d'Or: both sides make their ace a fair copy (« mise au propre »)
 * when they have one and the trainer has a Feutre. The player, like a real one, waits for a turn its new type
 * doesn't leave it weaker to the Bestiole in front of it.
 */
import { act, activeMon, createBattle, type Action, type BattleState, type SideSetup } from '../src/engine/pk/battle.ts';
import { aiChoose } from '../src/engine/pk/ai.ts';
import { createMon, type Mon } from '../src/engine/pk/creature.ts';
import { DIFFICULTY, RIVAL_COUNTER, TRAINERS, partyOf, rivalFinalTeam } from '../src/data/trainers.ts';
import { grownForm } from '../src/data/creatures.ts';
import { monTypes } from '../src/data/fairCopies.ts';
import { effectiveness } from '../src/data/types.ts';
import type { TypeId } from '../src/data/schema.ts';
import { CONCOURS } from '../src/data/postgame.ts';
import { curve } from '../src/data/curve.ts';
import type { Difficulty } from '../src/state/prefs.ts';

type Team = [species: string, level: number][];

const L = (s: string) => ({ fr: s, en: s });

type Pens = { me?: SideSetup['fairCopy']; foe?: SideSetup['fairCopy'] };

/** The player's choice: the trainer AI on a mirrored state, keeping the fair copy for a turn it doesn't hurt. */
function playerChoice(st: BattleState): Action {
  const a = aiChoose({ ...st, sides: [st.sides[1], st.sides[0]] as BattleState['sides'] });
  if (a.type !== 'move' || !a.fair) return a;
  const me = activeMon(st.sides[0]), foe = monTypes(activeMon(st.sides[1]));
  const worst = (types: TypeId[]) => Math.max(...foe.map((t) => effectiveness(t, types)));
  return worst(monTypes({ ...me, fair: true })) > worst(monTypes(me)) ? { ...a, fair: undefined } : a;
}

function winRate(player: (seed: number) => Mon[], enemy: (seed: number) => Mon[], slip: number, n: number, pens: Pens = {}): number {
  let wins = 0;
  for (let seed = 1; seed <= n; seed++) {
    let st = createBattle({
      kind: 'trainer',
      seed: seed * 7919,
      player: { name: L('player'), party: player(seed), isAI: false, fairCopy: pens.me },
      enemy: { name: L('trainer'), party: enemy(seed), isAI: true, fairCopy: pens.foe },
    }).state;
    for (let guard = 0; !st.result && guard < 300; guard++) {
      let a: Action;
      if (st.learnQueue.length) a = { type: 'learn', forget: null };
      else if (st.needSwitch) a = { type: 'replace', to: st.sides[0].party.findIndex((m) => m.hp > 0) };
      else a = playerChoice(st);
      st = act(st, a, aiChoose(st, slip)).state;
    }
    if (st.result === 'win') wins++;
  }
  return wins / n;
}

const difficulty = (process.argv[2] ?? 'normal') as Difficulty;
const n = Number(process.argv[3] ?? 300);
// optional third argument: only these rows, e.g. `npm run balance -- normal 300 effaceur,gcFusain`
const only = process.argv[4]?.split(',');
if (!DIFFICULTY[difficulty]) throw new Error(`unknown difficulty ${difficulty} (easy | normal | hard)`);

/** Starter ('S') at `lv`, then teammates a few levels below it. */
const MATES = ['013', '009', '004', '006', '007'];
function team(lv: number, size: number, gap = 3): Team {
  const mates = MATES.slice(0, size - 1).map((sp): [string, number] => [sp === '009' && lv - gap >= 16 ? '010' : sp, lv - gap]);
  return [['S', lv], ...mates];
}

// [trainer id, player team] in story order. The player's levels come from the level curve
// (src/data/curve.ts): every trainer on the way and the wild battles you can't avoid, no grinding.
// Trainers off the curve's path (the cycling track, the finale) keep a level written here.
const CURVE = new Map(curve(difficulty).rows.map((r) => [r.trainer, r]));
/** How a player's teammate has grown by `lv`: level evolutions, and from L20 the electric Magic Pencil and friendship. */
function grown(id: string, lv: number): string {
  const g = grownForm(id, lv);
  if (lv >= 20 && g === '004') return '027';
  if (lv >= 20 && g === '006') return '028';
  return g;
}

/** The starter and the best `size - 1` teammates at this trainer (`species` replaces the usual mates). */
function teamAt(id: string, size: number, species = MATES): Team {
  const r = CURVE.get(id);
  if (!r) throw new Error(`${id} is not on the curve's path`);
  const mates = [...r.mates].sort((a, b) => b - a).slice(0, size - 1);
  // teammates have grown like the starter (an evolution stone counts as found by then)
  return [['S', r.starter], ...mates.map((lv, i): [string, number] => [grown(species[i], lv), lv])];
}

const STEPS: [string, Team][] = [
  ['iris', teamAt('iris', 1)],
  ['leo', teamAt('leo', 1)],
  ['pastelT1', teamAt('pastelT1', 1)],
  ['pastelT2', teamAt('pastelT2', 1)],
  ['mireille', teamAt('mireille', 1)],
  ['mireille', teamAt('mireille', 2, ['006'])],
  ['pierrot', teamAt('pierrot', 2)],
  ['luna', teamAt('luna', 2)],
  ['gomme2', teamAt('gomme2', 2)],
  ['gaspard', teamAt('gaspard', 3)],
  ['max', teamAt('max', 3)],
  ['tom', teamAt('tom', 3)],
  ['r3lise', teamAt('r3lise', 3)],
  ['marine', teamAt('marine', 4)],
  ['r4tim', teamAt('r4tim', 4)],
  ['rature', teamAt('rature', 4)],
  ['zelie', teamAt('zelie', 5)],
  ['mfErmite', teamAt('mfErmite', 5)],
  ['ambre', teamAt('ambre', 5)],
  ['ambre', teamAt('ambre', 5, ['003', '013', '010', '004'])],
  ['celestine', teamAt('celestine', 5)],
  ['blanche', teamAt('blanche', 6)],
  ['basile', teamAt('basile', 6)],
  ['ph1b', teamAt('ph1b', 6)],
  ['buvard', teamAt('buvard', 6)],
  ['pc4', teamAt('basile', 6)],
  ['nocturne', teamAt('nocturne', 6)],
  ['rature2', teamAt('rature2', 6)],
  ['blanche2', teamAt('blanche2', 6)],
  // Act 4, beyond the margin, then the finale
  ['r9d', teamAt('r9d', 6)],
  ['es4', teamAt('es4', 6)],
  ['f2b', teamAt('f2b', 6)],
  ['buvard2', teamAt('buvard2', 6)],
  ['rature3', teamAt('rature3', 6)],
  ['blanche3', teamAt('blanche3', 6)],
  ['rivalFinal', teamAt('rivalFinal', 6)],
  ['effaceur', teamAt('effaceur', 6)],
  // post-game: the Grand Concours, each fight alone with a level 58 team
  ...CONCOURS.map((st): [string, Team] => [st.trainer.id, team(58, 6, 0)]),
];
const trainer = (id: string) => TRAINERS[id] ?? CONCOURS.find((st) => st.trainer.id === id)!.trainer;
/** The foe's team against this starter: the final rival picks the starter that beats yours. */
const foeParty = (id: string, starter: string) => (id === 'rivalFinal' ? rivalFinalTeam(RIVAL_COUNTER[starter]) : trainer(id).party);

/** Zélie gives the Feutre d'Or before her own battle. */
const feutre = STEPS.findIndex(([id]) => id === 'zelie');
/** Who makes a fair copy in this fight. */
const pensAt = (k: number, id: string): Pens => {
  const t = id === 'rivalFinal' ? { fairCopy: true as const } : trainer(id);
  return { me: k >= feutre ? 'light' : undefined, foe: t.fairCopy === 'dark' ? 'dark' : t.fairCopy ? 'light' : undefined };
};

console.log(`difficulty ${difficulty}, ${n} fights per cell — Minousse / Braisou / Clapotin`);
for (const [k, [id, t]] of STEPS.entries()) {
  if (only && !only.includes(id)) continue;
  const cells = ['001', '002', '003'].map((starter) => {
    const mk = (seed: number) => t.map(([sp, lv], i) => createMon(sp === 'S' ? grownForm(starter, lv) : sp, lv, { rng: seed * 13 + i }));
    const rate = winRate(mk, (seed) => partyOf(foeParty(id, starter), seed, difficulty), DIFFICULTY[difficulty].slip, n, pensAt(k, id));
    return `${Math.round(rate * 100)}%`.padStart(5);
  });
  const foe = foeParty(id, '001').map((m) => m.level).join('/');
  console.log(id.padEnd(10), `vs L${foe}`.padEnd(16), `team L${t.map((x) => x[1]).join('+')}`.padEnd(22), cells.join(' '));
}

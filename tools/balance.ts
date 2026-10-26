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
 * (post-game) use a level 50 team: each Grand Maître mostly won, the champion around 60–80%.
 */
import { act, createBattle, type Action, type BattleState } from '../src/engine/pk/battle.ts';
import { aiChoose } from '../src/engine/pk/ai.ts';
import { createMon, type Mon } from '../src/engine/pk/creature.ts';
import { DIFFICULTY, TRAINERS, partyOf } from '../src/data/trainers.ts';
import { grownForm } from '../src/data/creatures.ts';
import { CONCOURS } from '../src/data/postgame.ts';
import type { Difficulty } from '../src/state/prefs.ts';

type Team = [species: string, level: number][];

const L = (s: string) => ({ fr: s, en: s });

function winRate(player: (seed: number) => Mon[], enemy: (seed: number) => Mon[], slip: number, n: number): number {
  let wins = 0;
  for (let seed = 1; seed <= n; seed++) {
    let st = createBattle({
      kind: 'trainer',
      seed: seed * 7919,
      player: { name: L('player'), party: player(seed), isAI: false },
      enemy: { name: L('trainer'), party: enemy(seed), isAI: true },
    }).state;
    for (let guard = 0; !st.result && guard < 300; guard++) {
      let a: Action;
      if (st.learnQueue.length) a = { type: 'learn', forget: null };
      else if (st.needSwitch) a = { type: 'replace', to: st.sides[0].party.findIndex((m) => m.hp > 0) };
      else a = aiChoose({ ...st, sides: [st.sides[1], st.sides[0]] as BattleState['sides'] });
      st = act(st, a, aiChoose(st, slip)).state;
    }
    if (st.result === 'win') wins++;
  }
  return wins / n;
}

/** Starter ('S') at `lv`, then teammates a few levels below it. */
const MATES = ['013', '009', '004', '006', '007'];
function team(lv: number, size: number, gap = 3): Team {
  const mates = MATES.slice(0, size - 1).map((sp): [string, number] => [sp === '009' && lv - gap >= 16 ? '010' : sp, lv - gap]);
  return [['S', lv], ...mates];
}

// [trainer id, player team] in story order. Player levels follow a rough XP estimate: every trainer
// beaten plus a handful of wild fights per route, the starter taking a bit over half the XP.
const STEPS: [string, Team][] = [
  ['iris', [['S', 5]]],
  ['leo', [['S', 6]]],
  ['pastelT1', [['S', 7]]],
  ['pastelT2', [['S', 8]]],
  ['mireille', [['S', 9]]],
  ['mireille', [['S', 9], ['006', 6]]],
  ['pierrot', team(10, 2)],
  ['luna', team(11, 2)],
  ['gomme2', team(12, 2)],
  ['gaspard', team(14, 2)],
  ['max', team(14, 3)],
  ['tom', team(16, 3)],
  ['r3lise', team(17, 3)],
  ['marine', team(18, 4)],
  ['r4tim', team(19, 4)],
  ['rature', team(21, 4)],
  ['zelie', team(22, 5)],
  ['mfErmite', team(24, 5)],
  ['ambre', team(25, 5)],
  ['ambre', [['S', 25], ['003', 22], ['013', 22], ['010', 22], ['004', 22]]],
  ['celestine', team(32, 5)],
  ['blanche', team(33, 6)],
  ['basile', team(36, 6)],
  ['ph1b', team(38, 6)],
  ['buvard', team(38, 6)],
  ['pc4', team(37, 6)],
  ['nocturne', team(39, 6)],
  ['rature2', team(40, 6)],
  ['blanche2', team(40, 6)],
  ['effaceur', team(44, 6)],
  // post-game: the Grand Concours, each fight alone with a level 50 team
  ...CONCOURS.map((st): [string, Team] => [st.trainer.id, team(50, 6, 0)]),
];
const trainer = (id: string) => TRAINERS[id] ?? CONCOURS.find((st) => st.trainer.id === id)!.trainer;

const difficulty = (process.argv[2] ?? 'normal') as Difficulty;
const n = Number(process.argv[3] ?? 300);
if (!DIFFICULTY[difficulty]) throw new Error(`unknown difficulty ${difficulty} (easy | normal | hard)`);
console.log(`difficulty ${difficulty}, ${n} fights per cell — Minousse / Braisou / Clapotin`);
for (const [id, t] of STEPS) {
  const cells = ['001', '002', '003'].map((starter) => {
    const mk = (seed: number) => t.map(([sp, lv], i) => createMon(sp === 'S' ? grownForm(starter, lv) : sp, lv, { rng: seed * 13 + i }));
    const rate = winRate(mk, (seed) => partyOf(trainer(id).party, seed, difficulty), DIFFICULTY[difficulty].slip, n);
    return `${Math.round(rate * 100)}%`.padStart(5);
  });
  const foe = trainer(id).party.map((m) => m.level).join('/');
  console.log(id.padEnd(10), `vs L${foe}`.padEnd(16), `team L${t.map((x) => x[1]).join('+')}`.padEnd(22), cells.join(' '));
}

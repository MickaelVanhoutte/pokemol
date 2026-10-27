/**
 * npm run curve [-- easy|normal|hard]
 * The level curve along the story (src/data/curve.ts): for each trainer, its strongest Bestiole and the
 * levels a player's team has by then without grinding (starter / teammates), and how many wild battles
 * each route forces. `!` marks a trainer ahead of the starter (a leader more than one level ahead).
 */
import { curve } from '../src/data/curve.ts';
import type { Difficulty } from '../src/state/prefs.ts';

const difficulty = (process.argv[2] ?? 'normal') as Difficulty;
const { rows, wild } = curve(difficulty);
console.log(`difficulty ${difficulty} — trainer ace vs your team (starter / teammates)`);
let last = '';
for (const r of rows) {
  if (r.map !== last) {
    console.log(`${r.map}${wild[r.map] !== undefined ? `  (${wild[r.map]} wild battles on the way)` : ''}`);
    last = r.map;
  }
  const ahead = r.ace - r.starter > (r.leader ? 1 : 0);
  console.log(`  ${ahead ? '!' : ' '} ${r.trainer.padEnd(10)} ace L${String(r.ace).padEnd(3)} you L${r.starter}${r.mates.length ? ` / ${r.mates.join(' ')}` : ''}${r.leader ? '   ★ leader' : ''}`);
}

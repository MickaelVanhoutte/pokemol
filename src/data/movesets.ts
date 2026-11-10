import { creature } from './creatures';
import { ITEM_BY_ID } from './items';
import { move } from './moves';
import { NATURES } from './natures';
import { effectiveness, TYPES } from './types';
import type { MoveDef, TypeId } from './schema';

/**
 * Teams with a plan (roadmap milestone 5): Atelier Masters, admins, the rival and the post-game bring movesets
 * chosen like a player would, instead of the last four moves learnt.
 */

/** The moves a Bestiole of `species` can know at `level`: its learnset so far, and its stencils when `stencils`. */
export function knowable(species: string, level: number, stencils = false): string[] {
  const c = creature(species);
  const ids = c.learnset.filter(([l]) => l <= level).map(([, id]) => id);
  if (stencils) for (const s of c.stencils) {
    const id = ITEM_BY_ID[s]?.move;
    if (id) ids.push(id);
  }
  return [...new Set(ids)];
}

const ALL_TYPES = Object.keys(TYPES) as TypeId[];

/** What an attacking move is worth on its own: power, accuracy, hits, a two-turn wait. */
function hitValue(mv: MoveDef): number {
  let power = mv.power;
  for (const e of mv.effects ?? []) {
    if (e.kind === 'multi') power *= e.min === 2 && e.max === 5 ? 3 : (e.min + e.max) / 2;
    if (e.kind === 'charge') power *= 0.6;
    if (e.kind === 'onlyAsleep') power *= 0.2;
    if (e.kind === 'recoil') power *= 0.85;
  }
  return power * ((mv.acc ?? 100) / 100);
}

/** How useful a status move is in a trainer's hands (0: not worth a slot). */
function statusValue(mv: MoveDef, types: TypeId[]): number {
  let best = 0;
  for (const e of mv.effects ?? []) {
    const v = e.kind === 'status' ? (e.status === 'sleep' ? 100 : e.status === 'paralyze' ? 90 : e.status === 'burn' ? 70 : 60)
      : e.kind === 'toxic' ? 85
        : e.kind === 'stage' && e.target === 'self' && (e.stat === 'atk' || e.stat === 'spa' || e.stat === 'spe') ? 80 + 5 * e.stages
          : e.kind === 'seed' ? 65
            : e.kind === 'heal' || e.kind === 'rest' ? 70
              : e.kind === 'substitute' ? 55
                : e.kind === 'confuse' ? 50
                  : e.kind === 'weather' ? ((e.weather === 'pluie' && types.includes('eau')) || (e.weather === 'soleil' && (types.includes('feu') || types.includes('plante'))) ? 60 : 0)
                    : e.kind === 'hazard' ? 70
                      : e.kind === 'screen' ? 65
                        : e.kind === 'taunt' ? 55
                          : 0;
    best = Math.max(best, v * ((mv.acc ?? 100) / 100));
  }
  return best;
}

/**
 * A trainer's moveset with a plan: the best hit of each of its own types, the hit that covers most other types,
 * one status or set-up move worth a slot, then the next best hits. `stencils`: it may use its stencil moves.
 */
export function plannedMoves(species: string, level: number, stencils = false): string[] {
  const c = creature(species);
  const types: TypeId[] = c.type2 ? [c.type, c.type2] : [c.type];
  const moves = knowable(species, level, stencils).map(move);
  const hits = moves.filter((m) => m.cat !== 'status' && m.power > 0);
  const picked: MoveDef[] = [];
  const take = (m: MoveDef | undefined) => m && !picked.includes(m) && picked.length < 4 && picked.push(m);
  // 1. its own types
  for (const t of types) take(hits.filter((m) => m.type === t).sort((a, b) => hitValue(b) - hitValue(a))[0]);
  // 2. the hit that is strong against the most types its own can't hit hard
  const covered = (t: TypeId) => picked.some((m) => effectiveness(m.type, [t]) > 1);
  const reach = (m: MoveDef) => ALL_TYPES.filter((t) => !covered(t) && effectiveness(m.type, [t]) > 1).length;
  take(hits.filter((m) => !types.includes(m.type) && reach(m) > 0).sort((a, b) => reach(b) - reach(a) || hitValue(b) - hitValue(a))[0]);
  // 3. one status or set-up move, when it has hits enough
  const status = moves.filter((m) => m.cat === 'status' && statusValue(m, types) >= 50).sort((a, b) => statusValue(b, types) - statusValue(a, types))[0];
  if (picked.length >= 2) take(status);
  // 4. the next best hits, other types first
  const rest = hits.filter((m) => !picked.includes(m)).sort((a, b) => Number(picked.some((p) => p.type === a.type)) - Number(picked.some((p) => p.type === b.type)) || hitValue(b) - hitValue(a));
  for (const m of rest) take(m);
  // a Bestiole with few hits keeps its other moves
  for (const m of moves) take(m);
  return picked.map((m) => m.id);
}

/**
 * The nature a trainer gives a Bestiole: up the attacking stat its `moves` lean on (physical or special, by power;
 * its better one on a tie), down the other one.
 */
export function plannedNature(species: string, moves: string[] = []): string {
  const b = creature(species).base;
  const lean = moves.map(move).reduce((n, m) => n + (m.cat === 'phys' ? hitValue(m) : m.cat === 'spec' ? -hitValue(m) : 0), 0);
  const physical = lean > 0 || (lean === 0 && b.atk >= b.spa);
  const [up, down] = physical ? ['atk', 'spa'] : ['spa', 'atk'];
  return NATURES.find((n) => n.up === up && n.down === down)!.id;
}

/**
 * What happened to a move, read from the events after it: the animation only plays when the
 * move lands (as in the GBA games, a miss or a protected target shows no animation).
 */
import type { BattleEvent } from '../../../engine/pk/battle';

export interface Outcome {
  /** The move hit, or a status move did something. */
  lands: boolean;
  /** First turn of a two-turn move. */
  charge: boolean;
  hits: number;
  crit: boolean;
  /** Effectiveness of the first hit (1 when unknown). */
  eff: number;
}

/** Events showing that a status move worked. */
const EFFECTS = new Set<BattleEvent['t']>(['status', 'stage', 'heal', 'weather', 'protect', 'sub', 'seeded', 'confuse', 'rest', 'guarded', 'trapped']);
/** Events that stop a move before it does anything. */
const STOPS = new Set<BattleEvent['t']>(['miss', 'fail', 'noEffect', 'protected', 'already']);

/** `i` is the index of a `move` event in `events`. */
export function moveOutcome(events: BattleEvent[], i: number): Outcome {
  const out: Outcome = { lands: false, charge: false, hits: 0, crit: false, eff: 1 };
  let effect = false;
  for (let j = i + 1; j < events.length; j++) {
    const e = events[j];
    if (e.t === 'move' || e.t === 'end') break;
    if (e.t === 'charge') {
      out.charge = true;
      break;
    }
    if (!out.hits && !effect && (STOPS.has(e.t) || (e.t === 'talent' && e.note !== 'phased'))) return out;
    if (e.t === 'damage' || e.t === 'subHit') {
      out.hits++;
      if (e.crit) out.crit = true;
      if (out.hits === 1 && e.eff !== undefined) out.eff = e.eff;
    }
    if (EFFECTS.has(e.t)) effect = true;
  }
  out.lands = !out.charge && (out.hits > 0 || effect);
  return out;
}

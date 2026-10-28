import { move } from '../../data/moves';
import type { Mon } from '../../engine/pk/creature';
import { moveEffectiveness } from '../../engine/pk/battle';
import type { Difficulty } from '../../state/prefs';

/**
 * Easy and Normal: the move slots that hit the foe's weak spot (super effective), marked with a thumb on
 * the move buttons, once its species was met in an earlier battle (`fought`: the Bestiodex before this one).
 * The foe's types are its current ones, a fair copy's included.
 */
export function weakSpotSlots(user: Mon, foe: Mon, fought: readonly string[], difficulty: Difficulty): number[] {
  if (difficulty === 'hard' || !fought.includes(foe.species)) return [];
  return user.moves.flatMap((m, i) => {
    const mv = move(m.id);
    return mv.cat !== 'status' && moveEffectiveness(user, mv, foe) > 1 ? [i] : [];
  });
}

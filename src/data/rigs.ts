/**
 * How each Bestiole waits in battle (`BattleScene.tsx`): it breathes, or a flying one hovers on the spot.
 */
import { creature } from './creatures';

export type Idle = 'breathe' | 'hover' | 'still';

export function idleOf(species: string): Idle {
  const sp = creature(species);
  return sp.type === 'vol' || sp.type2 === 'vol' ? 'hover' : 'breathe';
}

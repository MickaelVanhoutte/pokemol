import { signal } from '@preact/signals';
import type { BattleProps } from '../ui/battle/BattleScreen';

export type Screen =
  | { id: 'title' }
  | { id: 'newgame' }
  | { id: 'overworld' }
  | { id: 'settings'; back: Screen }
  | { id: 'battle'; props: BattleProps }
  | { id: 'party' }
  | { id: 'bag' }
  | { id: 'dex'; all?: boolean }
  | { id: 'pc' }
  | { id: 'shop'; tower?: boolean }
  | { id: 'machine' }
  | { id: 'trainercard' }
  | { id: 'townmap' }
  | { id: 'hall'; fresh?: boolean }
  | { id: 'jukebox' }
  /** Sliding picture puzzle; `onEnd` gets whether it was solved. */
  | { id: 'fresque'; species: string; size: number; onEnd: (solved: boolean) => void }
  /** Memory card game; `onEnd` gets the number of tries, or null when given up. */
  | { id: 'memo'; onEnd: (tries: number | null) => void }
  | { id: 'credits'; fromWorld?: boolean };

export const screen = signal<Screen>({ id: 'title' });

export function go(next: Screen) {
  screen.value = next;
}

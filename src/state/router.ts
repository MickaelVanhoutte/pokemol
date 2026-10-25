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
  | { id: 'shop' }
  | { id: 'machine' }
  | { id: 'trainercard' }
  | { id: 'townmap' }
  | { id: 'credits'; fromWorld?: boolean };

export const screen = signal<Screen>({ id: 'title' });

export function go(next: Screen) {
  screen.value = next;
}

import { signal } from '@preact/signals';
import type { BattleProps } from '../ui/battle/BattleScreen';

export type Screen =
  | { id: 'title' }
  | { id: 'newgame' }
  | { id: 'overworld' }
  | { id: 'gallery' }
  | { id: 'settings'; back: Screen }
  | { id: 'battle'; props: BattleProps }
  | { id: 'collection'; back: Screen }
  | { id: 'shop' }
  | { id: 'gacha' }
  | { id: 'dungeon' }
  | { id: 'credits' };

export const screen = signal<Screen>({ id: 'title' });

export function go(next: Screen) {
  screen.value = next;
}

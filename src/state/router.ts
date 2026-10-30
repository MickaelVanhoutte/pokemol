import { signal } from '@preact/signals';
import type { BattleProps } from '../ui/battle/BattleScreen';
import type { CustomDesign } from '../data/custom';
import type { BalloonPick } from '../ui/views/TownMapView';

export type Screen =
  | { id: 'title' }
  | { id: 'newgame' }
  | { id: 'overworld' }
  | { id: 'settings'; back: Screen }
  | { id: 'battle'; props: BattleProps }
  | { id: 'party' }
  | { id: 'bag' }
  | { id: 'dex' }
  | { id: 'pc' }
  | { id: 'shop'; tower?: boolean }
  | { id: 'machine' }
  | { id: 'trainercard' }
  /** The Town Map; with `pick`, the Pencil Balloon's pilot asks where to fly. */
  | { id: 'townmap'; pick?: BalloonPick }
  /** The Pencil Balloon's trip over the Town Map, from one town to another. */
  | { id: 'flight'; from: string; to: string }
  | { id: 'hall'; fresh?: boolean }
  | { id: 'jukebox' }
  /** Sliding picture puzzle; `onEnd` gets whether it was solved. */
  | { id: 'fresque'; species: string; size: number; onEnd: (solved: boolean) => void }
  /** Memory card game; `onEnd` gets the number of tries, or null when given up. */
  | { id: 'memo'; onEnd: (tries: number | null) => void }
  | { id: 'credits'; fromWorld?: boolean }
  /** The ending's drawing on the last page of the sketchbook (1: Libellune, 2: Noctaile). */
  | { id: 'drawing'; ending: 1 | 2 }
  /** L'Atelier des Brouillons: the player's own Bestiole (`fresh`: start over); `onEnd` gets the design, or null. */
  | { id: 'atelier'; fresh?: boolean; onEnd: (d: CustomDesign | null) => void };

export const screen = signal<Screen>({ id: 'title' });

export function go(next: Screen) {
  screen.value = next;
}

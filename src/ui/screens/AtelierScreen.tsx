import { blankDesign, type CustomDesign } from '../../data/custom';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { AtelierView } from '../views/AtelierView';

/** The workshop, opened by la Dessinatrice (src/story/act4.ts): the saved design, or a blank one to start over. */
export function AtelierScreen({ fresh, onEnd }: { fresh?: boolean; onEnd: (d: CustomDesign | null) => void }) {
  const start = !fresh && save.value?.atelier ? save.value.atelier : blankDesign();
  const end = (d: CustomDesign | null) => {
    onEnd(d);
    backToWorld();
  };
  return <AtelierView design={start} onDone={end} onCancel={() => end(null)} />;
}

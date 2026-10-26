import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { HallView } from '../views/HallView';

export function HallScreen({ fresh }: { fresh?: boolean }) {
  return <HallView entries={save.value?.hallOfFame ?? []} fresh={fresh} onClose={backToWorld} />;
}
